import mongoose, { Document, Schema } from "mongoose";

export interface IResident extends Document {
  _id: string;
  fullName: string;
  age: number;
  gender: string;
  department: string;
  startDate: Date;
  endDate?: Date;
  status: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const residentSchema = new Schema<IResident>({
  fullName: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  department: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: Date,
  status: { type: String, required: true, default: "active" },
  profileImageUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const ResidentModel = mongoose.model<IResident>("Resident", residentSchema);