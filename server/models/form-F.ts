import mongoose, { Schema, Document } from "mongoose";

interface MonthScore {
  month: number;
  value: number;
}

interface Activity {
  id: string;
  title: string;
  percent: number;
  months: MonthScore[];
  total: number;
}

interface Section {
  name: string;
  activities: Activity[];
}

export interface IChecklist extends Document {
  trainerId: mongoose.Types.ObjectId; // ✅ اضافه شد
  name: string;
  parentType: string;
  trainingYear: string;
  sections: Section[];
}

const MonthScoreSchema = new Schema<MonthScore>({
  month: { type: Number, required: true },
  value: { type: Number, required: true },
});

const ActivitySchema = new Schema<Activity>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  percent: { type: Number, required: true },
  months: { type: [MonthScoreSchema], required: true },
  total: { type: Number, required: true },
});

const SectionSchema = new Schema<Section>({
  
  name: { type: String, required: true },
  activities: { type: [ActivitySchema], required: true },
});

const ChecklistSchema = new Schema<IChecklist>({
  trainerId: {
    type: Schema.Types.ObjectId,
    ref: "Trainer", // ✅ رفرنس به کالکشن ترینرها
    required: true,
  },
  name: { type: String, required: true },
  parentType: { type: String, required: true },
  trainingYear: { type: String, required: true },
  sections: { type: [SectionSchema], required: true },
});

export default mongoose.model<IChecklist>("Checklist", ChecklistSchema);