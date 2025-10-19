// routes/monographEvaluationRoutes.ts
import { Router } from "express";
import { MonographEvaluationController } from "../controllers/form-K";

const router = Router();

// 🔹 ایجاد فرم جدید
router.post("/", MonographEvaluationController.create);

// 🔹 دریافت همه فرم‌ها یا فیلتر بر اساس trainerId
router.get("/", MonographEvaluationController.getAll);

// 🔹 دریافت فرم بر اساس ID
router.get("/:id", MonographEvaluationController.getById);

// 🔹 بروزرسانی فرم بر اساس ID
router.put("/:id", MonographEvaluationController.update);

// 🔹 حذف فرم بر اساس ID
router.delete("/:id", MonographEvaluationController.delete);

export default router;
