import { Request, Response } from "express";
import {RotationFormR} from "../models/form-R";

// ✅ ایجاد فرم جدید
export const createRotationFormR = async (req: Request, res: Response) => {
  try {
    const formData = req.body;

    if (!formData.name || !formData.from || !formData.to) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    const newForm = new RotationFormR(formData);
    await newForm.save();

    res.status(201).json({
      message: "Rotation Form R created successfully.",
      data: newForm,
    });
  } catch (error) {
    console.error("Error creating RotationFormR:", error);
    res.status(500).json({ message: "Server error while creating form." });
  }
};

// ✅ دریافت فرم بر اساس formId
export const getRotationFormRById = async (req: Request, res: Response) => {
  try {
    const { formId } = req.params;

    // 📦 lean() برای سرعت بیشتر و حذف متدهای Mongoose
    const form = await RotationFormR.findById(formId).lean();

    if (!form) {
      return res.status(404).json({ message: "فرم Rotation R یافت نشد." });
    }

    res.status(200).json(form);
  } catch (error) {
    console.error("❌ خطا در دریافت فرم Rotation R:", error);
    res.status(500).json({
      message: "خطا در دریافت فرم Rotation R.",
      error: error instanceof Error ? error.message : error,
    });
  }
};


// ✅ دریافت فرم بر اساس trainerId
export const getRotationFormRByTrainerId = async (req: Request, res: Response) => {
  try {
    const { trainerId } = req.params;

    const form = await RotationFormR.find({ trainerId }).sort({ createdAt: -1 });

    if (!form || form.length === 0) {
      return res.status(404).json({ message: "فرم برای این ترینر موجود نیست" });
    }

    res.status(200).json(form);
  } catch (error) {
    console.error("Error fetching form by trainerId:", error);
    res.status(500).json({ message: "Server error while fetching form." });
  }
};


// ✅ ویرایش فرم
export const updateRotationFormRByTrainerId = async (req: Request, res: Response) => {
  try {
    const { trainerId } = req.params;
    const updatedData = req.body;

    const updatedForm = await RotationFormR.findOneAndUpdate(
      { trainerId },
      updatedData,
      { new: true }
    );

    if (!updatedForm) return res.status(404).json({ message: "Form not found for update." });

    res.status(200).json({ message: "Rotation Form R updated successfully.", data: updatedForm });
  } catch (error) {
    console.error("Error updating form:", error);
    res.status(500).json({ message: "Server error while updating form." });
  }
};


// ✅ حذف فرم
export const deleteRotationFormR = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedForm = await RotationFormR.findByIdAndDelete(id);

    if (!deletedForm) {
      return res.status(404).json({ message: "Form not found for deletion." });
    }

    res.status(200).json({ message: "Rotation Form R deleted successfully." });
  } catch (error) {
    console.error("Error deleting form:", error);
    res.status(500).json({ message: "Server error while deleting form." });
  }
};
