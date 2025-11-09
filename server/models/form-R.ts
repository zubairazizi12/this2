import mongoose, { Schema, Document } from "mongoose";
import { TrainerProgress } from "./TrainerProgress"; // ✅ اضافه شد

// 🔹 ساختار داده‌های هر هفته
interface WeekData {
  level: string;
  cases: string;
}

// 🔹 ساختار هر ردیف
interface CompetencyRow {
  id: number;
  text: string;
  week1: WeekData;
  week2: WeekData;
  week3: WeekData;
  week4: WeekData;
  totalCases: string;
}

// 🔹 ساختار اصلی سند
export interface IRotationFormR extends Document {
  trainerId: mongoose.Types.ObjectId;
  academicYear: String;
  from: string;
  to: string;
  dateBaseCodeNo: string;
  name: string;
  fatherName: string;
  department: string;
  pgy: string;
  rotationType: string;
  rotationName: string;
  date: string;
  headOfDeptSignature: string;
  programDirectorSignature: string;
  hospitalDirectorSignature: string;
  rows: CompetencyRow[];
  createdAt: Date;
  updatedAt: Date;
}

const WeekDataSchema = new Schema<WeekData>({
  level: { type: String, default: "" },
  cases: { type: String, default: "" },
});

const CompetencyRowSchema = new Schema<CompetencyRow>({
  id: { type: Number, required: true },
  text: { type: String, required: true },
  week1: { type: WeekDataSchema, default: () => ({}) },
  week2: { type: WeekDataSchema, default: () => ({}) },
  week3: { type: WeekDataSchema, default: () => ({}) },
  week4: { type: WeekDataSchema, default: () => ({}) },
  totalCases: { type: String, default: "" },
});

// 🔹 اسکیمای اصلی RotationFormR
const RotationFormRSchema = new Schema<IRotationFormR>(
  {
    trainerId: {
      type: Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
    academicYear: { type: String, required: true },    from: { type: String, required: true },
    to: { type: String, required: true },
    dateBaseCodeNo: { type: String, default: "" },
    name: { type: String, required: true },
    fatherName: { type: String, default: "" },
    department: { type: String, default: "" },
    pgy: { type: String, default: "" },
    rotationType: { type: String, default: "" },
    rotationName: { type: String, default: "" },
    date: { type: String, default: "" },
    headOfDeptSignature: { type: String, default: "" },
    programDirectorSignature: { type: String, default: "" },
    hospitalDirectorSignature: { type: String, default: "" },
    rows: { type: [CompetencyRowSchema], default: [] },
  },
  { timestamps: true }
);

//
// ✅ بعد از ذخیره فرم، آن را به TrainerProgress → forms.formR وصل کن
//
RotationFormRSchema.post("save", async function (doc) {
  try {
    const trainerId = doc.trainerId;
    if (!trainerId) return;

    // پیدا کردن TrainerProgress برای ترینر
    const progress = await TrainerProgress.findOne({ trainer: trainerId });
    if (!progress) {
      console.warn(`⚠️ TrainerProgress برای ترینر ${trainerId} پیدا نشد`);
      return;
    }

    // پیدا کردن آخرین سال تریننگ
    const latestYear =
      progress.trainingHistory?.[progress.trainingHistory.length - 1];
    if (!latestYear) {
      console.warn(`⚠️ هیچ سال تریننگی در TrainerProgress برای ترینر ${trainerId} پیدا نشد`);
      return;
    }

    // ✅ ثبت آیدی فرم در فرم R
    if (!latestYear.forms) latestYear.forms = {};
    latestYear.forms.formR = doc._id;

    await progress.save();
    console.log(`✅ RotationFormR linked to TrainerProgress (${trainerId})`);
  } catch (error) {
    console.error("❌ Error linking RotationFormR to TrainerProgress:", error);
  }
});


// 🔹 مدل نهایی
export const RotationFormR = mongoose.model<IRotationFormR>(
  "RotationFormR",
  RotationFormRSchema
);
