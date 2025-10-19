
import { UserModel, TeacherModel, ResidentModel } from "./models";
import {
  type User,
  type UpsertUser,
  type Resident,
  type InsertResident,
  type Teacher,
  type InsertTeacher,
  type Form,
  type InsertForm,
  type DisciplinaryAction,
  type InsertDisciplinaryAction,
  type Reward,
  type InsertReward,
  DEMO_CREDENTIALS,
} from "@shared/schema";
import { connectDB } from "./db";
// import { seedDatabase } from "./seeds"; // Removed

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: { email: string; firstName: string; lastName?: string; role: string; password: string }): Promise<User>;
  updateUser(id: string, user: Partial<{ email: string; firstName: string; lastName?: string; role: string; password?: string }>): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // Resident operations
  getAllResidents(): Promise<Resident[]>;
  getResident(id: string): Promise<Resident | undefined>;
  createResident(resident: InsertResident): Promise<Resident>;
  updateResident(id: string, resident: Partial<InsertResident>): Promise<Resident>;
  deleteResident(id: string): Promise<void>;

  // Teacher operations (replacing faculty)

  getAllTeachers(): Promise<Teacher[]>;
  getTeacher(id: string): Promise<Teacher | undefined>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  updateTeacher(id: string, teacher: Partial<InsertTeacher>): Promise<Teacher>;
  deleteTeacher(id: string): Promise<void>;

  // Form operations
  getResidentForms(residentId: string): Promise<Form[]>;
  getForm(id: string): Promise<Form | undefined>;
  createForm(form: InsertForm): Promise<Form>;
  updateForm(id: string, form: Partial<InsertForm>): Promise<Form>;
  deleteForm(id: string): Promise<void>;

  // Disciplinary action operations
  getResidentDisciplinaryActions(residentId: string): Promise<DisciplinaryAction[]>;
  createDisciplinaryAction(action: InsertDisciplinaryAction): Promise<DisciplinaryAction>;
  updateDisciplinaryAction(id: string, action: Partial<InsertDisciplinaryAction>): Promise<DisciplinaryAction>;
  deleteDisciplinaryAction(id: string): Promise<void>;

  // Reward operations
  getResidentRewards(residentId: string): Promise<Reward[]>;
  createReward(reward: InsertReward): Promise<Reward>;
  updateReward(id: string, reward: Partial<InsertReward>): Promise<Reward>;
  deleteReward(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private demoUsers: Map<string, User> = new Map();
  private demoResidents: Map<string, Resident> = new Map();
  private demoTeachers: Map<string, Teacher> = new Map();
  private demoForms: Map<string, Form> = new Map();
  private demoDisciplinaryActions: Map<string, DisciplinaryAction> = new Map();
  private demoRewards: Map<string, Reward> = new Map();
  private isMongoConnected: boolean = false;

  constructor() {
    // Initialize database connection and demo data
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      await connectDB();
      this.isMongoConnected = true;
      
      // MongoDB connected successfully
      
    } catch (error) {
      console.warn('MongoDB initialization failed, using in-memory storage:', (error as Error).message);
      this.isMongoConnected = false;
      this.createDemoUsers();
    }
  }

  private createDemoUsers() {
    // Create demo admin user
    this.demoUsers.set(DEMO_CREDENTIALS.admin.id, {
      _id: DEMO_CREDENTIALS.admin.id,
      email: DEMO_CREDENTIALS.admin.username,
      firstName: DEMO_CREDENTIALS.admin.firstName,
      lastName: DEMO_CREDENTIALS.admin.lastName,
      role: DEMO_CREDENTIALS.admin.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User);

    // Create demo viewer user
    this.demoUsers.set(DEMO_CREDENTIALS.viewer.id, {
      _id: DEMO_CREDENTIALS.viewer.id,
      email: DEMO_CREDENTIALS.viewer.username,
      firstName: DEMO_CREDENTIALS.viewer.firstName,
      lastName: DEMO_CREDENTIALS.viewer.lastName,
      role: DEMO_CREDENTIALS.viewer.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User);

    console.log('Demo users initialized successfully');
  }

  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    if (this.isMongoConnected) {
      try {
        const user = await UserModel.findById(id);
        return user || undefined;
      } catch (error) {
        console.error('Error fetching user from MongoDB:', (error as Error).message);
      }
    }
    return this.demoUsers.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (this.isMongoConnected) {
      try {
        const user = await UserModel.findByIdAndUpdate(
          userData._id,
          {
            ...userData,
            role: userData.role || "viewer",
            updatedAt: new Date(),
          },
          { upsert: true, new: true }
        );
        return user!;
      } catch (error) {
        console.error('Error upserting user to MongoDB:', (error as Error).message);
        console.log('Falling back to in-memory storage');
        this.isMongoConnected = false;
      }
    }
    
    const user: User = {
      _id: userData._id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || "viewer",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
    
    this.demoUsers.set(userData._id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    if (this.isMongoConnected) {
      try {
        const users = await UserModel.find().sort({ createdAt: -1 });
        return users;
      } catch (error) {
        console.error('Error fetching users from MongoDB:', (error as Error).message);
        console.log('Falling back to in-memory users');
        this.isMongoConnected = false;
      }
    }
    return Array.from(this.demoUsers.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (this.isMongoConnected) {
      try {
        const user = await UserModel.findOne({ email });
        return user || undefined;
      } catch (error) {
        console.error('Error fetching user by email from MongoDB:', (error as Error).message);
      }
    }
    return Array.from(this.demoUsers.values()).find(u => u.email === email);
  }

  async createUser(userData: { email: string; firstName: string; lastName?: string; role: string; password: string }): Promise<User> {
    if (this.isMongoConnected) {
      try {
        const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newUser = await UserModel.create({
          _id: id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          password: userData.password,
          role: userData.role,
        });
        return newUser;
      } catch (error) {
        console.error('Error creating user in MongoDB:', (error as Error).message);
        console.log('Falling back to in-memory storage');
        this.isMongoConnected = false;
      }
    }
    
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newUser: User = {
      _id: id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      password: userData.password,
      role: userData.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.demoUsers.set(id, newUser);
    return newUser;
  }

  async updateUser(id: string, userData: Partial<{ email: string; firstName: string; lastName?: string; role: string; password?: string }>): Promise<User> {
    if (this.isMongoConnected) {
      try {
        const user = await UserModel.findByIdAndUpdate(
          id,
          {
            ...userData,
            updatedAt: new Date(),
          },
          { new: true }
        );
        if (!user) throw new Error('User not found');
        return user;
      } catch (error) {
        console.error('Error updating user in MongoDB:', (error as Error).message);
        throw error;
      }
    }
    
    const existingUser = this.demoUsers.get(id);
    if (!existingUser) throw new Error('User not found');
    
    const updatedUser: User = {
      ...existingUser,
      ...userData,
      updatedAt: new Date(),
    };
    
    this.demoUsers.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    if (this.isMongoConnected) {
      try {
        await UserModel.findByIdAndDelete(id);
      } catch (error) {
        console.error('Error deleting user from MongoDB:', (error as Error).message);
        throw error;
      }
    } else {
      this.demoUsers.delete(id);
    }
  }

  // Resident operations
  async getAllResidents(): Promise<Resident[]> {
    if (this.isMongoConnected) {
      try {
        const residents = await ResidentModel.find({ status: 'active' })
          .sort({ department: 1, fullName: 1 });
        return residents;
      } catch (error) {
        console.error('Error fetching residents from MongoDB:', (error as Error).message);
      }
    }
    return Array.from(this.demoResidents.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getResident(id: string): Promise<Resident | undefined> {
    if (this.isMongoConnected) {
      try {
        const resident = await ResidentModel.findById(id);
        return resident || undefined;
      } catch (error) {
        console.error('Error fetching resident from MongoDB:', (error as Error).message);
      }
    }
    return this.demoResidents.get(id);
  }

  async createResident(resident: InsertResident): Promise<Resident> {
    if (this.isMongoConnected) {
      try {
        const newResident = await ResidentModel.create(resident);
        return newResident;
      } catch (error) {
        console.error('Error creating resident in MongoDB:', (error as Error).message);
      }
    }
    
    const id = `resident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newResident: Resident = {
      _id: id,
      ...resident,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Resident;
    
    this.demoResidents.set(id, newResident);
    return newResident;
  }

  async updateResident(id: string, resident: Partial<InsertResident>): Promise<Resident> {
    const existing = this.demoResidents.get(id);
    if (!existing) {
      throw new Error('Resident not found');
    }
    
    const updated = { ...existing, ...resident, updatedAt: new Date() } as Resident;
    this.demoResidents.set(id, updated);
    return updated;
  }

  async deleteResident(id: string): Promise<void> {
    this.demoResidents.delete(id);
  }


  // Teacher operations
  async getAllTeachers(): Promise<Teacher[]> {
    if (this.isMongoConnected) {
      try {
        const teachers = await TeacherModel.find({ status: 'active' })
          .sort({ department: 1, name: 1 });
        return teachers;
      } catch (error) {
        console.error('Error fetching teachers from MongoDB:', (error as Error).message);
      }
    }
    return Array.from(this.demoTeachers.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getTeacher(id: string): Promise<Teacher | undefined> {
    if (this.isMongoConnected) {
      try {
        const teacher = await TeacherModel.findById(id);
        return teacher || undefined;
      } catch (error) {
        console.error('Error fetching teacher from MongoDB:', (error as Error).message);
      }
    }
    return this.demoTeachers.get(id);
  }

  async createTeacher(teacherData: InsertTeacher): Promise<Teacher> {
    if (this.isMongoConnected) {
      try {
        const teacher = await TeacherModel.create(teacherData);
        return teacher;
      } catch (error) {
        console.error('Error creating teacher in MongoDB:', (error as Error).message);
      }
    }
    
    const id = `teacher_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTeacher: Teacher = {
      _id: id,
      ...teacherData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Teacher;
    
    this.demoTeachers.set(id, newTeacher);
    return newTeacher;
  }

  async updateTeacher(id: string, teacherData: Partial<InsertTeacher>): Promise<Teacher> {
    if (this.isMongoConnected) {
      try {
        const teacher = await TeacherModel.findByIdAndUpdate(
          id,
          { ...teacherData, updatedAt: new Date() },
          { new: true }
        );
        if (!teacher) {
          throw new Error('Teacher not found');
        }
        return teacher;
      } catch (error) {
        console.error('Error updating teacher in MongoDB:', (error as Error).message);
      }
    }
    
    const existing = this.demoTeachers.get(id);
    if (!existing) {
      throw new Error('Teacher not found');
    }
    
    const updated = { ...existing, ...teacherData, updatedAt: new Date() } as Teacher;
    this.demoTeachers.set(id, updated);
    return updated;
  }

  async deleteTeacher(id: string): Promise<void> {
    if (this.isMongoConnected) {
      try {
        const result = await TeacherModel.findByIdAndDelete(id);
      } catch (error) {
        console.error('Error deleting teacher from MongoDB:', (error as Error).message);
      }
    }
    
    this.demoTeachers.delete(id);
  }

  // Form operations
  async getResidentForms(residentId: string): Promise<Form[]> {
    return Array.from(this.demoForms.values())
      .filter(form => form.residentId === residentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getForm(id: string): Promise<Form | undefined> {
    return this.demoForms.get(id);
  }

  async createForm(form: InsertForm): Promise<Form> {
    const id = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newForm: Form = {
      _id: id,
      ...form,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Form;
    
    this.demoForms.set(id, newForm);
    return newForm;
  }

  async updateForm(id: string, form: Partial<InsertForm>): Promise<Form> {
    const existing = this.demoForms.get(id);
    if (!existing) {
      throw new Error('Form not found');
    }
    
    const updated = { ...existing, ...form, updatedAt: new Date() } as Form;
    this.demoForms.set(id, updated);
    return updated;
  }

  async deleteForm(id: string): Promise<void> {
    this.demoForms.delete(id);
  }

  // Disciplinary action operations
  async getResidentDisciplinaryActions(residentId: string): Promise<DisciplinaryAction[]> {
    return Array.from(this.demoDisciplinaryActions.values())
      .filter(action => action.residentId === residentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createDisciplinaryAction(action: InsertDisciplinaryAction): Promise<DisciplinaryAction> {
    const id = `disciplinary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newAction: DisciplinaryAction = {
      _id: id,
      ...action,
    } as DisciplinaryAction;
    
    this.demoDisciplinaryActions.set(id, newAction);
    return newAction;
  }

  async updateDisciplinaryAction(
    id: string,
    action: Partial<InsertDisciplinaryAction>
  ): Promise<DisciplinaryAction> {
    const existing = this.demoDisciplinaryActions.get(id);
    if (!existing) {
      throw new Error('Disciplinary action not found');
    }
    
    const updated = { ...existing, ...action } as DisciplinaryAction;
    this.demoDisciplinaryActions.set(id, updated);
    return updated;
  }

  async deleteDisciplinaryAction(id: string): Promise<void> {
    this.demoDisciplinaryActions.delete(id);
  }

  // Reward operations
  async getResidentRewards(residentId: string): Promise<Reward[]> {
    return Array.from(this.demoRewards.values())
      .filter(reward => reward.residentId === residentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createReward(reward: InsertReward): Promise<Reward> {
    const id = `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newReward: Reward = {
      _id: id,
      ...reward,
    } as Reward;
    
    this.demoRewards.set(id, newReward);
    return newReward;
  }

  async updateReward(id: string, reward: Partial<InsertReward>): Promise<Reward> {
    const existing = this.demoRewards.get(id);
    if (!existing) {
      throw new Error('Reward not found');
    }
    
    const updated = { ...existing, ...reward } as Reward;
    this.demoRewards.set(id, updated);
    return updated;
  }

  async deleteReward(id: string): Promise<void> {
    this.demoRewards.delete(id);
  }
}

export const storage = new DatabaseStorage();
