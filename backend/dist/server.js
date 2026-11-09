"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_js_1 = __importDefault(require("./routes/authRoutes.js"));
const examRoutes_js_1 = __importDefault(require("./routes/examRoutes.js"));
const facultyRoutes_js_1 = __importDefault(require("./routes/facultyRoutes.js"));
const adminRoutes_js_1 = __importDefault(require("./routes/adminRoutes.js"));
const proctoringRoutes_js_1 = __importDefault(require("./routes/proctoringRoutes.js"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json());
// Routes
app.use("/api/auth", authRoutes_js_1.default);
app.use("/api/exams", examRoutes_js_1.default);
app.use("/api/faculty", facultyRoutes_js_1.default);
app.use("/api/admin", adminRoutes_js_1.default);
app.use("/api/proctoring", proctoringRoutes_js_1.default);
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
