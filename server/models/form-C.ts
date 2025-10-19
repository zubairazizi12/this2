// models/MonographEvaluationForm.ts
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMonographEvaluationForm extends Document {
  trainer: Types.ObjectId; // ⬅️ رفرنس به Trainer
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
  evaluations: {
    section: string; // نام بخش مثل نمره سیکل، مجموع نمرات ...
    percentage: string; // فیصدی
    score: string; // نمره
    teacherName: string; // نام استاد
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// اسکیمای هر آیتم ارزیابی
const MonographEvaluationItemSchema: Schema = new Schema({
  section: { type: String, required: true },
  percentage: { type: String, required: true },
  score: { type: String, required: true },
  teacherName: { type: String, required: true },
});

// اسکیمای اصلی فرم
const MonographEvaluationFormSchema: Schema = new Schema(
  {
    trainer: {
      type: Schema.Types.ObjectId,
      ref: "Trainer", // ⬅️ به مدل Trainer وصل می‌شود
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
    evaluations: [MonographEvaluationItemSchema], // آرایه ارزیابی‌ها
  },
  {
    timestamps: true, // createdAt و updatedAt اتوماتیک
  }
);

export const MonographEvaluationForm = mongoose.model<IMonographEvaluationForm>(
  "MonographEvaluationForm",
  MonographEvaluationFormSchema
);
