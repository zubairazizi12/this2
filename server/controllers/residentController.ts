import { Request, Response } from 'express';
import { ResidentModel, UserModel } from '../models';
import { z } from 'zod';

const createResidentSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  age: z.number().min(18, "Age must be at least 18").max(100, "Age must be less than 100"),
  gender: z.enum(["Male", "Female"]),
  department: z.string().min(1, "Department is required"),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  status: z.string().optional().default("active"),
  profileImageUrl: z.string().optional(),
});

export class ResidentController {
  static async getAllResidents(req: Request, res: Response) {
    try {
      const residents = await ResidentModel.find().sort({ createdAt: -1 });
      res.json(residents);
    } catch (error) {
      console.error('Error fetching residents:', error);
      res.status(500).json({ message: 'Failed to fetch residents' });
    }
  }

  static async getResidentById(req: Request, res: Response) {
    try {
      const resident = await ResidentModel.findById(req.params.id);
      if (!resident) {
        return res.status(404).json({ message: 'Resident not found' });
      }
      res.json(resident);
    } catch (error) {
      console.error('Error fetching resident:', error);
      res.status(500).json({ message: 'Failed to fetch resident' });
    }
  }

  static async createResident(req: any, res: Response) {
    try {
      const user = await UserModel.findById(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = createResidentSchema.parse(req.body);
      const resident = new ResidentModel(validatedData);
      const savedResident = await resident.save();
      res.status(201).json(savedResident);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      console.error("Error creating resident:", error);
      res.status(500).json({ message: "Failed to create resident" });
    }
  }

  static async updateResident(req: any, res: Response) {
    try {
      const user = await UserModel.findById(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = createResidentSchema.partial().parse(req.body);
      const resident = await ResidentModel.findByIdAndUpdate(
        req.params.id,
        { ...validatedData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      if (!resident) {
        return res.status(404).json({ message: "Resident not found" });
      }
      
      res.json(resident);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      console.error("Error updating resident:", error);
      res.status(500).json({ message: "Failed to update resident" });
    }
  }

  static async deleteResident(req: any, res: Response) {
    try {
      const user = await UserModel.findById(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const resident = await ResidentModel.findByIdAndDelete(req.params.id);
      if (!resident) {
        return res.status(404).json({ message: "Resident not found" });
      }
      res.json({ message: "Resident deleted successfully" });
    } catch (error) {
      console.error("Error deleting resident:", error);
      res.status(500).json({ message: "Failed to delete resident" });
    }
  }
}