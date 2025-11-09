import mongoose, { Schema, Document } from "mongoose";
import { TrainerProgress } from "./TrainerProgress"; // 👈 اضافه شد

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
      required: true,
      validate: {
        validator: (arr: string[]) => arr.length <= 5,
        message: "حداکثر ۵ استاد مجاز است",
      },
    },
    activities: { type: [ActivitySchema], required: true },
  },
  { timestamps: true }
);

// ✅ بعد از ذخیره، آیدی فرم را در TrainerProgress → forms.formJ ذخیره کن
TeacherActivitySchema.post("save", async function (doc) {
  try {
    const trainerId = doc.trainerId;
    const trainingYear = doc.trainingYear;

    if (!trainerId || !trainingYear) return;

    // پیدا کردن TrainerProgress
    const progress = await TrainerProgress.findOne({ trainer: trainerId });
    if (!progress) {
      console.warn(`⚠️ TrainerProgress برای ترینر ${trainerId} پیدا نشد`);
      return;
    }

    // پیدا کردن سال مربوطه
    const yearRecord = progress.trainingHistory.find(
      (y: any) => y.yearLabel === trainingYear
    );

    if (yearRecord) {
      if (!yearRecord.forms) yearRecord.forms = {};
      yearRecord.forms.formJ = doc._id; // ✅ فرم TeacherActivity در فرم J
      await progress.save();

      console.log(`✅ TeacherActivity linked to TrainerProgress (${trainingYear})`);
    } else {
      console.warn(
        `⚠️ trainingYear "${trainingYear}" not found in TrainerProgress for trainer ${trainerId}`
      );
    }
  } catch (error) {
    console.error("❌ Error linking TeacherActivity to TrainerProgress:", error);
  }
});

// 🔹 مدل نهایی
export const TeacherActivityModel =
  mongoose.models.TeacherActivity ||
  mongoose.model<ITeacherActivity>("TeacherActivity", TeacherActivitySchema);
