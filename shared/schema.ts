import { z } from "zod";

// Demo User Credentials
export const DEMO_CREDENTIALS = {
  admin: {
    username: "admin@com",
    password: "admin123",
    id: "demo_admin_001",
    firstName: "Admin",
    lastName: "User",
    role: "admin"
  },
  viewer: {
    username: "viewer@com",
    password: "Viewer123",
    id: "demo_viewer_001", 
    firstName: "Viewer",
    lastName: "User",
    role: "viewer"
  }
};

// Zod validation schemas
export const insertResidentSchema = z.object({
  fullName: z.string().min(1),
  age: z.number().min(1).max(150),
  gender: z.string().min(1),
  department: z.string().min(1),
  startDate: z.date(),
  endDate: z.date().optional(),
  status: z.string().default("active"),
  profileImageUrl: z.string().optional(),
});

export const insertTeacherSchema = z.object({
  name: z.string().min(1),
  lostname: z.string().min(1),
  fatherName: z.string().min(1),
  grandfatherName: z.string().min(1),
  academicRank: z.string().min(1),
  rankAchievementDate: z.date(),
  trainerAppointmentDate: z.date(),
  gender: z.string().min(1),
  province: z.string().min(1),
  subject: z.string().min(1),
  position: z.string().min(1),
  hospital: z.string().min(1),
  dateOfBirth: z.date(),
  idNumber: z.string().min(1),
  dutyStartDate: z.date(),
  contactInfo: z.string().min(1),
  whatsappNumber: z.string().min(1),
  emailAddress: z.string().email(),
  postCode: z.string().min(1),
  appointmentType: z.string().min(1),
  status: z.string().default("active"),
  profileImageUrl: z.string().optional(),
});

export const insertFormSchema = z.object({
  residentId: z.string().min(1),
  formType: z.string().min(1),
  formData: z.record(z.any()),
  supervisorId: z.string().optional(),
  status: z.string().default("draft"),
  completedAt: z.date().optional(),
});

export const insertDisciplinaryActionSchema = z.object({
  residentId: z.string().min(1),
  date: z.date(),
  description: z.string().min(1),
  actionTaken: z.string().min(1),
  severity: z.string().default("minor"),
  createdBy: z.string().min(1),
});

export const insertRewardSchema = z.object({
  residentId: z.string().min(1),
  date: z.date(),
  description: z.string().min(1),
  rewardType: z.string().min(1),
  amount: z.string().optional(),
  createdBy: z.string().min(1),
});

// Basic Types for interface compatibility
export type UpsertUser = {
  _id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role?: string;
};

export type InsertResident = z.infer<typeof insertResidentSchema>;
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type InsertForm = z.infer<typeof insertFormSchema>;
export type InsertDisciplinaryAction = z.infer<typeof insertDisciplinaryActionSchema>;
export type InsertReward = z.infer<typeof insertRewardSchema>;

// Interface types that match our models
export type User = {
  _id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  password?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Resident = {
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
};

export type Teacher = {
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
  status: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Form = {
  _id: string;
  residentId: string;
  formType: string;
  formData: Record<string, any>;
  supervisorId?: string;
  status: string;
  completedAt?:string;
  createdAt: string;
  updatedAt: string;
};

export type DisciplinaryAction = {
  _id: string;
  residentId: string;
  date: Date;
  description: string;
  actionTaken: string;
  severity: string;
  createdBy: string;
  createdAt: Date;
};

export type Reward = {
  _id: string;
  residentId: string;
  date: Date;
  description: string;
  rewardType: string;
  amount?: string;
  createdBy: string;
  createdAt: Date;
};