import express from 'express';
import { LectureModel } from '../models/Lecture';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Setup upload directory for lecture files
const uploadDir = path.join(process.cwd(), "uploads", "lectures");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const createLectureSchema = z.object({
  teacherId: z.string().min(1, "Teacher ID is required"),
  date: z.string().transform((str) => new Date(str)),
  subject: z.string().min(1, "Subject is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  room: z.string().min(1, "Room is required"),
  notes: z.string().optional().default(""),
});

router.post('/', upload.array("files", 10), async (req, res) => {
  try {
    const uploadedFiles = req.files as Express.Multer.File[];
    const validatedData = createLectureSchema.parse(req.body);
    
    const files = uploadedFiles?.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
    })) || [];
    
    const lecture = new LectureModel({
      ...validatedData,
      files,
    });
    const savedLecture = await lecture.save();
    res.status(201).json(savedLecture);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    console.error('Error creating lecture:', error);
    res.status(500).json({ message: 'Failed to create lecture' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { teacherId } = req.query;
    const query = teacherId ? { teacherId } : {};
    const lectures = await LectureModel.find(query).sort({ date: -1 });
    res.json(lectures);
  } catch (error) {
    console.error('Error fetching lectures:', error);
    res.status(500).json({ message: 'Failed to fetch lectures' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const lecture = await LectureModel.findById(req.params.id);
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }
    res.json(lecture);
  } catch (error) {
    console.error('Error fetching lecture:', error);
    res.status(500).json({ message: 'Failed to fetch lecture' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const validatedData = createLectureSchema.partial().parse(req.body);
    const lecture = await LectureModel.findByIdAndUpdate(
      req.params.id,
      { ...validatedData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }
    
    res.json(lecture);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    console.error('Error updating lecture:', error);
    res.status(500).json({ message: 'Failed to update lecture' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const lecture = await LectureModel.findByIdAndDelete(req.params.id);
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }
    res.json({ message: 'Lecture deleted successfully' });
  } catch (error) {
    console.error('Error deleting lecture:', error);
    res.status(500).json({ message: 'Failed to delete lecture' });
  }
});

// Download lecture file
router.get("/download/:filename", (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security: prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ message: "نام فایل نامعتبر است" });
    }

    const filePath = path.join(uploadDir, filename);
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadDir = path.resolve(uploadDir);

    // Ensure file is within upload directory
    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      return res.status(403).json({ message: "دسترسی غیرمجاز" });
    }

    // Check file exists
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ message: "فایل یافت نشد" });
    }

    res.download(resolvedPath);
  } catch (error) {
    console.error("Error downloading lecture file:", error);
    res.status(500).json({ message: "خطا در دانلود فایل" });
  }
});

export { router as lectureRoutes };
