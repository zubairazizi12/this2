import mongoose, { Schema, Document, Types } from "mongoose";

interface ITrainingYear {
  year: string;
  totalScore: number;
  instructor: string;
}

export interface IEvaluationFormH extends Document {
  trainer: Types.ObjectId; // ⬅️ رفرنس به Trainer
  Name: string;
  parentType: string;
  department: string;
  trainingYears: ITrainingYear[];
  averageScore: number;
  shiftDepartment: string;
  programDirector: string;
}

const TrainingYearSchema = new Schema<ITrainingYear>({
  year: { type: String, required: true },
  totalScore: { type: Number, default: 0 },
  instructor: { type: String, default: "" },
});

const EvaluationFormHSchema = new Schema<IEvaluationFormH>(
  {
    trainer: {
      type: Schema.Types.ObjectId,
      ref: "Trainer", // ⬅️ به مدل Trainer وصل می‌شود
      required: true,
    },
    Name: { type: String, required: true },
    parentType: { type: String, required: true },
    department: { type: String, required: true },
    trainingYears: [TrainingYearSchema],
    averageScore: { type: Number, default: 0 },
    shiftDepartment: { type: String, default: "" },
    programDirector: { type: String, default: "" },
  },
  { timestamps: true }
);

export const EvaluationFormH = mongoose.model<IEvaluationFormH>(
  "EvaluationFormH",
  EvaluationFormHSchema
);
