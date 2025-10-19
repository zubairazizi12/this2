// routes/evaluationFormHRoutes.ts
import express from "express";
import { EvaluationFormHController } from "../controllers/form-H";

const router = express.Router();

// 🔹 ایجاد فرم جدید
router.post("/", EvaluationFormHController.create);

// 🔹 دریافت همه فرم‌ها یا فیلتر بر اساس trainerId
router.get("/", EvaluationFormHController.getAll);

// 🔹 دریافت فرم بر اساس ID
router.get("/:id", EvaluationFormHController.getById);

// 🔹 بروزرسانی فرم بر اساس ID
router.put("/:id", EvaluationFormHController.update);

// 🔹 حذف فرم بر اساس ID
router.delete("/:id", EvaluationFormHController.delete);

export default router;
