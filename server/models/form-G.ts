import mongoose, { Schema, Document, Types } from "mongoose";

// هر ردیف از جدول نمرات
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

// اطلاعات شخصی
interface IPersonalInfo {
  Name: string;
  parentType: string;
  trainingYear: string;
  year: string;
  department: string;
}

export interface IEvaluationFormG extends Document {
  trainer: Types.ObjectId; // رفرنس به Trainer
  personalInfo: IPersonalInfo;
  scores: IScoreRow[]; // شش ردیف شامل ردیف ششم اوسط
  averageScore: number;
}

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

const PersonalInfoSchema = new Schema<IPersonalInfo>({
  Name: { type: String, required: true },
  parentType: { type: String, required: true },
  trainingYear: { type: String, required: true },
  year: { type: String, required: true },
  department: { type: String, required: true },
});

const EvaluationFormGSchema = new Schema<IEvaluationFormG>(
  {
    trainer: {
      type: Schema.Types.ObjectId,
      ref: "Trainer", // رفرنس به مدل Trainer
      required: true,
    },
    personalInfo: { type: PersonalInfoSchema, required: true },
    scores: { type: [ScoreRowSchema], required: true },
    averageScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const EvaluationFormG = mongoose.model<IEvaluationFormG>(
  "EvaluationFormG",
  EvaluationFormGSchema
);
