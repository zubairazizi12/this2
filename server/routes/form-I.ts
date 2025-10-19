import express, { Request, Response } from "express";
import mongoose from "mongoose";
import {
  createRotationForm,
  getRotationForms,
  getRotationFormById,
  updateRotationForm,
} from "../controllers/form-I";

const router = express.Router();

// ✅ ایجاد فرم جدید
router.post("/", createRotationForm);

// ✅ گرفتن فرم‌های یک ترینر خاص
router.get("/:trainerId", getRotationForms);

// ✅ گرفتن فرم خاص با ID
router.get("/form/:id", getRotationFormById);

// ✅ ویرایش فرم خاص با ID
router.put("/form/:id", updateRotationForm);

export default router;
