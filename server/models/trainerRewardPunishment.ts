import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITrainerRewardPunishment extends Document {
  trainer: Types.ObjectId;
  type: "reward" | "punishment"; // نوع: مکافات یا مجازات
  description: string;
  files: { 
    filename: string; 
    originalName: string; 
    path: string; 
    size: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const TrainerRewardPunishmentSchema = new Schema<ITrainerRewardPunishment>(
  {
    trainer: {
      type: Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
    type: {
      type: String,
      enum: ["reward", "punishment"],
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

export const TrainerRewardPunishment = mongoose.model<ITrainerRewardPunishment>(
  "TrainerRewardPunishment",
  TrainerRewardPunishmentSchema
);
