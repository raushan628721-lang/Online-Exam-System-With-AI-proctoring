import { Router } from "express";
import {
  getQuestionBanks,
  createQuestionBank,
  deleteQuestionBank,
  getQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getFacultyExams,
  createAndScheduleExam,
  togglePublishExam,
  togglePublishResults,
  getLiveExamMonitor,
  getExamViolations,
  markViolationReviewed,
} from "../controllers/facultyController.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticateToken);
router.use(requireRole(["FACULTY", "ADMIN"]));

// Question banks
router.get("/question-banks", getQuestionBanks);
router.post("/question-banks", createQuestionBank);
router.delete("/question-banks/:id", deleteQuestionBank);

// Questions
router.get("/questions", getQuestions);
router.post("/questions", addQuestion);
router.put("/questions/:id", updateQuestion);
router.delete("/questions/:id", deleteQuestion);

// Exams
router.get("/exams", getFacultyExams);
router.post("/exams/schedule", createAndScheduleExam);
router.patch("/exams/:id/toggle-publish", togglePublishExam);
router.patch("/exams/:id/toggle-results", togglePublishResults);

// Monitoring & Proctoring Review
router.get("/exams/:examId/live-monitor", getLiveExamMonitor);
router.get("/violations", getExamViolations);
router.get("/exams/violations", getExamViolations);
router.get("/exams/:examId/violations", getExamViolations);
router.patch("/violations/:id/review", markViolationReviewed);

export default router;
