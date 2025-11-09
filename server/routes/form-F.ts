import express from "express";
import { createChecklist, getChecklists, getChecklistFormById, getChecklistByTrainer, updateChecklistByTrainer } from "../controllers/form-F";

const router = express.Router();

router.post("/", createChecklist);
router.get("/", getChecklists);
router.get("/form/:formId", getChecklistFormById);
router.get("/:trainerId", getChecklistByTrainer);
router.put("/:trainerId", updateChecklistByTrainer); // 👈 اضافه شود


export default router;
