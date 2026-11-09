import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import proctoringRoutes from "./routes/proctoringRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/proctoring", proctoringRoutes);

// Root route – visited directly in browser
app.get("/", (req, res) => {
  res.json({
    name: "ExamPro AI – Backend API",
    version: "1.0.0",
    status: "running",
    message: "The backend API is live. The frontend lives at http://localhost:3000",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      exams: "/api/exams",
      faculty: "/api/faculty",
      admin: "/api/admin",
      proctoring: "/api/proctoring",
    },
    frontend: "http://localhost:3000",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Online Examination & AI Proctoring System API is running smoothly",
    timestamp: new Date().toISOString(),
  });
});

// 404 catch-all for unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    requested: req.originalUrl,
    hint: "All API routes are prefixed with /api — e.g. /api/health",
    frontend: "http://localhost:3000",
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Frontend app  →  http://localhost:3000`);
});
