import { Request, Response } from "express";
import TrainerModel from "../models/trainerModel";
import multer from "multer";
import path from "path";
import fs from "fs";

// 🟢 تنظیم مسیر و نام فایل‌ها
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/trainers");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, filename);
  },
});

// 🟢 محدود کردن نوع فایل به تصاویر
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("فقط فایل‌های تصویری مجاز هستند"));
  }
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // حداکثر 5MB

// 🟢 کنترلر
export const TrainerController = {
  // ➕ ایجاد ترینر جدید با عکس
  createTrainer: async (req: Request, res: Response) => {
    try {
      const { file } = req; // فایل عکس
      const data = req.body;

      // افزودن مسیر عکس به داده‌ها
      if (file) {
        data.photo = `/uploads/trainers/${file.filename}`;
      }

      // اعتبارسنجی اولیه
      const { name, lastName, province, department, specialty } = data;
      if (!name || !lastName || !province || !department || !specialty) {
        return res.status(400).json({
          message: "لطفاً تمام فیلدهای ضروری (نام، تخلص، ولایت، دیپارتمنت، رشته) را تکمیل کنید",
        });
      }

      // بررسی ایمیل تکراری
      if (data.email) {
        const existing = await TrainerModel.findOne({ email: data.email });
        if (existing) {
          return res.status(409).json({ message: "این ایمیل قبلاً ثبت شده است" });
        }
      }

      const newTrainer = await TrainerModel.create(data);
      res.status(201).json({
        message: "ترینر با موفقیت ایجاد شد",
        data: newTrainer,
      });
    } catch (error) {
      console.error("❌ Error creating trainer:", error);
      res.status(500).json({ message: "خطا در ثبت ترینر" });
    }
  },

  // 📋 دریافت لیست تمام ترینرها
  getAllTrainers: async (_req: Request, res: Response) => {
    try {
      const trainers = await TrainerModel.find().sort({ createdAt: -1 });
      res.status(200).json(trainers);
    } catch (error) {
      console.error("❌ Error fetching trainers:", error);
      res.status(500).json({ message: "خطا در دریافت ترینرها" });
    }
  },

  // 🔍 دریافت یک ترینر بر اساس ID
  getTrainerById: async (req: Request, res: Response) => {
    try {
      const trainer = await TrainerModel.findById(req.params.id);
      if (!trainer) {
        return res.status(404).json({ message: "ترینر یافت نشد" });
      }
      res.status(200).json(trainer);
    } catch (error) {
      console.error("❌ Error fetching trainer by ID:", error);
      res.status(500).json({ message: "خطا در دریافت ترینر" });
    }
  },

  // ✏️ بروزرسانی ترینر با امکان تغییر عکس
  updateTrainer: async (req: Request, res: Response) => {
    try {
      const { file } = req;
      const data = req.body;

      // اگر عکس جدید ارسال شده باشد، مسیر جدید را جایگزین کن
      if (file) {
        data.photo = `/uploads/trainers/${file.filename}`;
      }

      const updatedTrainer = await TrainerModel.findByIdAndUpdate(
        req.params.id,
        data,
        { new: true, runValidators: true }
      );

      if (!updatedTrainer) {
        return res.status(404).json({ message: "ترینر یافت نشد" });
      }

      res.status(200).json({
        message: "ترینر با موفقیت بروزرسانی شد",
        data: updatedTrainer,
      });
    } catch (error) {
      console.error("❌ Error updating trainer:", error);
      res.status(500).json({ message: "خطا در بروزرسانی ترینر" });
    }
  },

  // 🗑️ حذف ترینر
  deleteTrainer: async (req: Request, res: Response) => {
    try {
      const deletedTrainer = await TrainerModel.findByIdAndDelete(req.params.id);
      if (!deletedTrainer) {
        return res.status(404).json({ message: "ترینر یافت نشد" });
      }

      // حذف فایل عکس از سرور (در صورت وجود)
      if (deletedTrainer.photo) {
        const photoPath = path.join(__dirname, "..", deletedTrainer.photo);
        if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
      }

      res.status(200).json({ message: "ترینر با موفقیت حذف شد" });
    } catch (error) {
      console.error("❌ Error deleting trainer:", error);
      res.status(500).json({ message: "خطا در حذف ترینر" });
    }
  },
};
