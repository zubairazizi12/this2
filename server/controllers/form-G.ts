// controllers/evaluationFormGController.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import { EvaluationFormG } from "../models/form-G";

export class EvaluationFormGController {
  // 🔹 ایجاد فرم جدید
  static async create(req: Request, res: Response) {
    try {
      const { trainer, personalInfo, scores } = req.body;
      const trainingYear = personalInfo?.trainingYear;

      if (!trainer) {
        return res.status(400).json({ message: "Trainer ID الزامی است" });
      }
      if (!personalInfo || !scores) {
        return res.status(400).json({ message: "اطلاعات کامل فرم الزامی است" });
      }
      if (!trainingYear) {
        return res.status(400).json({ message: "سال ترینینگ الزامی است" });
      }

      // محاسبه میانگین کل
      const filledRows = scores.slice(0, 5);
      const totalSum = filledRows.reduce(
        (sum: number, row: any) => sum + (Number(row.total) || 0),
        0
      );
      const averageScore = totalSum / filledRows.length;

      // جلوگیری از تکرار فرم برای یک ترینر در همان سال
      const existingForm = await EvaluationFormG.findOne({
        trainer: new mongoose.Types.ObjectId(trainer),
        "personalInfo.trainingYear": trainingYear.toString().trim(),
      });

      if (existingForm) {
        return res.status(400).json({
          message:
            "⚠️ این ترینر قبلاً برای این سال فرم مونوگراف را ثبت کرده است. لطفاً ترینی را ارتقا دهید.",
          formId: existingForm._id,
        });
      }

      const form = new EvaluationFormG({
        trainer: new mongoose.Types.ObjectId(trainer),
        personalInfo,
        scores,
        averageScore,
      });

      await form.save();
      res.status(201).json({ message: "✅ فرم با موفقیت ذخیره شد", form });
    } catch (err) {
      console.error("❌ Error saving EvaluationFormG:", err);
      res.status(500).json({ message: "خطا در ذخیره فرم", error: err });
    }
  }

  // 🔹 دریافت همه فرم‌ها یا فیلتر بر اساس trainerId
  static async getAll(req: Request, res: Response) {
    try {
      const { trainerId } = req.query;
      const filter = trainerId
        ? { trainer: new mongoose.Types.ObjectId(trainerId as string) }
        : {};

      const forms = await EvaluationFormG.find(filter)
        .populate("trainer")
        .sort({ createdAt: -1 });

      res.status(200).json(forms);
    } catch (err) {
      console.error("❌ Error fetching EvaluationFormG:", err);
      res.status(500).json({ message: "خطا در دریافت فرم‌ها", error: err });
    }
  }

  // 🔹 دریافت فرم بر اساس ID
  static async getById(req: Request, res: Response) {
    try {
      const form = await EvaluationFormG.findById(req.params.id).populate(
        "trainer"
      );
      if (!form) return res.status(404).json({ message: "فرم پیدا نشد" });
      res.json(form);
    } catch (err) {
      console.error("❌ Error fetching EvaluationFormG:", err);
      res.status(500).json({ message: "خطا در دریافت فرم", error: err });
    }
  }

  // 🔹 بروزرسانی فرم بر اساس ID
  static async update(req: Request, res: Response) {
    try {
      const updated = await EvaluationFormG.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: "فرم پیدا نشد" });
      res.json({ message: "✅ فرم بروزرسانی شد", updated });
    } catch (err) {
      console.error("❌ Error updating EvaluationFormG:", err);
      res.status(500).json({ message: "خطا در بروزرسانی فرم", error: err });
    }
  }

  // 🔹 حذف فرم بر اساس ID
  static async delete(req: Request, res: Response) {
    try {
      const deleted = await EvaluationFormG.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "فرم پیدا نشد" });
      res.json({ message: "✅ فرم با موفقیت حذف شد" });
    } catch (err) {
      console.error("❌ Error deleting EvaluationFormG:", err);
      res.status(500).json({ message: "خطا در حذف فرم", error: err });
    }
  }
}
