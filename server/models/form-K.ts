// models/MonographEvaluation.ts
import mongoose, { Schema, Document, Types } from "mongoose";
import { TrainerProgress } from "./TrainerProgress"; // اضافه شد

// 🔹 ساختار هر ردیف ارزیابی مونوگراف
export interface IMonographRow {
  section: string;
  percentage: string;
  score: string;
  teacherName: string;
  teacherSigned: boolean;
  characteristics: string;
}

// 🔹 ساختار summary (مجموع و اوسط و نوت)
export interface IMonographSummary {
  total: string;
  average: string;
  notes: string;
}

// 🔹 ساختار سند اصلی
export interface IMonographEvaluation extends Document {
  trainer: Types.ObjectId; // رفرنس به جدول Trainer
  name: string;
  lastName: string;
  parentType: string;
  idNumber: string;
  department: string;
  trainingYear: string;
  startYear: string;
  date: string;
  evaluations: IMonographRow[];
  summary: IMonographSummary; // 🔹 اضافه شد
  createdAt: Date;
  updatedAt: Date;
}

// اسکیمای هر ردیف ارزیابی
const MonographRowSchema: Schema = new Schema({
  section: { type: String, required: true },
  percentage: { type: String, default: "" },
  score: { type: String, default: "" },
  teacherName: { type: String, default: "" },
  teacherSigned: { type: Boolean, default: false },
  characteristics: { type: String, default: "" },
});

// اسکیمای summary
const MonographSummarySchema: Schema = new Schema({
  total: { type: String, default: "" },
  average: { type: String, default: "" },
  notes: { type: String, default: "" },
});

// اسکیمای اصلی فرم
const MonographEvaluationSchema: Schema = new Schema(
  {
    trainer: { type: Schema.Types.ObjectId, ref: "Trainer", required: true },
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    parentType: { type: String, required: true },
    idNumber: { type: String, default: "" },
    department: { type: String, default: "" },
    trainingYear: { type: String, default: "" },
    startYear: { type: String, default: "" },
    date: { type: String, default: "" },
    evaluations: { type: [MonographRowSchema], default: [] },
    summary: { type: MonographSummarySchema, default: () => ({}) }, // 🔹 اضافه شد
  },
  { timestamps: true }
);

// ✅ بعد از ذخیره، آیدی فرم را در TrainerProgress → forms.monograph ذخیره کن
MonographEvaluationSchema.post("save", async function (doc) {
  try {
    const trainerId = doc.trainer;
    const trainingYear = doc.trainingYear;

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
      yearRecord.forms.formK = doc._id; // لینک فرم MonographEvaluation
      await progress.save();
      console.log(
        `✅ MonographEvaluation linked to TrainerProgress (${trainingYear})`
      );
    } else {
      console.warn(
        `⚠️ trainingYear "${trainingYear}" not found in TrainerProgress for trainer ${trainerId}`
      );
    }
  } catch (error) {
    console.error(
      "❌ Error linking MonographEvaluation to TrainerProgress:",
      error
    );
  }
});

// 🔹 مدل نهایی
export const MonographEvaluation =
  mongoose.models.MonographEvaluation ||
  mongoose.model<IMonographEvaluation>(
    "MonographEvaluation",
    MonographEvaluationSchema
  );
