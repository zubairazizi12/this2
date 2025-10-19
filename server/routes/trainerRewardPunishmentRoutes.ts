import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { TrainerRewardPunishment } from "../models/trainerRewardPunishment";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads", "trainer-reward-punishment");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/", upload.array("files", 10), async (req: Request, res: Response) => {
  try {
    const { trainerId, type, description } = req.body;
    const uploadedFiles = req.files as Express.Multer.File[];

    if (!trainerId || !type || !description) {
      return res.status(400).json({ message: "شناسه ترینر، نوع و توضیحات الزامی است" });
    }

    if (type !== "reward" && type !== "punishment") {
      return res.status(400).json({ message: "نوع باید reward یا punishment باشد" });
    }

    const files = uploadedFiles?.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
    })) || [];

    const newRecord = new TrainerRewardPunishment({
      trainer: trainerId,
      type,
      description,
      files,
    });

    const savedRecord = await newRecord.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    console.error("Error creating reward/punishment:", error);
    res.status(500).json({ message: "خطا در ثبت مجازات/مکافات" });
  }
});

router.get("/download/:filename", (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ message: "نام فایل نامعتبر است" });
    }

    const filePath = path.join(uploadDir, filename);
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadDir = path.resolve(uploadDir);

    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      return res.status(403).json({ message: "دسترسی غیرمجاز" });
    }

    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ message: "فایل یافت نشد" });
    }

    res.download(resolvedPath);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ message: "خطا در دانلود فایل" });
  }
});

router.get("/:trainerId", async (req: Request, res: Response) => {
  try {
    const { trainerId } = req.params;
    
    const records = await TrainerRewardPunishment.find({ trainer: trainerId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching reward/punishment records:", error);
    res.status(500).json({ message: "خطا در دریافت سوابق" });
  }
});

router.delete("/:recordId", async (req: Request, res: Response) => {
  try {
    const { recordId } = req.params;
    
    const record = await TrainerRewardPunishment.findById(recordId);
    
    if (!record) {
      return res.status(404).json({ message: "رکورد یافت نشد" });
    }

    if (record.files && record.files.length > 0) {
      record.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    await TrainerRewardPunishment.findByIdAndDelete(recordId);

    res.status(200).json({ message: "رکورد حذف شد" });
  } catch (error) {
    console.error("Error deleting record:", error);
    res.status(500).json({ message: "خطا در حذف رکورد" });
  }
});

export { router as trainerRewardPunishmentRoutes };
