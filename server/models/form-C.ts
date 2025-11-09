// models/MonographEvaluationForm.ts
import mongoose, { Document, Schema, Types } from "mongoose";
import { TrainerProgress } from "./TrainerProgress"; // اضافه شد

// 🔹 ساختار هر آیتم ارزیابی
interface IEvaluationItem {
  section: string;     // نام بخش مثل نمره سیکل، مجموع نمرات ...
  percentage: string;  // فیصدی
  score: string;       // نمره
  teacherName: string; // نام استاد
}

// 🔹 ساختار سند اصلی
export interface IMonographEvaluationForm extends Document {
  trainer: Types.ObjectId; // رفرنس به Trainer
  name: string;
  lastName: string;
  parentType: string;
  idNumber: string;
  department: string;
  trainingYear: string;
  startYear: string;
  date: string;
  chef: string;
  departmentHead: string;
  hospitalHead: string;
  evaluations: IEvaluationItem[];
  createdAt: Date;
  updatedAt: Date;
}

// اسکیمای هر آیتم ارزیابی
const EvaluationItemSchema = new Schema<IEvaluationItem>({
  section: { type: String, required: true },
  percentage: { type: String, required: true },
  score: { type: String, required: true },
  teacherName: { type: String, required: true },
});

// اسکیمای اصلی فرم
const MonographEvaluationFormSchema = new Schema<IMonographEvaluationForm>(
  {
    trainer: {
      type: Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    parentType: { type: String, required: true },
    idNumber: { type: String, required: true },
    department: { type: String, required: true },
    trainingYear: { type: String, required: true },
    startYear: { type: String, required: true },
    date: { type: String, required: true },
    chef: { type: String, required: true },
    departmentHead: { type: String, required: true },
    hospitalHead: { type: String, required: true },
    evaluations: { type: [EvaluationItemSchema], default: [] },
  },
  { timestamps: true }
);

// ✅ بعد از ذخیره، آیدی فرم را در TrainerProgress → forms.formMonograph ذخیره کن
MonographEvaluationFormSchema.post("save", async function (doc) {
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
      yearRecord.forms.formC = doc._id; // لینک فرم MonographEvaluation
      await progress.save();
      console.log(
        `✅ MonographEvaluationForm linked to TrainerProgress (${trainingYear})`
      );
    } else {
      console.warn(
        `⚠️ trainingYear "${trainingYear}" not found in TrainerProgress for trainer ${trainerId}`
      );
    }
  } catch (error) {
    console.error(
      "❌ Error linking MonographEvaluationForm to TrainerProgress:",
      error
    );
  }
});

// 🔹 مدل نهایی
export const MonographEvaluationForm =
  mongoose.models.MonographEvaluationForm ||
  mongoose.model<IMonographEvaluationForm>(
    "MonographEvaluationForm",
    MonographEvaluationFormSchema
  );
