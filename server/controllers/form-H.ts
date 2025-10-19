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
        trainingYears,
        averageScore,
        shiftDepartment,
        programDirector,
      } = req.body;

      if (!trainer) {
        return res.status(400).json({ message: "Trainer ID الزامی است" });
      }

      // 🔹 بررسی وجود فرم قبلی برای همین Trainer
        

      const form = new EvaluationFormH({
        trainer: new mongoose.Types.ObjectId(trainer),
        Name,
        parentType,
        department,
        trainingYears,
        averageScore,
        shiftDepartment,
        programDirector,
      });

      await form.save();
      res.status(201).json({ message: "✅ فرم با موفقیت ذخیره شد", form });
    } catch (err) {
      console.error("❌ Error saving EvaluationFormH:", err);
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

      const forms = await EvaluationFormH.find(filter)
        .populate("trainer")
        .sort({ createdAt: -1 });

      res.status(200).json(forms);
    } catch (err) {
      console.error("❌ Error fetching EvaluationFormH:", err);
      res.status(500).json({ message: "خطا در دریافت فرم‌ها", error: err });
    }
  }

  // 🔹 دریافت فرم بر اساس ID
  static async getById(req: Request, res: Response) {
    try {
      const form = await EvaluationFormH.findById(req.params.id).populate(
        "trainer"
      );
      if (!form) return res.status(404).json({ message: "فرم پیدا نشد" });
      res.json(form);
    } catch (err) {
      console.error("❌ Error fetching EvaluationFormH:", err);
      res.status(500).json({ message: "خطا در دریافت فرم", error: err });
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
      if (!updated) return res.status(404).json({ message: "فرم پیدا نشد" });
      res.json({ message: "✅ فرم بروزرسانی شد", updated });
    } catch (err) {
      console.error("❌ Error updating EvaluationFormH:", err);
      res.status(500).json({ message: "خطا در بروزرسانی فرم", error: err });
    }
  }

  // 🔹 حذف فرم بر اساس ID
  static async delete(req: Request, res: Response) {
    try {
      const deleted = await EvaluationFormH.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "فرم پیدا نشد" });
      res.json({ message: "✅ فرم با موفقیت حذف شد" });
    } catch (err) {
      console.error("❌ Error deleting EvaluationFormH:", err);
      res.status(500).json({ message: "خطا در حذف فرم", error: err });
    }
  }
}
