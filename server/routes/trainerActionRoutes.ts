import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { TrainerAction } from "../models/trainerAction";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads", "trainer-actions");
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
    const { trainerId, description } = req.body;
    const uploadedFiles = req.files as Express.Multer.File[];

    if (!trainerId || !description) {
      return res.status(400).json({ message: "شناسه ترینر و توضیحات الزامی است" });
    }

    const files = uploadedFiles?.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
    })) || [];

    const newAction = new TrainerAction({
      trainer: trainerId,
      description,
      files,
    });

    const savedAction = await newAction.save();
    res.status(201).json(savedAction);
  } catch (error) {
    console.error("Error creating trainer action:", error);
    res.status(500).json({ message: "خطا در ثبت اکشن" });
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
    
    const actions = await TrainerAction.find({ trainer: trainerId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(actions);
  } catch (error) {
    console.error("Error fetching trainer actions:", error);
    res.status(500).json({ message: "خطا در دریافت اکشن‌ها" });
  }
});

router.delete("/:actionId", async (req: Request, res: Response) => {
  try {
    const { actionId } = req.params;
    
    const action = await TrainerAction.findById(actionId);
    
    if (!action) {
      return res.status(404).json({ message: "اکشن یافت نشد" });
    }

    if (action.files && action.files.length > 0) {
      action.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    await TrainerAction.findByIdAndDelete(actionId);

    res.status(200).json({ message: "اکشن حذف شد" });
  } catch (error) {
    console.error("Error deleting trainer action:", error);
    res.status(500).json({ message: "خطا در حذف اکشن" });
  }
});

export { router as trainerActionRoutes };
