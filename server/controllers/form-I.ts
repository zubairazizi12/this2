// controllers/rotationFormController.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import RotationForm from "../models/form-I";

// ✅ ایجاد فرم جدید
export const createRotationForm = async (req: Request, res: Response) => {
  try {
    const { trainerId, header, persianRows, persianNote, rows } = req.body;

    if (!trainerId) {
      return res.status(400).json({ message: "TrainerId الزامی است" });
    }

    // اطمینان از معتبر بودن ID
    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      return res.status(400).json({ message: "TrainerId معتبر نیست" });
    }

     // ✅ بررسی وجود فرم قبلی
     const existingForm = await RotationForm.findOne({ trainerId });
     if (existingForm) {
       return res.status(400).json({ message: "این فرم برای این ترینر قبلاً ثبت شده است." });
     }

    const newForm = new RotationForm({
      trainerId: new mongoose.Types.ObjectId(trainerId),
      header,
      persianRows,
      persianNote,
      rows,
    });

    const savedForm = await newForm.save();
    res.status(201).json({ message: "✅ فرم ذخیره شد", data: savedForm });
  } catch (err) {
    console.error("❌ خطا در ذخیره فرم:", err);
    res.status(500).json({ message: "خطای ناشناخته در هنگام ذخیره" });
  }
};

// ✅ گرفتن همه فرم‌های یک ترینر
export const getRotationForms = async (req: Request, res: Response) => {
  try {
    const { trainerId } = req.params;

    if (!trainerId) {
      return res.status(400).json({ message: "TrainerId الزامی است" });
    }

    const forms = await RotationForm.find({
      trainerId: new mongoose.Types.ObjectId(trainerId),
    }).sort({ createdAt: -1 });

    res.json(forms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ خطا در گرفتن فرم‌ها" });
  }
};

// ✅ گرفتن فرم با ID خاص
export const getRotationFormById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const form = await RotationForm.findById(id);
    if (!form) return res.status(404).json({ message: "فرم یافت نشد" });
    res.json(form);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطا در دریافت فرم" });
  }
};

// ✅ ویرایش فرم
export const updateRotationForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!data.trainerId) {
      return res.status(400).json({ message: "TrainerId الزامی است" });
    }

    const updatedForm = await RotationForm.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updatedForm) return res.status(404).json({ message: "فرم یافت نشد" });

    res.json({ message: "✅ فرم بروزرسانی شد", form: updatedForm });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ خطا در بروزرسانی فرم" });
  }
};
