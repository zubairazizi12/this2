import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITrainerAction extends Document {
  trainer: Types.ObjectId; // رفرنس به ترینر
  description: string; // توضیحات اکشن
  files: { 
    filename: string; 
    originalName: string; 
    path: string; 
    size: number;
  }[]; // آرایه فایل‌های آپلود شده
  createdAt: Date;
  updatedAt: Date;
}

const TrainerActionSchema = new Schema<ITrainerAction>(
  {
    trainer: {
      type: Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    files: {
      type: [{
        filename: String,
        originalName: String,
        path: String,
        size: Number,
      }],
      default: [],
    },
  },
  { timestamps: true }
);

export const TrainerAction = mongoose.model<ITrainerAction>(
  "TrainerAction",
  TrainerActionSchema
);
