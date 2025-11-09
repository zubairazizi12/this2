import { ChecklistModel } from './../models/form-F';
import { Request, Response } from "express";
import { IChecklist } from "../models/form-F";
import mongoose from 'mongoose';


// ایجاد چک‌لیست جدید
export const createChecklist = async (req: Request, res: Response) => {
  try {
    const data: IChecklist = req.body;

    if (!data.trainerId || !data.name || !data.trainingYear) {
      return res.status(400).json({ message: "اطلاعات اجباری ناقص است!" });
    }

    

     // 🔹 جلوگیری از ثبت فرم تکراری بر اساس trainerId و trainingYear
     const existingForm = await ChecklistModel.findOne({
      trainerId: new mongoose.Types.ObjectId(data.trainerId),
      trainingYear: data.trainingYear.toString().trim(),
    });

    if (existingForm) {
      return res.status(400).json({
        message:
          "⚠ این ترینر قبلاً برای این سال چک‌لیست ثبت کرده است. لطفاً سال آموزشی را ارتقا دهید.",
        formId: existingForm._id,
      });
    }

    const checklist = new ChecklistModel(data);
    await checklist.save();


    return res.status(201).json({ message: "چک‌لیست با موفقیت ذخیره شد!", checklist });
  } catch (err) {
    console.error("Error creating checklist:", err);
    return res.status(500).json({ message: "خطا در ذخیره چک‌لیست" });
  }
};

// دریافت تمام چک‌لیست‌ها
export const getChecklists = async (req: Request, res: Response) => {
  try {
    const checklists = await ChecklistModel.find();
    return res.status(200).json(checklists);
  } catch (err) {
    console.error("Error fetching checklists:", err);
    return res.status(500).json({ message: "خطا در دریافت چک‌لیست‌ها" });
  }
};

//////
export const getChecklistFormById = async (req: Request, res: Response) => {
  try {
    const { formId } = req.params;

    const form = await ChecklistModel.findById(formId).lean();

    if (!form) {
      return res.status(404).json({ message: "فرم F (Checklist) یافت نشد" });
    }

    res.json(form);
  } catch (err) {
    console.error("❌ Error fetching Checklist:", err);
    res.status(500).json({ message: "خطا در دریافت فرم Checklist" });
  }
};



export const getChecklistByTrainer = async (req: Request, res: Response) => {
  try {
    const { trainerId } = req.params;
    const { year } = req.query; // 👈 سال را از کوئری بگیر
    const query: any = { trainerId };
    if (year) query.trainingYear = year; // 👈 اضافه شد

    const checklist = await ChecklistModel.findOne(query);
    if (!checklist) return res.status(404).json({ message: "چک‌لیست یافت نشد" });
    return res.status(200).json(checklist);
  } catch (err) {
    console.error("Error fetching checklist:", err);
    return res.status(500).json({ message: "خطا در دریافت چک‌لیست" });
  }
};

// ✅ ویرایش چک‌لیست بر اساس trainerId
export const updateChecklistByTrainer = async (req: Request, res: Response) => {
  try {
    const { trainerId } = req.params;
    const updatedData: Partial<IChecklist> = req.body;

    // پیدا کردن چک‌لیست
    const checklist = await ChecklistModel.findOne({ trainerId });
    if (!checklist) {
      return res.status(404).json({ message: "چک‌لیست برای این ترینر یافت نشد!" });
    }

    // به‌روزرسانی مقادیر
    Object.assign(checklist, updatedData);

    // ذخیره تغییرات
    await checklist.save();

    return res.status(200).json({
      message: "✅ چک‌لیست با موفقیت به‌روزرسانی شد!",
      checklist,
    });
  } catch (err) {
    console.error("Error updating checklist:", err);
    return res.status(500).json({ message: "خطا در به‌روزرسانی چک‌لیست" });
  }
};
