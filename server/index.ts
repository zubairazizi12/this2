import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectDB } from "./db";
import monographRoutes from "./routes/form-C";
import conferenceRoutes from "./routes/form-D";
import evaluationFormERoutes from "./routes/form-E";
import evaluationFormGRoutes from "./routes/form-G";
import formHRoutes from "./routes/form-H";
import monographEvaluationRoutes from "./routes/form-k";
import rotationFormRoutes from "./routes/form-I";
import { teacherActivityRoutes } from "./routes/form-J";
import path from "path";
import { fileURLToPath } from "url";
const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 🟢 سرو کردن فایل‌های آپلود شده به صورت استاتیک
// The import statement for 'path' has been removed as it is already imported.
import { trainerRoutes } from "./routes/trainerRoutes"; // مسیر روتر ترینر
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// API routes
app.use("/api/monograph", monographRoutes);
app.use("/api/conference", conferenceRoutes);
app.use("/api/evaluationFormE", evaluationFormERoutes);
app.use("/api/evaluationFormH", formHRoutes);
app.use("/api/evaluationFormG", evaluationFormGRoutes);
app.use("/api/monographEvaluation", monographEvaluationRoutes);
app.use("/api/rotation-form", rotationFormRoutes);
app.use("/api/teacher-activities", teacherActivityRoutes);

// اضافه کردن ترینر
app.use("/api/trainers", trainerRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Logging middleware for API responses
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// ---- Main bootstrap ----
(async () => {
  // DB
  await connectDB();

  // registerRoutes returns http.Server usually
  const server = await registerRoutes(app);

  // در حالت production فایل‌های استاتیک را سرو کن
  if (app.get("env") !== "development") {
    serveStatic(app);
  }

  // Listen
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    { port, host: "0.0.0.0" },
    async () => {
      log(`serving on port ${port}`);

      // فقط در حالت dev یک بار setupVite را اجرا کن
      if (app.get("env") === "development") {
        try {
          await setupVite(app, server);
          log("Vite development server setup complete");
        } catch (error) {
          console.error("Vite setup failed:", error);
        }
      }
    }
  );
})();
