import express from "express";
import {
  createRotationFormR,
  getRotationFormRById,
  getRotationFormRByTrainerId,
  updateRotationFormRByTrainerId,
  deleteRotationFormR,
} from "../controllers/form-R";

const router = express.Router();

// ✅ ایجاد فرم جدید
router.post("/", createRotationFormR);

router.get("/:formId", getRotationFormRById);

// ✅ مسیر جدید برای trainerId
router.get("/:trainerId", getRotationFormRByTrainerId);


router.put("/:trainerId", updateRotationFormRByTrainerId);

// ✅ حذف فرم با ID خاص
router.delete("/:id", deleteRotationFormR);

export default router;
