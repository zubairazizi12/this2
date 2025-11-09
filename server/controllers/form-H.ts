// controllers/evaluationFormHController.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import { EvaluationFormH } from "../models/form-H";

export class EvaluationFormHController {
  // 🔹 ایجاد فرم جدید
  static async create(req: Request, res: Response) {
    try {
      const {
        trainer,
        Name,
        parentType,
        department,
        trainingYear,
        trainingYears,
        averageScore,
        shiftDepartment,
        programDirector,
      } = req.body;

      // 🧩 بررسی ورودی‌ها
      if (!trainer) {
        return res.status(400).json({ message: "Trainer ID الزامی است" });
      }
      if (!trainingYear) {
        return res.status(400).json({ message: "سال ترینینگ الزامی است" });
      }

      // 🔹 جلوگیری از ثبت فرم تکراری (ترینی + سال)
      const existingYearForm = await EvaluationFormH.findOne({
        trainer: new mongoose.Types.ObjectId(trainer),
        trainingYear: trainingYear.trim(),
      });

      if (existingYearForm) {
        return res.status(400).json({
          message:
            "⚠️ این ترینی قبلاً برای این سال فرم Evaluation Form H را ثبت کرده است. لطفاً ترینی را ارتقا دهید.",
          formId: existingYearForm._id,
        });
      }

      // 🔹 ایجاد فرم جدید
      const form = new EvaluationFormH({
        trainer: new mongoose.Types.ObjectId(trainer),
        Name,
        parentType,
        department,
        trainingYear: trainingYear.trim(),
        trainingYears,
        averageScore,
        shiftDepartment,
        programDirector,
      });

      // 🔹 ذخیره فرم با هندلینگ دقیق خطاها
      try {
        await form.save();
        return res
          .status(201)
          .json({ message: "✅ فرم با موفقیت ذخیره شد", form });
      } catch (saveErr: any) {
        console.error("❌ خطا هنگام ذخیره فرم EvaluationFormH:", saveErr);

        // اگر خطا از نوع Mongo Duplicate Key بود
        if (saveErr.code === 11000) {
          return res.status(400).json({
            message:
              "⚠️ فرم تکراری برای این ترینر و سال یافت شد. لطفاً ترینی را ارتقا دهید.",
          });
        }

        // سایر خطاها
        return res
          .status(500)
          .json({ message: "❌ خطا در ذخیره فرم", error: saveErr.message });
      }
    } catch (err) {
      console.error("❌ Error saving EvaluationFormH:", err);
      return res.status(500).json({
        message: "❌ خطای غیرمنتظره در ذخیره فرم",
        error: (err as any).message,
      });
    }
  }

  // 🔹 دریافت همه فرم‌ها (با فیلتر اختیاری trainerId)
  static async getAll(req: Request, res: Response) {
    try {
      const { trainerId } = req.query;
      const filter = trainerId
        ? { trainer: new mongoose.Types.ObjectId(trainerId as string) }
        : {};

      const forms = await EvaluationFormH.find(filter)
        .populate("trainer")
        .sort({ createdAt: -1 });

      return res.status(200).json(forms);
    } catch (err) {
      console.error("❌ Error fetching EvaluationFormH:", err);
      return res.status(500).json({
        message: "خطا در دریافت فرم‌ها",
        error: (err as any).message,
      });
    }
  }

  // 🔹 دریافت فرم بر اساس ID
  static async getById(req: Request, res: Response) {
    try {
      const form = await EvaluationFormH.findById(req.params.id).populate(
        "trainer"
      );
      if (!form)
        return res.status(404).json({ message: "⚠️ فرم پیدا نشد." });
      return res.json(form);
    } catch (err) {
      console.error("❌ Error fetching EvaluationFormH by ID:", err);
      return res.status(500).json({
        message: "خطا در دریافت فرم",
        error: (err as any).message,
      });
    }
  }

  // 🔹 بروزرسانی فرم بر اساس ID
  static async update(req: Request, res: Response) {
    try {
      const updated = await EvaluationFormH.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!updated)
        return res.status(404).json({ message: "⚠️ فرم پیدا نشد." });

      return res.json({ message: "✅ فرم بروزرسانی شد", updated });
    } catch (err) {
      console.error("❌ Error updating EvaluationFormH:", err);
      return res.status(500).json({
        message: "خطا در بروزرسانی فرم",
        error: (err as any).message,
      });
    }
  }

  // 🔹 حذف فرم بر اساس ID
  static async delete(req: Request, res: Response) {
    try {
      const deleted = await EvaluationFormH.findByIdAndDelete(req.params.id);
      if (!deleted)
        return res.status(404).json({ message: "⚠️ فرم پیدا نشد." });

      return res.json({ message: "✅ فرم با موفقیت حذف شد" });
    } catch (err) {
      console.error("❌ Error deleting EvaluationFormH:", err);
      return res.status(500).json({
        message: "خطا در حذف فرم",
        error: (err as any).message,
      });
    }
  }
}
