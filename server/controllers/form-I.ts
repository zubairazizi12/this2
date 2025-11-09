import {RotationFormModel} from "../models/form-I";
import { Request, Response } from "express";
import  { IRotationForm } from "../models/form-I";

// ✅ ایجاد فرم جدید Rotation
export const createRotationForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const formData: IRotationForm = req.body;

    const newForm = new RotationFormModel(formData);
    const savedForm = await newForm.save();

    res.status(201).json({
      success: true,
      message: "Rotation form created successfully",
      data: savedForm,
    });
  } catch (error: any) {
    console.error("Error creating rotation form:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create rotation form",
      error: error.message,
    });
  }
};

// ✅ دریافت تمام فرم‌ها
export const getRotationFormById = async (req: Request, res: Response) => {
  try {
    const { formId } = req.params;

    // 🔹 پیدا کردن فرم بر اساس ID
    const form = await RotationFormModel.findById(formId).lean();

    if (!form) {
      return res.status(404).json({ message: "فرم Rotation یافت نشد" });
    }

    // ✅ اگر فرم پیدا شد، برگردان
    res.json(form);
  } catch (err) {
    console.error("❌ Error fetching Rotation form:", err);
    res.status(500).json({ message: "خطا در دریافت فرم Rotation" });
  }
};


// ✅ دریافت فرم بر اساس trainerId
export const getRotationFormByTrainer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { trainerId } = req.params;
    const form = await RotationFormModel.findOne({ trainerId });

    if (!form) {
      res.status(404).json({ success: false, message: "این فرم برای این ترینر موجود نیست" });
      return;
    }

    res.status(200).json({ success: true, data: form });
  } catch (error: any) {
    console.error("Error fetching rotation form by trainerId:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت فرم ترینر",
      error: error.message,
    });
  }
};


export const updateRotationFormByTrainer = async (req: Request, res: Response) => {
  try {
    const { trainerId } = req.params;
    const updates: Partial<IRotationForm> = req.body;

    const updatedForm = await RotationFormModel.findOneAndUpdate(
      { trainerId },
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedForm) {
      res.status(404).json({ success: false, message: "فرم برای این ترینر موجود نیست" });
      return;
    }

    res.status(200).json({ success: true, message: "فرم بروزرسانی شد", data: updatedForm });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "خطا در به‌روزرسانی فرم", error: error.message });
  }
};


// ✅ حذف فرم با ID
export const deleteRotationForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedForm = await RotationFormModel.findByIdAndDelete(id);

    if (!deletedForm) {
      res.status(404).json({ success: false, message: "Rotation form not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Rotation form deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete rotation form",
      error: error.message,
    });
  }
};
