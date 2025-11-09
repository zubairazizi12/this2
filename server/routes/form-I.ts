import express from "express";
import {
  createRotationForm,
  getRotationFormByTrainer,
  getRotationFormById,
  updateRotationFormByTrainer,
  deleteRotationForm,
} from "../controllers/form-I";

const router = express.Router();

// ✅ مسیرهای API برای RotationForm
router.post("/", createRotationForm); 

// ✅ گرفتن فرم با ID خاص (مثل فرم F)
router.get("/form/:formId", getRotationFormById);

// ✅ گرفتن فرم بر اساس trainerId
router.get("/:trainerId", getRotationFormByTrainer);

// ✅ به‌روزرسانی فرم بر اساس trainerId
router.put("/:trainerId", updateRotationFormByTrainer);

// ✅ حذف فرم
router.delete("/:id", deleteRotationForm);

export default router;
