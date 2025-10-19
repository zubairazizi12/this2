import express from 'express';
import { VacancyModel } from '../models';
import { z } from 'zod';
import { isMongoConnected } from '../db';

const router = express.Router();

interface VacancyData {
  _id: string;
  name: string;
  count: number;
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

const inMemoryVacancies: VacancyData[] = [];
let inMemoryIdCounter = 1;

// Vacancy validation schema
const createVacancySchema = z.object({
  name: z.string().min(1, "نام بست الزامی است"),
  count: z.number().min(1, "تعداد باید حداقل 1 باشد"),
  date: z.string().min(1, "تاریخ الزامی است"),
});

const updateVacancySchema = createVacancySchema.partial();

// Get all vacancies
router.get('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const vacancies = await VacancyModel.find().sort({ createdAt: -1 });
      res.json(vacancies);
    } else {
      res.json(inMemoryVacancies.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    }
  } catch (error) {
    console.error('Error fetching vacancies:', error);
    res.status(500).json({ message: 'Failed to fetch vacancies' });
  }
});

// Get vacancy by ID
router.get('/:id', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const vacancy = await VacancyModel.findById(req.params.id);
      if (!vacancy) {
        return res.status(404).json({ message: 'Vacancy not found' });
      }
      res.json(vacancy);
    } else {
      const vacancy = inMemoryVacancies.find(v => v._id === req.params.id);
      if (!vacancy) {
        return res.status(404).json({ message: 'Vacancy not found' });
      }
      res.json(vacancy);
    }
  } catch (error) {
    console.error('Error fetching vacancy:', error);
    res.status(500).json({ message: 'Failed to fetch vacancy' });
  }
});

// Create new vacancy
router.post('/', async (req, res) => {
  try {
    const validatedData = createVacancySchema.parse(req.body);
    
    if (isMongoConnected()) {
      const vacancy = new VacancyModel(validatedData);
      const savedVacancy = await vacancy.save();
      res.status(201).json(savedVacancy);
    } else {
      const newVacancy: VacancyData = {
        _id: `vacancy_${inMemoryIdCounter++}`,
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryVacancies.push(newVacancy);
      res.status(201).json(newVacancy);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    console.error('Error creating vacancy:', error);
    res.status(500).json({ message: 'Failed to create vacancy' });
  }
});

// Update vacancy
router.put('/:id', async (req, res) => {
  try {
    const validatedData = updateVacancySchema.parse(req.body);
    
    if (isMongoConnected()) {
      const vacancy = await VacancyModel.findByIdAndUpdate(
        req.params.id,
        { ...validatedData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      if (!vacancy) {
        return res.status(404).json({ message: 'Vacancy not found' });
      }
      
      res.json(vacancy);
    } else {
      const index = inMemoryVacancies.findIndex(v => v._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: 'Vacancy not found' });
      }
      
      inMemoryVacancies[index] = {
        ...inMemoryVacancies[index],
        ...validatedData,
        updatedAt: new Date(),
      };
      
      res.json(inMemoryVacancies[index]);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    console.error('Error updating vacancy:', error);
    res.status(500).json({ message: 'Failed to update vacancy' });
  }
});

// Delete vacancy
router.delete('/:id', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const vacancy = await VacancyModel.findByIdAndDelete(req.params.id);
      if (!vacancy) {
        return res.status(404).json({ message: 'Vacancy not found' });
      }
      res.json({ message: 'Vacancy deleted successfully' });
    } else {
      const index = inMemoryVacancies.findIndex(v => v._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: 'Vacancy not found' });
      }
      
      inMemoryVacancies.splice(index, 1);
      res.json({ message: 'Vacancy deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting vacancy:', error);
    res.status(500).json({ message: 'Failed to delete vacancy' });
  }
});

export { router as vacancyRoutes };
