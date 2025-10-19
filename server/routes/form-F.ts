import express, { Request, Response } from "express";
import mongoose from "mongoose";
import Checklist, { IChecklist } from "../models/form-F";

const router = express.Router();

// 🔹 ذخیره Form-F برای یک ترینر مشخص
router.post("/", async (req: Request, res: Response) => {
  try {
    const { trainerId, name, parentType, trainingYear, sections } = req.body;

    if (!trainerId)
      return res.status(400).json({ error: "TrainerId الزامی است" });

    const existing = await Checklist.findOne({
      trainerId: new mongoose.Types.ObjectId(trainerId),
    });
    if (existing) {
      return res.status(400).json({
        error: "این ترینر قبلاً یک فرم F دارد و نمی‌تواند دوباره ایجاد کند",
      });
    }

    const form: IChecklist = new Checklist({
      trainerId: new mongoose.Types.ObjectId(trainerId),
      name,
      parentType,
      trainingYear,
      sections,
    });

    await form.save();
    res.status(201).json({ message: "✅ فرم ذخیره شد", id: form._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ خطا در ذخیره فرم" });
  }
});

// 🔹 گرفتن لیست فرم‌های یک ترینر مشخص
router.get("/", async (req: Request, res: Response) => {
  try {
    const trainerId = req.query.trainerId as string;

    if (!trainerId)
      return res.status(400).json({ error: "TrainerId الزامی است" });

    const forms = await Checklist.find({
      trainerId: new mongoose.Types.ObjectId(trainerId),
    }).sort({ createdAt: -1 });

    res.json(forms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ خطا در گرفتن فرم‌ها" });
  }
});

// 🔹 گرفتن فرم خاص با آیدی
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const form = await Checklist.findById(id);
    if (!form) return res.status(404).json({ error: "فرم یافت نشد" });
    res.json(form);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ خطا در دریافت فرم" });
  }
});

// 🔹 ویرایش فرم (Update)
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await Checklist.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updated) return res.status(404).json({ error: "فرم یافت نشد" });

    res.json({ message: "✅ تغییرات ذخیره شد", data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ خطا در ذخیره تغییرات" });
  }
});

// 🔹 حذف فرم
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Checklist.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "فرم یافت نشد" });
    res.json({ message: "✅ فرم با موفقیت حذف شد" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ خطا در حذف فرم" });
  }
});

export default router;
