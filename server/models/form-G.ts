// models/EvaluationFormG.ts
import mongoose, { Document, Schema, Types } from "mongoose";
import { TrainerProgress } from "./TrainerProgress"; // اضافه شد

// 🔹 هر ردیف از جدول نمرات
interface IScoreRow {
  exam1Written: number;
  exam1Practical: number;
  exam2Written: number;
  exam2Practical: number;
  finalWritten: number;
  finalPractical: number;
  total: number;
  teacherName: string;
}

// 🔹 اطلاعات شخصی
interface IPersonalInfo {
  Name: string;
  parentType: string;
  trainingYear: string;
  year: string;
  department: string;
}

// 🔹 ساختار سند اصلی
export interface IEvaluationFormG extends Document {
  trainer: Types.ObjectId;
  personalInfo: IPersonalInfo;
  scores: IScoreRow[];
  averageScore: number;
  createdAt: Date;
  updatedAt: Date;
}

// اسکیمای ردیف نمرات
const ScoreRowSchema = new Schema<IScoreRow>({
  exam1Written: { type: Number, default: 0 },
  exam1Practical: { type: Number, default: 0 },
  exam2Written: { type: Number, default: 0 },
  exam2Practical: { type: Number, default: 0 },
  finalWritten: { type: Number, default: 0 },
  finalPractical: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  teacherName: { type: String, default: "" },
});

// اسکیمای اطلاعات شخصی
const PersonalInfoSchema = new Schema<IPersonalInfo>({
  Name: { type: String, required: true },
  parentType: { type: String, required: true },
  trainingYear: { type: String, required: true },
  year: { type: String, required: true },
  department: { type: String, required: true },
});

// اسکیمای اصلی فرم
const EvaluationFormGSchema = new Schema<IEvaluationFormG>(
  {
    trainer: { type: Schema.Types.ObjectId, ref: "Trainer", required: true },
    personalInfo: { type: PersonalInfoSchema, required: true },
    scores: { type: [ScoreRowSchema], required: true },
    averageScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ بعد از ذخیره، آیدی فرم را در TrainerProgress → forms.formG ذخیره کن
EvaluationFormGSchema.post("save", async function (doc) {
  try {
    const trainerId = doc.trainer;
    const trainingYear = doc.personalInfo.trainingYear;

    if (!trainerId || !trainingYear) return;

    const progress = await TrainerProgress.findOne({ trainer: trainerId });
    if (!progress) {
      console.warn(`⚠️ TrainerProgress برای ترینر ${trainerId} پیدا نشد`);
      return;
    }

    const yearRecord = progress.trainingHistory.find(
      (y: any) => y.yearLabel === trainingYear
    );

    if (yearRecord) {
      if (!yearRecord.forms) yearRecord.forms = {};
      yearRecord.forms.formG = doc._id; // لینک فرم EvaluationFormG
      await progress.save();
      console.log(`✅ EvaluationFormG linked to TrainerProgress (${trainingYear})`);
    } else {
      console.warn(
        `⚠️ trainingYear "${trainingYear}" not found in TrainerProgress for trainer ${trainerId}`
      );
    }
  } catch (error) {
    console.error(
      "❌ Error linking EvaluationFormG to TrainerProgress:",
      error
    );
  }
});

// 🔹 مدل نهایی
export const EvaluationFormG =
  mongoose.models.EvaluationFormG ||
  mongoose.model<IEvaluationFormG>("EvaluationFormG", EvaluationFormGSchema);
