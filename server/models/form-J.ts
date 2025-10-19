
// models/TeacherActivity.ts
import mongoose, { Schema, Document } from "mongoose";

// 🔹 ساختار هر فعالیت
interface IActivity {
  section: string;           // بخش مثل "آغاز فعالیت"
  activity: string;          // فعالیت خاص
  evaluators: boolean[];     // آرایه‌ای از تیک‌ها برای هر استاد
}

// 🔹 ساختار اصلی سند
export interface ITeacherActivity extends Document {
  trainerId: mongoose.Types.ObjectId;  // ارجاع به ترینر
  name: string;                        // نام ترینر
  parentType: string;                  // نام پدر
  trainingYear: string;                // سال تریننگ
  teachers: string[];                  // نام استادها
  activities: IActivity[];             // لیست فعالیت‌ها
  createdAt: Date;
  updatedAt: Date;
}

// 🔹 اسکیمای فعالیت‌ها
const ActivitySchema = new Schema<IActivity>({
  section: { type: String, required: true },
  activity: { type: String, required: true },
  evaluators: {
    type: [Boolean],
    required: true,
    validate: {
      validator: (arr: boolean[]) => arr.length <= 5,
      message: "تعداد evaluator‌ها نباید بیشتر از ۵ باشد",
    },
  },
});

// 🔹 اسکیمای اصلی TeacherActivity
const TeacherActivitySchema = new Schema<ITeacherActivity>(
  {
    trainerId: {
      type: Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
    name: { type: String, required: true },
    parentType: { type: String, required: true },
    trainingYear: { type: String, required: true },
    teachers: {
      type: [String],
      validate: {
        validator: (arr: string[]) => arr.length <= 5,
        message: "حداکثر ۵ استاد مجاز است",
      },
      required: true,
    },
    activities: { type: [ActivitySchema], required: true },
  },
  {
    timestamps: true, // ایجاد فیلدهای createdAt و updatedAt
  }
);

// 🔹 مدل نهایی
export const TeacherActivityModel = mongoose.model<ITeacherActivity>(
  "TeacherActivity",
  TeacherActivitySchema
);
