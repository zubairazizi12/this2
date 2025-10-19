// routes/teacherActivityRoutes.ts
import express from "express";
import {
  createTeacherActivity,
  getSingleTeacherActivityByTrainer,
  getTeacherActivityById,
  updateTeacherActivity,
  deleteTeacherActivity,
} from "../controllers/form-J";

const router = express.Router();

// ✅ ایجاد فرم جدید
router.post("/", createTeacherActivity);


// مسیر جدید برای گرفتن یک فرم از روی trainerId
router.get("/:trainerId", getSingleTeacherActivityByTrainer);

// ✅ دریافت فرم با ID خاص
router.get("/:id", getTeacherActivityById);

// ✅ بروزرسانی فرم با ID
router.put("/:id", updateTeacherActivity);

// ✅ حذف فرم با ID
router.delete("/:id", deleteTeacherActivity);

export { router as teacherActivityRoutes };
