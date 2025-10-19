// routes/monographRoutes.ts
import express from "express";
import { MonographController } from "../controllers/form-C";

const router = express.Router();

// 🔹 ایجاد فرم جدید
router.post("/", MonographController.create);

// 🔹 دریافت همه فرم‌ها یا فیلتر بر اساس trainerId
router.get("/", MonographController.getAll);

// 🔹 دریافت فرم بر اساس ID
router.get("/:id", MonographController.getById);

// 🔹 بروزرسانی فرم بر اساس ID
router.put("/:id", MonographController.update);

// 🔹 حذف فرم بر اساس ID
router.delete("/:id", MonographController.delete);

export default router;
