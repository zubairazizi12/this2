// controllers/monographEvaluationController.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import { MonographEvaluation } from "../models/form-K";

export class MonographEvaluationController {
  // 🔹 ایجاد فرم جدید
  static async create(req: Request, res: Response) {
    try {
      const {
        trainer,
        name,
        lastName,
        parentType,
        idNumber,
        department,
        trainingYear,
        startYear,
        date,
        evaluations,
        summary, // 🔹 اضافه شد
      } = req.body;

      if (!trainer) {
        return res.status(400).json({ message: "Trainer ID الزامی است" });
      }

      // 🔹 جلوگیری از ثبت فرم تکراری بر اساس سال ترینینگ برای همان ترینر
      const existingYearForm = await MonographEvaluation.findOne({
        trainer: new mongoose.Types.ObjectId(trainer),
        trainingYear: trainingYear.toString().trim(),
      });

      if (existingYearForm) {
        return res.status(400).json({
          message:
            "⚠️ این ترینی قبلاً برای این سال فرم مونوگراف را ثبت کرده است. لطفاً ترینی را ارتقا دهید.",
          formId: existingYearForm._id,
        });
      }

      const form = new MonographEvaluation({
        trainer: new mongoose.Types.ObjectId(trainer),
        name,
        lastName,
        parentType,
        idNumber,
        department,
        trainingYear,
        startYear,
        date,
        evaluations,
        summary, // 🔹 ذخیره summary جدا
      });

      await form.save();
      res.status(201).json({ message: "✅ فرم با موفقیت ذخیره شد", form });
    } catch (error) {
      console.error("❌ Error creating MonographEvaluation:", error);
      res.status(500).json({ message: "خطا در ایجاد فرم", error });
    }
  }

  // 🔹 دریافت همه فرم‌ها یا فیلتر بر اساس trainerId
  static async getAll(req: Request, res: Response) {
    try {
      const { trainerId } = req.query;
      const filter = trainerId
        ? { trainer: new mongoose.Types.ObjectId(trainerId as string) }
        : {};

      const forms = await MonographEvaluation.find(filter)
        .populate("trainer")
        .sort({ createdAt: -1 });

      res.status(200).json(forms);
    } catch (error) {
      console.error("❌ Error fetching MonographEvaluations:", error);
      res.status(500).json({ message: "خطا در دریافت فرم‌ها", error });
    }
  }

  // 🔹 دریافت فرم بر اساس ID
  static async getById(req: Request, res: Response) {
    try {
      const form = await MonographEvaluation.findById(req.params.id).populate(
        "trainer"
      );
      if (!form) return res.status(404).json({ message: "فرم پیدا نشد" });
      res.json(form);
    } catch (error) {
      console.error("❌ Error fetching MonographEvaluation:", error);
      res.status(500).json({ message: "خطا در دریافت فرم", error });
    }
  }

  // 🔹 بروزرسانی فرم بر اساس ID
  static async update(req: Request, res: Response) {
    try {
      const updated = await MonographEvaluation.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: "فرم پیدا نشد" });
      res.json({ message: "✅ فرم بروزرسانی شد", updated });
    } catch (error) {
      console.error("❌ Error updating MonographEvaluation:", error);
      res.status(500).json({ message: "خطا در بروزرسانی فرم", error });
    }
  }

  // 🔹 حذف فرم بر اساس ID
  static async delete(req: Request, res: Response) {
    try {
      const deleted = await MonographEvaluation.findByIdAndDelete(
        req.params.id
      );
      if (!deleted) return res.status(404).json({ message: "فرم پیدا نشد" });
      res.json({ message: "✅ فرم با موفقیت حذف شد" });
    } catch (error) {
      console.error("❌ Error deleting MonographEvaluation:", error);
      res.status(500).json({ message: "خطا در حذف فرم", error });
    }
  }
}
