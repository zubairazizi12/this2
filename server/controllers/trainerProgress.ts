// controllers/trainerProgressController.ts
import { Request, Response } from "express";
import { TrainerProgress } from "../models/TrainerProgress.js";

export const getTrainerProgressByTrainer = async (req: Request, res: Response) => {
  try {
    const { trainerId } = req.params;

    // چک اینکه trainerId وجود دارد
    if (!trainerId) {
      return res.status(400).json({ message: "شناسه ترینر ارسال نشده است" });
    }

    // جستجو در دیتابیس
    const progress = await TrainerProgress.findOne({ trainer: trainerId }).lean();

    // اگر یافت نشد
    if (!progress) {
      return res.status(404).json({ message: "TrainerProgress یافت نشد" });
    }

    // ارسال داده موفق
    res.status(200).json(progress);

  } catch (err) {
    console.error("❌ خطا در دریافت TrainerProgress:", err);
    res.status(500).json({ message: "خطا در دریافت اطلاعات ترینر" });
  }
};
