import mongoose, { Document, Schema } from "mongoose";
import { TrainerProgress } from "./TrainerProgress"; // 👈 مسیر را بررسی کن

// ✳️ نوع هر ردیف جدول
export interface IRotationRow {
  number: number;
  topic: string;
  grade?: string;
  professorName?: string;
  signature?: string;
  notes?: string;
}

// ✳️ نوع اصلی فرم Rotation
export interface IRotationForm extends Document {
  trainerId: mongoose.Types.ObjectId;
  joiningDate: string;
  name: string;
  parentType: string;
  parentName?: string;
  department: string;
  trainingYear: string;
  rows: IRotationRow[];
  createdAt?: Date;
  updatedAt?: Date;
}

// ✅ اسکیمای هر ردیف جدول
const rotationRowSchema = new Schema<IRotationRow>(
  {
    number: { type: Number, required: true },
    topic: { type: String, required: true },
    grade: { type: String, default: "" },
    professorName: { type: String, default: "" },
    signature: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

// ✅ اسکیمای اصلی فرم Rotation
const rotationFormSchema = new Schema<IRotationForm>(
  {
    trainerId: {
      type: Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
    joiningDate: { type: String, required: true },
    name: { type: String, required: true },
    parentType: { type: String, required: true },
    parentName: { type: String, default: "" },
    department: { type: String, required: true },
    trainingYear: { type: String, required: true },
    rows: {
      type: [rotationRowSchema],
      validate: {
        validator: (v: IRotationRow[]) => Array.isArray(v) && v.length > 0,
        message: "Rows are required",
      },
    },
  },
  { timestamps: true }
);

// ✅ بعد از ذخیره فرم، لینک کردن به TrainerProgress
rotationFormSchema.post("save", async function (doc) {
  try {
    const trainerId = (doc as any).trainerId;
    const trainingYear = (doc as any).trainingYear;

    if (!trainerId || !trainingYear) return;

    // پیدا کردن TrainerProgress
    const progress = await TrainerProgress.findOne({ trainer: trainerId });
    if (!progress) {
      console.warn(`⚠️ TrainerProgress برای ترینر ${trainerId} پیدا نشد`);
      return;
    }

    // پیدا کردن سال مربوطه در trainingHistory
    const yearRecord = progress.trainingHistory.find(
      (y: any) => y.yearLabel === trainingYear
    );

    if (yearRecord) {
      if (!yearRecord.forms) yearRecord.forms = {};
      yearRecord.forms.formI = (doc as any)._id; // 👈 بسته به نوع فرم (D, E, F...) تنظیم کن
      await progress.save();

      console.log(`✅ RotationForm linked to TrainerProgress (${trainingYear})`);
    } else {
      console.warn(
        `⚠️ trainingYear "${trainingYear}" not found in TrainerProgress for trainer ${trainerId}`
      );
    }
  } catch (error) {
    console.error("❌ Error linking RotationForm to TrainerProgress:", error);
  }
});

// ✅ خروجی مدل
export const RotationFormModel =
  mongoose.models.RotationForm ||
  mongoose.model<IRotationForm>("RotationForm", rotationFormSchema);
