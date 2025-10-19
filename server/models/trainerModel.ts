import mongoose, { Schema, Document } from "mongoose";

export interface ITrainer extends Document {
  id: string;
  name: string;
  lastName: string;
  parentType: string;
  parentName: string;
  gender: string;
  province: string;
  department: string;
  specialty: string;
  hospital: string;
  joiningDate: Date;
  trainingYear: string;
  supervisorName: string;
  birthDate: Date;
  idNumber: string;
  phoneNumber: string;
  whatsappNumber: string;
  email: string;
  postNumberAndCode: string;
  appointmentType: string;
  status: string;
  photo?: string; // مسیر عکس ذخیره شده
}

const trainerSchema = new Schema<ITrainer>(
  {
    id: { type: String },
    name: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    parentType: { type: String, trim: true },
    parentName: { type: String, trim: true },
    gender: { type: String, enum: ["مرد", "زن", ""], default: "" },
    province: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    specialty: { type: String, required: true, trim: true },
    hospital: { type: String, trim: true },
    joiningDate: { type: Date },
    trainingYear: { type: String, trim: true },
    supervisorName: { type: String, trim: true },
    birthDate: { type: Date },
    idNumber: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    whatsappNumber: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    postNumberAndCode: { type: String, trim: true },
    appointmentType: {
      type: String,
      enum: ["رقابت آزاد", "داوطلب", "حکمی", "بست خالی", ""],
      default: "",
    },
    status: {
      type: String,
      enum: ["برحال", "خدماتی", ""],
      default: "",
    },
    photo: { type: String, trim: true }, // مسیر عکس ذخیره می‌شود
  },
  { timestamps: true }
);

export default mongoose.models.Trainer ||
  mongoose.model<ITrainer>("Trainer", trainerSchema);
