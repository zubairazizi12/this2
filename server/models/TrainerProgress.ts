import mongoose, { Schema, Document, Types } from "mongoose";


export interface ITrainingYearRecord {
  yearLabel: "سال اول" | "سال دوم" | "سال سوم" | "سال چهارم";
  academicYear: string;
  startYear: string;
  endYear?: string;
  status: "در حال آموزش" | "ختم شده";
  forms: {
    formC?: Types.ObjectId | null; // MonographEvaluationForm
    formD?: Types.ObjectId | null; // ConferenceEvaluation
    formE?: Types.ObjectId | null; // EvaluationFormE
    formF?: Types.ObjectId | null; // FormF
    formG?: Types.ObjectId | null; // EvaluationFormG
    formH?: Types.ObjectId | null; // EvaluationFormH
    formI?: Types.ObjectId | null; // FormI
    formJ?: Types.ObjectId | null; // TeacherActivity
    formK?: Types.ObjectId | null; // MonographEvaluation
    formR?: Types.ObjectId | null; // MonographEvaluation
  };
}

export interface ITrainerProgress extends Document {
  trainer: Types.ObjectId; // ⬅️ رفرنس به Trainer
  startYear: string;
  currentTrainingYear: "سال اول" | "سال دوم" | "سال سوم" | "سال چهارم";
  trainingHistory: ITrainingYearRecord[];
  promoted: boolean;
  lastUpdated: Date;
}

const FormsSchema = new Schema(
  {
    formC: { type: Schema.Types.ObjectId, ref: "MonographEvaluationForm", default: null },
    formD: { type: Schema.Types.ObjectId, ref: "ConferenceEvaluation", default: null },
    formE: { type: Schema.Types.ObjectId, ref: "EvaluationFormE", default: null },
    formF: { type: Schema.Types.ObjectId, ref: "Checklist", default: null },
    formG: { type: Schema.Types.ObjectId, ref: "EvaluationFormG", default: null },
    formH: { type: Schema.Types.ObjectId, ref: "EvaluationFormH", default: null },
    formI: { type: Schema.Types.ObjectId, ref: "RotationForm", default: null },
    formJ: { type: Schema.Types.ObjectId, ref: "TeacherActivity", default: null },
    formK: { type: Schema.Types.ObjectId, ref: "MonographEvaluation", default: null },
    formR: { type: Schema.Types.ObjectId, ref: "MonographEvaluation", default: null },
  },
  { _id: false }
);


const TrainingYearRecordSchema = new Schema<ITrainingYearRecord>({
  yearLabel: { type: String, enum: ["سال اول", "سال دوم", "سال سوم", "سال چهارم"], required: true },
  academicYear: { type: String, required: true },
  startYear: { type: String, required: true },
  endYear: { type: String },
  status: { type: String, enum: ["در حال آموزش", "ختم شده"], default: "در حال آموزش" },
  forms: { type: FormsSchema, default: () => ({}) }, // ← تابع، نه آبجکت خالی مستقیم
});


const TrainerProgressSchema = new Schema<ITrainerProgress>(
  {
    trainer: { type: Schema.Types.ObjectId, ref: "Trainer", required: true, unique: true },
    startYear: { type: String, required: true },
    currentTrainingYear: { type: String, enum: ["سال اول", "سال دوم", "سال سوم", "سال چهارم"], required: true },
    trainingHistory: { type: [TrainingYearRecordSchema], default: [] },
    promoted: { type: Boolean, default: false },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const TrainerProgress =
  mongoose.models.TrainerProgress ||
  mongoose.model<ITrainerProgress>("TrainerProgress", TrainerProgressSchema);
