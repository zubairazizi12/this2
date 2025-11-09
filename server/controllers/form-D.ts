import { Request, Response } from "express";
import mongoose from "mongoose";
import { ConferenceEvaluation } from "../models/form-D";

export class ConferenceEvaluationController {
  // 🔹 ایجاد فرم جدید
  static async create(req: Request, res: Response) {
    try {
      const {
        trainer,
        year,
        name,
        parentType,
        department,
        trainingYear,
        conferences,
      } = req.body;

      if (!trainer) {
        return res
          .status(400)
          .json({ message: "Trainer ID خالی است و فرم ذخیره نمی‌شود." });
      }
    
      // 🔹 جلوگیری از ثبت فرم تکراری بر اساس سال ترینینگ برای همان ترینر
      const existingYearForm = await ConferenceEvaluation.findOne({
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


      const newEvaluation = new ConferenceEvaluation({
        trainer: new mongoose.Types.ObjectId(trainer),
        year,
        name,
        parentType,
        department,
        trainingYear,
        conferences,
      });

      await newEvaluation.save();
      res
        .status(201)
        .json({ message: "✅ فرم ذخیره شد", id: newEvaluation._id });
    } catch (err) {
      console.error("❌ Error saving evaluation:", err);
      res.status(500).json({ message: "خطا در ذخیره فرم", error: err });
    }
  }

  // 🔹 دریافت تمام فرم‌ها بر اساس trainerId (اختیاری)
  static async getAll(req: Request, res: Response) {
    try {
      const { trainerId } = req.query;

      const filter = trainerId
        ? { trainer: new mongoose.Types.ObjectId(trainerId as string) }
        : {};

      const evaluations = await ConferenceEvaluation.find(filter)
        .populate("trainer")
        .sort({ createdAt: -1 });

      res.status(200).json(evaluations);
    } catch (err) {
      console.error("❌ Error fetching evaluations:", err);
      res.status(500).json({ message: "خطا در دریافت دیتا", error: err });
    }
  }

  // 🔹 دریافت فرم بر اساس ID
  static async getById(req: Request, res: Response) {
    try {
      const evaluation = await ConferenceEvaluation.findById(
        req.params.id
      ).populate("trainer");
      if (!evaluation) return res.status(404).json({ message: "فرم پیدا نشد" });
      res.json(evaluation);
    } catch (err) {
      console.error("❌ Error fetching evaluation:", err);
      res.status(500).json({ message: "خطا در دریافت فرم", error: err });
    }
  }

  // 🔹 بروزرسانی فرم بر اساس ID
  static async update(req: Request, res: Response) {
    try {
      const updated = await ConferenceEvaluation.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: "فرم پیدا نشد" });
      res.json({ message: "✅ فرم بروزرسانی شد", updated });
    } catch (err) {
      console.error("❌ Error updating evaluation:", err);
      res.status(500).json({ message: "خطا در بروزرسانی فرم", error: err });
    }
  }

  // 🔹 حذف فرم بر اساس ID
  static async delete(req: Request, res: Response) {
    try {
      const deleted = await ConferenceEvaluation.findByIdAndDelete(
        req.params.id
      );
      if (!deleted) return res.status(404).json({ message: "فرم پیدا نشد" });
      res.json({ message: "✅ فرم با موفقیت حذف شد" });
    } catch (err) {
      console.error("❌ Error deleting evaluation:", err);
      res.status(500).json({ message: "خطا در حذف فرم", error: err });
    }
  }
}
