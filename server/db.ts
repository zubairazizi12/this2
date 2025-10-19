import mongoose from 'mongoose';

// MongoDB connection string - prioritize environment variable first
let MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital-residents';

// If DATABASE_URL is set and looks like MongoDB, use it
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('mongodb')) {
  MONGODB_URI = process.env.DATABASE_URL;
} else if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('postgresql')) {
  console.log('PostgreSQL DATABASE_URL detected, using MongoDB URI for hospital data');
}

let isConnected = false;

// Connect to MongoDB with retry logic
export async function connectDB() {
  if (isConnected) {
    return;
  }
  
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log('Connected to MongoDB successfully at:', MONGODB_URI);
    await seedDatabase();
  } catch (error) {
    console.warn('MongoDB connection failed, using in-memory fallback:', (error as Error).message);
    console.log('To connect to MongoDB Atlas, set MONGODB_URI environment variable');
    // Initialize in-memory data for demo
    await initializeInMemoryData();
    // Re-throw the error so storage.ts knows MongoDB failed
    throw error;
  }
}

// Seed database with sample data
async function seedDatabase() {
  // Only seed if actually connected to MongoDB
  if (!isConnected || mongoose.connection.readyState !== 1) {
    console.log('Skipping database seeding - MongoDB not connected');
    return;
  }
  
  try {
    const { ResidentModel, TeacherModel } = await import('./models');
    
    // Check if data already exists
    const residentCount = await ResidentModel.countDocuments();
    const teacherCount = await TeacherModel.countDocuments();
    
    if (residentCount === 0) {
      // Seed residents
      const residents = [
        {
          fullName: "Dr. Sarah Johnson",
          age: 28,
          gender: "Female",
          department: "Internal Medicine",
          startDate: new Date("2024-01-15"),
          status: "active"
        },
        {
          fullName: "Dr. Michael Chen",
          age: 29,
          gender: "Male", 
          department: "Surgery",
          startDate: new Date("2024-02-01"),
          status: "active"
        },
        {
          fullName: "Dr. Emily Rodriguez",
          age: 27,
          gender: "Female",
          department: "Pediatrics", 
          startDate: new Date("2024-03-10"),
          status: "active"
        }
      ];
      
      await ResidentModel.insertMany(residents);
      console.log('Sample residents data seeded successfully');
    }
    
    if (teacherCount === 0) {
      // Seed teachers
      const teachers = [
        {
          fullName: "Dr. Robert Williams",
          email: "r.williams@hospital.com",
          phone: "555-0101",
          department: "Internal Medicine",
          academicRank: "Professor",
          appointmentDate: new Date("2015-08-01"),
          status: "active"
        },
        {
          fullName: "Dr. Lisa Anderson",
          email: "l.anderson@hospital.com", 
          phone: "555-0102",
          department: "Surgery",
          academicRank: "Associate Professor",
          appointmentDate: new Date("2018-09-15"),
          status: "active"
        }
      ];
      
      await TeacherModel.insertMany(teachers);
      console.log('Sample teachers data seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Initialize in-memory data when MongoDB is not available
async function initializeInMemoryData() {
  console.log('MongoDB initialization failed, using in-memory storage');
  // Create test Form F data for demonstration (skip database check in in-memory mode)
  try {
    const Checklist = (await import('./models/form-F')).default;
    
    // In in-memory mode, just create the data without checking if it exists
    if (true) {
      const testFormF = new Checklist({
        studentName: "احمد رسولی",
        fatherName: "محمد",
        year: "1403",
        sections: [
          {
            name: "آغاز فعالیت (10%)",
            activities: [
              {
                id: "uniform",
                title: "یونیفورم",
                percent: 6,
                months: [
                  { month: 1, value: 5 }, { month: 2, value: 6 }, { month: 3, value: 5 },
                  { month: 4, value: 6 }, { month: 5, value: 5 }, { month: 6, value: 6 },
                  { month: 7, value: 5 }, { month: 8, value: 6 }, { month: 9, value: 5 },
                  { month: 10, value: 6 }, { month: 11, value: 5 }, { month: 12, value: 6 }
                ],
                total: 66
              },
              {
                id: "coworkers",
                title: "برخورد با همکاران",
                percent: 2,
                months: [
                  { month: 1, value: 2 }, { month: 2, value: 2 }, { month: 3, value: 1 },
                  { month: 4, value: 2 }, { month: 5, value: 2 }, { month: 6, value: 2 },
                  { month: 7, value: 1 }, { month: 8, value: 2 }, { month: 9, value: 2 },
                  { month: 10, value: 2 }, { month: 11, value: 1 }, { month: 12, value: 2 }
                ],
                total: 21
              },
              {
                id: "patients",
                title: "برخورد با مریض",
                percent: 2,
                months: [
                  { month: 1, value: 2 }, { month: 2, value: 2 }, { month: 3, value: 2 },
                  { month: 4, value: 1 }, { month: 5, value: 2 }, { month: 6, value: 2 },
                  { month: 7, value: 2 }, { month: 8, value: 1 }, { month: 9, value: 2 },
                  { month: 10, value: 2 }, { month: 11, value: 2 }, { month: 12, value: 1 }
                ],
                total: 21
              }
            ]
          },
          {
            name: "دسپلین (24%)",
            activities: [
              {
                id: "attendance",
                title: "حاضر بودن",
                percent: 6,
                months: [
                  { month: 1, value: 6 }, { month: 2, value: 5 }, { month: 3, value: 6 },
                  { month: 4, value: 6 }, { month: 5, value: 5 }, { month: 6, value: 6 },
                  { month: 7, value: 6 }, { month: 8, value: 5 }, { month: 9, value: 6 },
                  { month: 10, value: 6 }, { month: 11, value: 5 }, { month: 12, value: 6 }
                ],
                total: 68
              }
            ]
          }
        ]
      });
      
      await testFormF.save();
      console.log('Test Form F data created for student: احمد رسولی');
    }
  } catch (error) {
    console.log('Could not create test Form F data:', error);
  }
}

// Check if MongoDB is connected
export function isMongoConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

// Export mongoose for direct use if needed
export { mongoose };