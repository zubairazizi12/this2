// routes/conferenceEvaluationRoutes.ts
import express from "express";
import { ConferenceEvaluationController } from "../controllers/form-D";

const router = express.Router();

// 🔹 ایجاد فرم جدید
router.post("/", ConferenceEvaluationController.create);

// 🔹 دریافت همه فرم‌ها یا فیلتر بر اساس trainerId
router.get("/", ConferenceEvaluationController.getAll);

// 🔹 دریافت فرم بر اساس ID
router.get("/:id", ConferenceEvaluationController.getById);

// 🔹 بروزرسانی فرم بر اساس ID
router.put("/:id", ConferenceEvaluationController.update);

// 🔹 حذف فرم بر اساس ID
router.delete("/:id", ConferenceEvaluationController.delete);

export default router;
