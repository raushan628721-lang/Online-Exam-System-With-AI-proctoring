import { Router } from "express";
import {
  getAvailableExams,
  startExam,
  saveAnswer,
  submitExam,
  getAttemptResult,
  getStudentHistory,
} from "../controllers/examController.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = Router();

// Student-accessible exam endpoints
router.use(authenticateToken);
router.get("/available", requireRole(["STUDENT", "ADMIN", "FACULTY"]), getAvailableExams);
router.get("/history", requireRole(["STUDENT"]), getStudentHistory);
router.post("/:id/start", requireRole(["STUDENT"]), startExam);
router.put("/attempts/:attemptId/answer", requireRole(["STUDENT"]), saveAnswer);
router.post("/attempts/:attemptId/submit", requireRole(["STUDENT"]), submitExam);
router.get("/attempts/:attemptId/result", getAttemptResult);

export default router;
