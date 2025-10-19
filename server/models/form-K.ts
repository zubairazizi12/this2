import mongoose, { Schema, Document, Types } from "mongoose";

// این همان ساختار هر سطر ارزیابی مونوگراف است
export interface IMonographRow {
  section: string;
  percentage: string;
  score: string;
  teacherName: string;
  teacherSigned: boolean;
  characteristics: string;
  total: string;
  average: string;
  notes: string;
}

// ساختار کامل فرم
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
}

const MonographRowSchema: Schema = new Schema({
  section: { type: String, required: true },
  percentage: { type: String, default: "" },
  score: { type: String, default: "" },
  teacherName: { type: String, default: "" },
  teacherSigned: { type: Boolean, default: false },
  characteristics: { type: String, default: "" },
  total: { type: String, default: "" },
  average: { type: String, default: "" },
  notes: { type: String, default: "" },
});

const MonographEvaluationSchema: Schema = new Schema({
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
}, { timestamps: true });

export const MonographEvaluation = mongoose.model<IMonographEvaluation>(
  "MonographEvaluation",
  MonographEvaluationSchema
);
