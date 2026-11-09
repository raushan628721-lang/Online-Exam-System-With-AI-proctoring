import { Router } from "express";
import {
  getAdminStats,
  getUsers,
  updateUser,
  deleteUser,
  getAllExams,
  updateExamSettings,
  deleteExam,
  getAttemptReports,
  deleteAttemptReport,
  clearAttemptReports,
  getAllViolations,
  deleteViolation,
  clearAllViolations,
} from "../controllers/adminController.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticateToken);
router.use(requireRole(["ADMIN"]));

router.get("/stats", getAdminStats);
router.get("/users", getUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.get("/exams", getAllExams);
router.put("/exams/:id", updateExamSettings);
router.delete("/exams/:id", deleteExam);

router.get("/reports", getAttemptReports);
router.delete("/reports/:attemptId", deleteAttemptReport);
router.delete("/reports", clearAttemptReports);

router.get("/violations", getAllViolations);
router.delete("/violations/:id", deleteViolation);
router.delete("/violations", clearAllViolations);

export default router;
