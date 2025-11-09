// routes/trainerProgressRoutes.ts
import express from "express";
import { getTrainerProgressByTrainer } from "../controllers/trainerProgress.js";

const router = express.Router();

router.get("/:trainerId", getTrainerProgressByTrainer);

export default router;
