
import { Request, Response } from "express";
import { Types } from "mongoose";
import path from "path";
import fs from "fs";
import { ITrainerProgress } from "../models/TrainerProgress";


import TrainerModel from "../models/trainerModel";
import {
  TrainerProgress,
  ITrainingYearRecord,
} from "../models/TrainerProgress";

/* =========================
   Types for lean results
   ========================= */
export interface IProgressLean {
  _id: Types.ObjectId;
  trainer: Types.ObjectId | string;
  startYear?: string;
  currentTrainingYear?: string;
  trainingHistory?: ITrainingYearRecord[];
  promoted?: boolean;
  [k: string]: any;
}

export interface ITrainerLean {
  _id: Types.ObjectId;
  id?: string;
  name?: string;
  lastName?: string;
  province?: string;
  department?: string;
  specialty?: string;
  photo?: string;
  trainerProgress?: IProgressLean | null;
  [k: string]: any;
}

/* =========================
   Trainer Controller
   ========================= */
export const TrainerController = {
  /* ---------- create trainer + initial progress ---------- */
  createTrainer: async (req: Request, res: Response) => {
    try {
      const { file } = req;
      const data: Partial<ITrainerLean> = req.body;

      if (file) data.photo = `/uploads/trainers/${file.filename}`;

      const {
        id,
        name,
        lastName,
        province,
        department,
        specialty,
        academicYear,
      } = data;
      if (!name || !lastName || !province || !department || !specialty) {
        return res
          .status(400)
          .json({ message: "تمام فیلدهای ضروری را تکمیل کنید." });
      }

      if (id) {
        const exist = await TrainerModel.findOne({ id })
          .lean<ITrainerLean>()
          .exec();
        if (exist)
          return res
            .status(409)
            .json({ message: "این آیدی قبلاً ثبت شده است." });
      }

      // ایجاد ترینر جدید
      const newTrainer = new TrainerModel(data);
      await newTrainer.save();

      const year = academicYear
        ? String(academicYear)
        : new Date().getFullYear().toString();

      // ایجاد پیشرفت اولیه بدون فرم
      const firstYear: ITrainingYearRecord = {
        yearLabel: "سال اول",
        academicYear: year,
        startYear: year,
        status: "در حال آموزش",
        forms: {}, // هیچ فرم اولیه ندارد
      };

      const newProgress = new TrainerProgress({
        trainer: newTrainer._id,
        startYear: year,
        currentTrainingYear: "سال اول",
        trainingHistory: [firstYear],
        promoted: false,
      });

      await newProgress.save();

      return res.status(201).json({
        message: "ترینر با موفقیت ثبت شد",
        trainer: newTrainer,
        progress: newProgress,
      });
    } catch (error: any) {
      console.error("Error creating trainer:", error);
      return res
        .status(500)
        .json({ message: "خطا در ثبت ترینر", error: error.message });
    }
  },


  /* ---------- get all trainers with progress + populate forms ---------- */
  getAllTrainersWithProgress: async (_req: Request, res: Response) => {
    try {
      // دریافت همه ترینرها
      const trainers = await TrainerModel.find()
        .sort({ createdAt: -1 })
        .lean<ITrainerLean[]>()
        .exec();

      if (!Array.isArray(trainers)) return res.status(200).json([]);

      const trainerIds = trainers.map((t) => t._id);

      // دریافت همه پروگرس‌ها با populate کامل
      const progresses = await TrainerProgress.find({
        trainer: { $in: trainerIds },
      })
        .populate("trainer", "_id name lastName department specialty province") // فقط فیلدهای لازم
        .populate("trainingHistory.forms.formC")
        .populate("trainingHistory.forms.formD")
        .populate("trainingHistory.forms.formE")
        .populate("trainingHistory.forms.formF")
        .populate("trainingHistory.forms.formG")
        .populate("trainingHistory.forms.formH")
        .populate("trainingHistory.forms.formI")
        .populate("trainingHistory.forms.formJ")
        .populate("trainingHistory.forms.formK")
        .populate("trainingHistory.forms.formR")
        .lean<IProgressLean[]>()
        .exec();

      /* 🧩 helper امن برای گرفتن trainerId در همه حالت‌ها */
      const getTrainerId = (p: IProgressLean): string | null => {
        const t = (p as any).trainer;
        if (!t) return null;

        // اگر trainer رشته باشد
        if (typeof t === "string") return t;

        // اگر trainer از نوع ObjectId باشد
        if (t instanceof Types.ObjectId) return t.toString();

        // اگر trainer populated object باشد (یعنی دارای _id)
        if (typeof t === "object" && "_id" in t) {
          const id = (t as any)._id;
          return id instanceof Types.ObjectId ? id.toString() : String(id);
        }

        // fallback
        return String(t);
      };

      /* ✅ اتصال progress مربوط به هر trainer (type-safe) */
      const trainersWithProgress = trainers.map((t) => {
        const matched = progresses.find((p) => {
          const pid = getTrainerId(p);
          return pid !== null && pid === String(t._id);
        });
        return { ...t, trainerProgress: matched || null };
      });

      return res.status(200).json(trainersWithProgress);
    } catch (error: any) {
      console.error("Error fetching trainers with progress:", error);
      return res.status(500).json({
        message: "خطا در دریافت ترینرها",
        error: error.message,
      });
    }
  },
  
  /* ---------- get single trainer by mongoId ---------- */
  getTrainerById: async (req: Request, res: Response) => {
    try {
      const { mongoId } = req.params;
      if (!mongoId)
        return res.status(400).json({ message: "mongoId لازم است." });

      // دریافت ترینر
      const trainer = await TrainerModel.findById(mongoId)
        .lean<ITrainerLean>()
        .exec();

      if (!trainer) return res.status(404).json({ message: "ترینر یافت نشد." });

      // دریافت پروگرس ترینر
      const progress = await TrainerProgress.findOne({
        trainer: new Types.ObjectId(mongoId),
      })
        .populate("trainer", "_id name lastName department specialty province") // ✅ فیلدهای لازم
        .populate("trainingHistory.forms.formC")
        .populate("trainingHistory.forms.formD")
        .populate("trainingHistory.forms.formE")
        .populate("trainingHistory.forms.formF")
        .populate("trainingHistory.forms.formG")
        .populate("trainingHistory.forms.formH")
        .populate("trainingHistory.forms.formI")
        .populate("trainingHistory.forms.formJ")
        .populate("trainingHistory.forms.formK")
        .populate("trainingHistory.forms.formR")
        .lean<IProgressLean>()
        .exec();

      // اطمینان از مچ بودن trainer حتی در حالت populated
      if (
        progress &&
        progress.trainer &&
        typeof progress.trainer === "object"
      ) {
        const trainerId =
          (progress.trainer as any)?._id?.toString?.() ||
          progress.trainer?.toString?.();
        if (trainerId !== mongoId) {
          console.warn(
            `⚠️ Trainer mismatch: expected ${mongoId}, got ${trainerId}`
          );
        }
      }

      return res.status(200).json({
        trainer,
        trainerProgress: progress || null,
      });
    } catch (error: any) {
      console.error("Error fetching trainer:", error);
      return res.status(500).json({
        message: "خطا در دریافت ترینر",
        error: error.message,
      });
    }
  },

  /* ---------- update trainer ---------- */
  updateTrainer: async (req: Request, res: Response) => {
    try {
      const { mongoId } = req.params;
      if (!mongoId) {
        return res.status(400).json({ message: "شناسه ترینر (mongoId) الزامی است." });
      }
  
      const { file } = req;
      const updateData: Partial<ITrainerLean> = { ...req.body };
  
      // اگر عکس جدید ارسال شده باشد، مسیرش را اضافه کن
      if (file) {
        updateData.photo = `/uploads/trainers/${file.filename}`;
      }
  
      // حذف فیلدهایی که نباید از سمت کلاینت ویرایش شوند (امنیت)
      delete (updateData as any)._id;
      delete (updateData as any).trainerProgress;
  
      // بروز‌رسانی ترینر
      const updatedTrainer = await TrainerModel.findByIdAndUpdate(
        mongoId,
        updateData,
        { new: true, runValidators: true }
      ).lean();
  
      if (!updatedTrainer) {
        return res.status(404).json({ message: "ترینر یافت نشد." });
      }
  
      return res.status(200).json({
        message: "✅ ترینر با موفقیت بروزرسانی شد.",
        trainer: updatedTrainer,
      });
    } catch (error: any) {
      console.error("❌ Error updating trainer:", error);
      return res.status(500).json({
        message: "خطا در بروزرسانی ترینر",
        error: error.message,
      });
    }
  },
  

  /* ---------- delete trainer ---------- */
  deleteTrainer: async (req: Request, res: Response) => {
    try {
      const { mongoId } = req.params;
      const deleted = await TrainerModel.findByIdAndDelete(mongoId).exec();
      if (!deleted) return res.status(404).json({ message: "ترینر یافت نشد." });

      if (deleted.photo) {
        const photoPath = path.join(__dirname, "..", deleted.photo);
        if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
      }

      return res.status(200).json({ message: "ترینر با موفقیت حذف شد." });
    } catch (error: any) {
      console.error("Error deleting trainer:", error);
      return res
        .status(500)
        .json({ message: "خطا در حذف ترینر", error: error.message });
    }
  },

  /* ---------- promote trainer year ---------- */
  promoteTrainerYear: async (req: Request, res: Response) => {
    try {
      const { mongoId } = req.params;
      const { nextYear } = req.body; // (optional) می‌تونی از client بفرستی یا از order محاسبه شود
  
      if (!mongoId) return res.status(400).json({ message: "mongoId لازم است." });
  
      const progress = await TrainerProgress.findOne({
        trainer: new Types.ObjectId(mongoId),
      }).exec();
  
      if (!progress) return res.status(404).json({ message: "Progress ترینر یافت نشد." });
  
      // ترتیب سال‌ها (قابل تنظیم)
      const yearOrder = ["سال اول", "سال دوم", "سال سوم", "سال چهارم"];
  
      const currentYear = progress.currentTrainingYear;
      const currentIndex = yearOrder.indexOf(currentYear);
      if (currentIndex === -1) {
        return res.status(400).json({ message: "سال فعلی در پروگرس معتبر نیست." });
      }
  
      // اگر کاربر nextYear را ارسال کرده باشد، از آن استفاده کن، در غیر اینصورت خودمون محاسبه کنیم
      const computedNextYear = nextYear && yearOrder.includes(String(nextYear))
        ? String(nextYear)
        : yearOrder[currentIndex + 1];
  
      if (!computedNextYear) {
        return res.status(400).json({ message: "سال بعدی قابل محاسبه نیست (یا در انتهای دوره هستید)." });
      }
  
     // جلوگیری از ایجاد دوباره همان سال
if (
  progress.trainingHistory.some(
    (y: ITrainingYearRecord) => y.yearLabel === computedNextYear
  )
) {
  return res
    .status(400)
    .json({ message: `سال "${computedNextYear}" از قبل موجود است.` });
}
  
      
      
      // خاتمه سال فعلی (اگر وجود داشته باشد)
      const currentRecord = progress.trainingHistory.find(
        (y: ITrainingYearRecord) => y.yearLabel === currentYear
      );
      
      if (currentRecord) {
        currentRecord.status = "ختم شده";
        currentRecord.endYear = new Date().getFullYear().toString();
      }
      
  
      // محاسبه academicYear برای سال جدید بر اساس آخرین academic موجود (یا سال جاری)
      const lastAcademic = progress.trainingHistory.at(-1)?.academicYear || new Date().getFullYear().toString();
      const nextAcademic = (Number(lastAcademic) + 1).toString();
  
      // فرم‌های از پیش ساخته‌شده (کلیدها با مقدار null)
      const emptyForms = {}; // ← Mongoose خودش default=null می‌دهد

  
      // ساخت رکورد سال جدید مطابق اسکیمای ITrainingYearRecord
      const newYearRecord: ITrainingYearRecord = {
        yearLabel: computedNextYear as ITrainingYearRecord["yearLabel"],
        academicYear: nextAcademic,
        startYear: nextAcademic,
        status: "در حال آموزش",
        forms: emptyForms,
      };
  
      // اضافه کردن رکورد جدید
      progress.trainingHistory.push(newYearRecord);
  
      // بروز رسانی فیلدهای progress
      progress.currentTrainingYear = computedNextYear as ITrainerProgress["currentTrainingYear"];
      progress.promoted = true;
      progress.lastUpdated = new Date();
  
      // اگر لازم دیدی می‌تونی دقیقاً مسیر رو markModified کنی (به‌طور کلی push+save کافی است)
      const yearIndex = progress.trainingHistory.length - 1;
      progress.markModified(`trainingHistory.${yearIndex}.forms`);
  
      await progress.save();
  
      // برای پاسخ خواناتر، می‌توانیم progress را مجدداً populate کنیم (اختیاری)
      const populated = await TrainerProgress.findById(progress._id)
        .populate("trainingHistory.forms.formC")
        .populate("trainingHistory.forms.formD")
        .populate("trainingHistory.forms.formE")
        .populate("trainingHistory.forms.formF")
        .populate("trainingHistory.forms.formG")
        .populate("trainingHistory.forms.formH")
        .populate("trainingHistory.forms.formI")
        .populate("trainingHistory.forms.formJ")
        .populate("trainingHistory.forms.formK")
        .populate("trainingHistory.forms.formR")
        .lean()
        .exec();
  
      return res.status(200).json({
        message: `✅ ترینر با موفقیت به "${computedNextYear}" ارتقا یافت.`,
        progress: populated ?? progress,
      });
    } catch (error: any) {
      console.error("Error in promoteTrainerYear:", error);
      // اگر ValidationError باشه، پیام دقیق را برگردان تا راحت debug بشه
      if (error.name === "ValidationError") {
        return res.status(400).json({ message: "ValidationError هنگام ارتقاء", details: error.message });
      }
      return res.status(500).json({ message: "خطا در ارتقای سال آموزشی ترینر", error: error.message });
    }
  },
  
  
  
  

  /* ---------- filter trainers by year ---------- */
  getTrainersByYear: async (req: Request, res: Response) => {
    try {
      const { academicYear, currentTrainingYear } = req.query;
      const query: any = {};
      if (academicYear)
        query["trainingHistory.academicYear"] = String(academicYear);
      if (currentTrainingYear)
        query.currentTrainingYear = String(currentTrainingYear);

      const results = await TrainerProgress.find(query)
        .populate("trainer")
        .populate("trainingHistory.forms.formC")
        .populate("trainingHistory.forms.formD")
        .populate("trainingHistory.forms.formE")
        .populate("trainingHistory.forms.formF")
        .populate("trainingHistory.forms.formG")
        .populate("trainingHistory.forms.formH")
        .populate("trainingHistory.forms.formI")
        .populate("trainingHistory.forms.formJ")
        .populate("trainingHistory.forms.formK")
        .populate("trainingHistory.forms.formR")
        .lean<IProgressLean[]>()
        .exec();

      return res.status(200).json(Array.isArray(results) ? results : []);
    } catch (error: any) {
      console.error("Error filtering trainers:", error);
      return res
        .status(500)
        .json({ message: "خطا در فیلتر ترینرها", error: error.message });
    }
  },
  /* ---------- add form to trainer ---------- */
  addFormToTrainer: async (req: Request, res: Response) => {
    try {
      const { mongoId } = req.params;
      const { yearLabel, formType, formId } = req.body;
  
      if (!yearLabel || !formType || !formId) {
        return res
          .status(400)
          .json({ message: "yearLabel، formType و formId الزامی هستند." });
      }
  
      const trainer = await TrainerModel.findById(mongoId).lean();
      if (!trainer)
        return res.status(404).json({ message: "ترینر یافت نشد." });
  
      const progress = await TrainerProgress.findOne({
        trainer: new Types.ObjectId(mongoId),
      }).exec();
      if (!progress)
        return res.status(404).json({ message: "Progress مربوط به ترینر یافت نشد." });
  
      const targetYear = progress.trainingHistory.find(
        (y: ITrainingYearRecord) => y.yearLabel === yearLabel
      );
      if (!targetYear) {
        return res
          .status(404)
          .json({ message: `سال "${yearLabel}" در progress یافت نشد.` });
      }
  
      // ✅ افزودن آیدی فرم به آن سال
      if (!targetYear.forms) targetYear.forms = {};
      targetYear.forms[formType] = new Types.ObjectId(formId);
  
      // ✅ علامت دقیق تغییر برای mongoose
      const yearIndex = progress.trainingHistory.findIndex(
        (y: ITrainingYearRecord) => y.yearLabel === yearLabel
      );
      progress.markModified(`trainingHistory.${yearIndex}.forms`);
  
      await progress.save();
  
      return res.status(200).json({
        message: "✅ فرم با موفقیت به ترینر افزوده شد.",
        progress,
      });
    } catch (error: any) {
      console.error("❌ Error in addFormToTrainer:", error);
      return res.status(500).json({
        message: "خطا در افزودن فرم به ترینر",
        error: error.message,
      });
    }
  }
  
};
