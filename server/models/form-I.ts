// models/RotationForm.ts
import mongoose, { Schema, Document } from "mongoose";

interface IWeek {
  cases: number;
  level: string; // مثل "1", "2", "1-2"
}

interface IEnglishRow {
  weeks: IWeek[];
  total: number;
}

interface IPersianRow {
  mark: number; // تغییر از string به number
  teacherName: string;
  teacherSign: string;
  note: string;
}

export interface IRotationForm extends Document {
  trainerId: mongoose.Schema.Types.ObjectId;
  header: {
    name: string;
    parentType: string;
    parentName: string;
    department: string;
    trainingYear: string;
    rotationName: string;
    rotationFrom: string;
    rotationTo: string;
    date: string;
  };
  persianRows: IPersianRow[];
  persianNote: string;
  rows: IEnglishRow[];
  createdAt: Date;
}

const WeekSchema = new Schema<IWeek>({
  cases: { type: Number, default: 0 },
  level: { type: String, default: "" },
});

const EnglishRowSchema = new Schema<IEnglishRow>({
  weeks: { type: [WeekSchema], default: [] },
  total: { type: Number, default: 0 },
});

const PersianRowSchema = new Schema<IPersianRow>({
  mark: { type: Number, default: 0 }, // تغییر
  teacherName: { type: String, default: "" },
  teacherSign: { type: String, default: "" },
  note: { type: String, default: "" },
});

const RotationFormSchema = new Schema<IRotationForm>({
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", required: true },
  header: {
    name: { type: String, required: true },
    parentType: { type: String, default: "" },
    parentName: { type: String, default: "" },
    department: { type: String, default: "" },
    trainingYear: { type: String, required: true },
    rotationName: { type: String, required: true }, // فقط اینجا
    rotationFrom: { type: String, default: "" },
    rotationTo: { type: String, default: "" },
    date: { type: String, default: "" },
  },
  persianRows: [PersianRowSchema],
  persianNote: { type: String, default: "" },
  rows: [EnglishRowSchema],
  createdAt: { type: Date, default: Date.now },
});
// ✅ محدود کردن یک فرم برای هر ترینر
RotationFormSchema.index({ trainerId: 1 }, { unique: true });

export default mongoose.model<IRotationForm>("RotationForm", RotationFormSchema);
