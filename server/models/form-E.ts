// models/EvaluationFormE.ts
import mongoose, { Document, Schema, Types } from "mongoose";
import { TrainerProgress } from "./TrainerProgress"; // اضافه شد

// 🔹 ساختار هر score
interface IScore {
  score: string;
  teacherName: string;
  notes?: string;
}

// 🔹 ساختار سند اصلی
export interface IEvaluationFormE extends Document {
  trainer: Types.ObjectId; // رفرنس به Trainer
  Name: string;
  parentType: string;
  trainingYear: string;
  incidentTitle: string;
  date: string;
  scores: IScore[];
  averageScore: string;
  createdAt: Date;
  updatedAt: Date;
}

// اسکیمای score
const ScoreSchema = new Schema<IScore>({
  score: { type: String, default: "" },
  teacherName: { type: String, default: "" },
  notes: { type: String, default: "" },
});

// اسکیمای اصلی فرم
const EvaluationFormESchema = new Schema<IEvaluationFormE>(
  {
    trainer: { type: Schema.Types.ObjectId, ref: "Trainer", required: true },
    Name: { type: String, required: true },
    parentType: { type: String, required: true },
    trainingYear: { type: String, required: true },
    incidentTitle: { type: String, required: true },
    date: { type: String, required: true },
    scores: { type: [ScoreSchema], default: [] },
    averageScore: { type: String, default: "" },
  },
  { timestamps: true }
);

// ✅ بعد از ذخیره، آیدی فرم را در TrainerProgress → forms.formE ذخیره کن
EvaluationFormESchema.post("save", async function (doc) {
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
      yearRecord.forms.formE = doc._id; // لینک فرم EvaluationFormE
      await progress.save();
      console.log(`✅ EvaluationFormE linked to TrainerProgress (${trainingYear})`);
    } else {
      console.warn(
        `⚠️ trainingYear "${trainingYear}" not found in TrainerProgress for trainer ${trainerId}`
      );
    }
  } catch (error) {
    console.error(
      "❌ Error linking EvaluationFormE to TrainerProgress:",
      error
    );
  }
});

// 🔹 مدل نهایی
export const EvaluationFormE =
  mongoose.models.EvaluationFormE ||
  mongoose.model<IEvaluationFormE>("EvaluationFormE", EvaluationFormESchema);
