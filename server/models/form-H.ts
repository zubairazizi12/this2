// models/EvaluationFormH.ts
import mongoose, { Schema, Document, Types } from "mongoose";
import { TrainerProgress } from "./TrainerProgress"; // اضافه شد

// 🔹 هر سال آموزش
interface ITrainingYear {
  year: string;
  totalScore: number;
  instructor: string;
}

// 🔹 ساختار سند اصلی
export interface IEvaluationFormH extends Document {
  trainer: Types.ObjectId; // رفرنس به Trainer
  Name: string;
  parentType: string;
  department: string;
  trainingYear:string;
  trainingYears: ITrainingYear[];
  averageScore: number;
  shiftDepartment: string;
  programDirector: string;
  createdAt: Date;
  updatedAt: Date;
}

// اسکیمای سال آموزش
const TrainingYearSchema = new Schema<ITrainingYear>({
  year: { type: String, required: true },
  totalScore: { type: Number, default: 0 },
  instructor: { type: String, default: "" },
});

// اسکیمای اصلی فرم
const EvaluationFormHSchema = new Schema<IEvaluationFormH>(
  {
    trainer: { type: Schema.Types.ObjectId, ref: "Trainer", required: true },
    Name: { type: String, required: true },
    parentType: { type: String, required: true },
    department: { type: String, required: true },
    trainingYear: { type: String, default: "" }, // ✅ اضافه شد
    trainingYears: [TrainingYearSchema],
    averageScore: { type: Number, default: 0 },
    shiftDepartment: { type: String, default: "" },
    programDirector: { type: String, default: "" },
  },
  { timestamps: true }
);

// ✅ بعد از ذخیره، آیدی فرم را در TrainerProgress → forms.formH ذخیره کن
EvaluationFormHSchema.post("save", async function (doc) {
  try {
    const trainerId = doc.trainer;
    // برای فرم H، هر سال می‌تواند یک رکورد باشد، اما ما از اولین سال استفاده می‌کنیم
    const trainingYear = doc.trainingYears[0]?.year;

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
      yearRecord.forms.formH = doc._id; // لینک فرم EvaluationFormH
      await progress.save();
      console.log(`✅ EvaluationFormH linked to TrainerProgress (${trainingYear})`);
    } else {
      console.warn(
        `⚠️ trainingYear "${trainingYear}" not found in TrainerProgress for trainer ${trainerId}`
      );
    }
  } catch (error) {
    console.error(
      "❌ Error linking EvaluationFormH to TrainerProgress:",
      error
    );
  }
});

// 🔹 مدل نهایی
export const EvaluationFormH =
  mongoose.models.EvaluationFormH ||
  mongoose.model<IEvaluationFormH>("EvaluationFormH", EvaluationFormHSchema);
