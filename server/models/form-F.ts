import mongoose, { Schema, Document } from "mongoose";
import { TrainerProgress } from "./TrainerProgress"; // 👈 مسیر را بررسی کن

interface MonthCheck {
  month: number;
  checked: boolean;
}

export interface IActivity {
  id: string;
  title: string;
  percent: number;
  months: MonthCheck[];
  notes: string;
}

export interface ISection {
  name: string;
  activities: IActivity[];
}

export interface IChecklist extends Document {
  trainerId: string;
  name: string;
  parentType: string;
  trainingYear: string;
  year: string;
  sections: ISection[];
}

// 🔹 زیرفیلدها
const MonthCheckSchema: Schema = new Schema({
  month: { type: Number, required: true },
  checked: { type: Boolean, required: true, default: false },
});

const ActivitySchema: Schema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  percent: { type: Number, required: true },
  months: { type: [MonthCheckSchema], default: [] },
  notes: { type: String, default: "" },
});

const SectionSchema: Schema = new Schema({
  name: { type: String, required: true },
  activities: { type: [ActivitySchema], default: [] },
});

// 🔹 چک‌لیست اصلی
const ChecklistSchema: Schema = new Schema(
  {
    trainerId: { type: String, required: true },
    name: { type: String, required: true },
    parentType: { type: String },
    trainingYear: { type: String },
    year: { type: String },
    sections: { type: [SectionSchema], default: [] },
  },
  { timestamps: true }
);

// ✅ بعد از ذخیره فرم، لینک به TrainerProgress
ChecklistSchema.post("save", async function (doc) {
  try {
    const trainerId = (doc as any).trainerId;
    const trainingYear = (doc as any).trainingYear;

    if (!trainerId || !trainingYear) return;

    // پیدا کردن TrainerProgress برای این ترینر
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
      yearRecord.forms.formF = (doc as any)._id; // 👈 آیدی فرم را ذخیره کن
      await progress.save();

      console.log(`✅ Checklist (Form F) linked to TrainerProgress (${trainingYear})`);
    } else {
      console.warn(
        `⚠️ trainingYear "${trainingYear}" not found in TrainerProgress for trainer ${trainerId}`
      );
    }
  } catch (error) {
    console.error("❌ Error linking Checklist to TrainerProgress:", error);
  }
});

// ✅ خروجی نهایی مدل
export const ChecklistModel = mongoose.model<IChecklist>(
  "Checklist",
  ChecklistSchema
);
