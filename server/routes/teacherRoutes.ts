import express from 'express';
import { TeacherModel } from '../models';
import { z } from 'zod';

const router = express.Router();

// Teacher validation schema
const createTeacherSchema = z.object({
  name: z.string().min(1, "Name is required"),
  lostname: z.string().min(1, "Last Name is required"),
  fatherName: z.string().min(1, "Father name is required"),
  grandfatherName: z.string().min(1, "Grandfather name is required"),
  academicRank: z.string().min(1, "Academic rank is required"),
  rankAchievementDate: z.string().transform((str) => new Date(str)),
  trainerAppointmentDate: z.string().transform((str) => new Date(str)),
  gender: z.enum(["Male", "Female"]),
  province: z.string().min(1, "Province is required"),
  subject: z.string().min(1, "Subject is required"),
  position: z.string().min(1, "Position is required"),
  hospital: z.string().min(1, "Hospital is required"),
  dateOfBirth: z.string().transform((str) => new Date(str)),
  idNumber: z.string().min(1, "ID number is required"),
  dutyStartDate: z.string().transform((str) => new Date(str)),
  contactInfo: z.string().min(1, "Contact info is required"),
  whatsappNumber: z.string().min(1, "WhatsApp number is required"),
  emailAddress: z.string().email("Valid email is required"),
  postCode: z.string().min(1, "Post code is required"),
  appointmentType: z.string().min(1, "Appointment type is required"),
  // department: z.string().min(1, "Department is required"),
  // experience: z.number().min(0, "Experience must be non-negative"),
  status: z.string().optional().default("active"),
  profileImageUrl: z.string().optional(),
});

const updateTeacherSchema = createTeacherSchema.partial();

// Get all teachers
router.get('/', async (req, res) => {
  try {
    const teachers = await TeacherModel.find().sort({ createdAt: -1 });
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ message: 'Failed to fetch teachers' });
  }
});

// Get teacher by ID
router.get('/:id', async (req, res) => {
  try {
    const teacher = await TeacherModel.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    console.error('Error fetching teacher:', error);
    res.status(500).json({ message: 'Failed to fetch teacher' });
  }
});

// Create new teacher
router.post('/', async (req, res) => {
  try {
    const validatedData = createTeacherSchema.parse(req.body);
    const teacher = new TeacherModel(validatedData);
    const savedTeacher = await teacher.save();
    res.status(201).json(savedTeacher);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    console.error('Error creating teacher:', error);
    res.status(500).json({ message: 'Failed to create teacher' });
  }
});

// Update teacher
router.put('/:id', async (req, res) => {
  try {
    const validatedData = updateTeacherSchema.parse(req.body);
    const teacher = await TeacherModel.findByIdAndUpdate(
      req.params.id,
      { ...validatedData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    res.json(teacher);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    console.error('Error updating teacher:', error);
    res.status(500).json({ message: 'Failed to update teacher' });
  }
});

// Delete teacher
router.delete('/:id', async (req, res) => {
  try {
    const teacher = await TeacherModel.findByIdAndDelete(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ message: 'Failed to delete teacher' });
  }
});

export { router as teacherRoutes };