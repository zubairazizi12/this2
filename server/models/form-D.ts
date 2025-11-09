// models/ConferenceEvaluation.ts
import mongoose, { Schema, Document, Types } from "mongoose";
import { TrainerProgress } from "./TrainerProgress"; // مسیر را بررسی کنید

// 🔹 ساختار هر ردیف کنفرانس
export interface IConferenceItem {
  conferenceTitle: string;
  score: string;
  date: string;
  teacherName: string;
  teacherSigned?: boolean;
}

// 🔹 ساختار فرم ارزیابی کنفرانس
export interface IConferenceEvaluation extends Document {
  trainer: Types.ObjectId;
  year: string;
  name: string;
  parentType: string;
  department: string;
  trainingYear: string;
  conferences: IConferenceItem[];
  notes?: boolean;
  departmentHead?: string;
  programHead?: string;
  hospitalHead?: string;
  createdAt: Date;
  updatedAt: Date;
}

// اسکیمای هر ردیف کنفرانس
const ConferenceItemSchema = new Schema<IConferenceItem>({
  conferenceTitle: { type: String, required: true },
  score: { type: String, required: true },
  date: { type: String, required: true },
  teacherName: { type: String, required: true },
  teacherSigned: { type: Boolean, default: false },
});

// اسکیمای اصلی فرم کنفرانس
const ConferenceEvaluationSchema = new Schema<IConferenceEvaluation>(
  {
    trainer: { type: Schema.Types.ObjectId, ref: "Trainer", required: true },
    year: { type: String, required: true },
    name: { type: String, required: true },
    parentType: { type: String, required: true },
    department: { type: String, required: true },
    trainingYear: { type: String, required: true },
    conferences: { type: [ConferenceItemSchema], default: [] },
    notes: { type: Boolean, default: false },
    departmentHead: { type: String, default: "" },
    programHead: { type: String, default: "" },
    hospitalHead: { type: String, default: "" },
  },
  { timestamps: true }
);

// ✅ بعد از ذخیره، فرم را در TrainerProgress → forms.formD لینک کن
ConferenceEvaluationSchema.post("save", async function (doc) {
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
      if (!yearRecord.forms) {
        yearRecord.forms = {
          formC: undefined,
          formD: undefined,
          formE: undefined,
          formF: undefined,
          formG: undefined,
          formH: undefined,
          formI: undefined,
          formJ: undefined,
          formK: undefined,
        };
      }

      yearRecord.forms.formD = doc._id;
      await progress.save();
      console.log(
        `✅ ConferenceEvaluation linked to TrainerProgress (${trainingYear})`
      );
    } else {
      console.warn(
        `⚠️ trainingYear "${trainingYear}" not found in TrainerProgress for trainer ${trainerId}`
      );
    }
  } catch (error) {
    console.error(
      "❌ Error linking ConferenceEvaluation to TrainerProgress:",
      error
    );
  }
});

// 🔹 مدل نهایی
export const ConferenceEvaluation =
  mongoose.models.ConferenceEvaluation ||
  mongoose.model<IConferenceEvaluation>(
    "ConferenceEvaluation",
    ConferenceEvaluationSchema
  );
