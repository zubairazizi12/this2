// controllers/teacherActivityController.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import { TeacherActivityModel } from "../models/form-J";

// ✅ ایجاد فرم جدید
export const createTeacherActivity = async (req: Request, res: Response) => {
  try {
    const { trainerId, name, parentType, trainingYear, teachers, activities } = req.body;

    if (!trainerId || !name || !parentType || !trainingYear || !teachers || !activities) {
      return res.status(400).json({ message: "تمام فیلدها الزامی‌اند" });
    }

    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      return res.status(400).json({ message: "TrainerId معتبر نیست" });
    }

    // ✅ بررسی وجود فرم قبلی همان ترینر
    const existingForm = await TeacherActivityModel.findOne({ trainerId });
    if (existingForm) {
      return res.status(400).json({ message: "این فرم برای این ترینر قبلاً ثبت شده است." });
    }

    const newForm = new TeacherActivityModel({
      trainerId: new mongoose.Types.ObjectId(trainerId),
      name,
      parentType,
      trainingYear,
      teachers,
      activities,
    });

    const savedForm = await newForm.save();
    res.status(201).json({ message: "✅ فرم ذخیره شد", form: savedForm });
  } catch (err) {
    console.error("❌ خطا در ذخیره فرم:", err);
    res.status(500).json({ message: "خطای ناشناخته در هنگام ذخیره", error: err });
  }
};

// ✅ دریافت یک فرم برای یک ترینر
export const getSingleTeacherActivityByTrainer = async (req: Request, res: Response) => {
  try {
    const { trainerId } = req.params;

    if (!trainerId)
      return res.status(400).json({ message: "TrainerId الزامی است" });

    // ✅ فقط اولین فرم ثبت شده برای این ترینر
    const form = await TeacherActivityModel.findOne({
      trainerId: new mongoose.Types.ObjectId(trainerId),
    }).sort({ createdAt: -1 });

    if (!form)
      return res.status(404).json({ message: "فرمی برای این ترینر موجود نیست" });

    res.json(form);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ خطا در گرفتن فرم", error: err });
  }
};


// ✅ دریافت فرم با ID خاص
export const getTeacherActivityById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const form = await TeacherActivityModel.findById(id);
    if (!form) return res.status(404).json({ message: "فرم یافت نشد" });
    res.json(form);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ خطا در دریافت فرم", error: err });
  }
};

// ✅ ویرایش فرم
export const updateTeacherActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!data.trainerId) return res.status(400).json({ message: "TrainerId الزامی است" });

    const updatedForm = await TeacherActivityModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    if (!updatedForm) return res.status(404).json({ message: "فرم یافت نشد" });

    res.json({ message: "✅ فرم بروزرسانی شد", form: updatedForm });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ خطا در بروزرسانی فرم", error: err });
  }
};

// ✅ حذف فرم
export const deleteTeacherActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await TeacherActivityModel.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "فرم پیدا نشد" });
    res.json({ message: "✅ فرم با موفقیت حذف شد" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ خطا در حذف فرم", error: err });
  }
};
