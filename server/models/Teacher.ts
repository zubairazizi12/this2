import mongoose, { Document, Schema } from "mongoose";

export interface ITeacher extends Document {
  _id: string;
  name: string;
  lostname:string;
  fatherName: string;
  grandfatherName: string;
  academicRank: string;
  rankAchievementDate: Date;
  trainerAppointmentDate: Date;
  gender: string;
  province: string;
  subject: string;
  position: string;
  hospital: string;
  dateOfBirth: Date;
  idNumber: string;
  dutyStartDate: Date;
  contactInfo: string;
  whatsappNumber: string;
  emailAddress: string;
  postCode: string;
  appointmentType: string;
  // department: string;
  // experience: number;
  status: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const teacherSchema = new Schema<ITeacher>({
  name: { type: String, required: true },
  lostname: { type: String, required: true },
  fatherName: { type: String, required: true },
  grandfatherName: { type: String, required: true },
  academicRank: { type: String, required: true },
  rankAchievementDate: { type: Date, required: true },
  trainerAppointmentDate: { type: Date, required: true },
  gender: { type: String, required: true },
  province: { type: String, required: true },
  subject: { type: String, required: true },
  position: { type: String, required: true },
  hospital: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  idNumber: { type: String, required: true, unique: true },
  dutyStartDate: { type: Date, required: true },
  contactInfo: { type: String, required: true },
  whatsappNumber: { type: String, required: true },
  emailAddress: { type: String, required: true },
  postCode: { type: String, required: true },
  appointmentType: { type: String, required: true },
  // department: { type: String, required: true },
  // experience: { type: Number, required: true },
  status: { type: String, required: true, default: "active" },
  profileImageUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const TeacherModel = mongoose.model<ITeacher>("Teacher", teacherSchema);