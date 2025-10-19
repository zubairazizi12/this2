import mongoose, { Document, Schema } from "mongoose";

export interface IVacancy extends Document {
  _id: string;
  name: string;
  count: number;
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

const vacancySchema = new Schema<IVacancy>({
  name: { type: String, required: true },
  count: { type: Number, required: true, default: 1 },
  date: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const VacancyModel = mongoose.model<IVacancy>("Vacancy", vacancySchema);
