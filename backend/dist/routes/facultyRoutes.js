"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const facultyController_js_1 = require("../controllers/facultyController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticateToken);
router.use((0, auth_js_1.requireRole)(["FACULTY", "ADMIN"]));
// Question banks
router.get("/question-banks", facultyController_js_1.getQuestionBanks);
router.post("/question-banks", facultyController_js_1.createQuestionBank);
router.delete("/question-banks/:id", facultyController_js_1.deleteQuestionBank);
// Questions
router.get("/questions", facultyController_js_1.getQuestions);
router.post("/questions", facultyController_js_1.addQuestion);
router.put("/questions/:id", facultyController_js_1.updateQuestion);
router.delete("/questions/:id", facultyController_js_1.deleteQuestion);
// Exams
router.get("/exams", facultyController_js_1.getFacultyExams);
router.post("/exams/schedule", facultyController_js_1.createAndScheduleExam);
router.patch("/exams/:id/toggle-publish", facultyController_js_1.togglePublishExam);
router.patch("/exams/:id/toggle-results", facultyController_js_1.togglePublishResults);
// Monitoring & Proctoring Review
router.get("/exams/:examId/live-monitor", facultyController_js_1.getLiveExamMonitor);
router.get("/violations", facultyController_js_1.getExamViolations);
router.get("/exams/violations", facultyController_js_1.getExamViolations);
router.get("/exams/:examId/violations", facultyController_js_1.getExamViolations);
router.patch("/violations/:id/review", facultyController_js_1.markViolationReviewed);
exports.default = router;
