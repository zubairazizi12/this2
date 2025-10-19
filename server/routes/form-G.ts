// routes/evaluationFormGRoutes.ts
import express from "express";
import { EvaluationFormGController } from "../controllers/form-G";

const router = express.Router();

// 🔹 ایجاد فرم جدید
router.post("/", EvaluationFormGController.create);

// 🔹 دریافت همه فرم‌ها یا فیلتر بر اساس trainerId
router.get("/", EvaluationFormGController.getAll);

// 🔹 دریافت فرم بر اساس ID
router.get("/:id", EvaluationFormGController.getById);

// 🔹 بروزرسانی فرم بر اساس ID
router.put("/:id", EvaluationFormGController.update);

// 🔹 حذف فرم بر اساس ID
router.delete("/:id", EvaluationFormGController.delete);

export default router;
