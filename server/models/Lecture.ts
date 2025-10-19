import mongoose, { Document, Schema } from "mongoose";

export interface ILecture extends Document {
  _id: string;
  teacherId: string;
  date: Date;
  subject: string;
  startTime: string;
  endTime: string;
  room: string;
  notes: string;
  files: ({
    filename: string;
    originalName: string;
    path: string;
    size: number;
  } | string)[];
  createdAt: Date;
  updatedAt: Date;
}

const lectureSchema = new Schema<ILecture>({
  teacherId: { type: String, required: true, ref: "Teacher" },
  date: { type: Date, required: true },
  subject: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  room: { type: String, required: true },
  notes: { type: String, default: "" },
  files: {
    type: Schema.Types.Mixed,
    default: [],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const LectureModel = mongoose.model<ILecture>("Lecture", lectureSchema);
