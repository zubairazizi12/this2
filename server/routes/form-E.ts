// routes/evaluationFormERoutes.ts
import express from "express";
import { EvaluationFormEController } from "../controllers/form-E";

const router = express.Router();

// 🔹 ایجاد فرم جدید
router.post("/", EvaluationFormEController.create);

// 🔹 دریافت همه فرم‌ها یا فیلتر بر اساس trainerId
router.get("/", EvaluationFormEController.getAll);

// 🔹 دریافت فرم بر اساس ID
router.get("/:id", EvaluationFormEController.getById);

// 🔹 بروزرسانی فرم بر اساس ID
router.put("/:id", EvaluationFormEController.update);

// 🔹 حذف فرم بر اساس ID
router.delete("/:id", EvaluationFormEController.delete);

export default router;
