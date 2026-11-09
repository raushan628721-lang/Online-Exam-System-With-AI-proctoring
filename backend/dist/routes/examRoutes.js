"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const examController_js_1 = require("../controllers/examController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Student-accessible exam endpoints
router.use(auth_js_1.authenticateToken);
router.get("/available", (0, auth_js_1.requireRole)(["STUDENT", "ADMIN", "FACULTY"]), examController_js_1.getAvailableExams);
router.get("/history", (0, auth_js_1.requireRole)(["STUDENT"]), examController_js_1.getStudentHistory);
router.post("/:id/start", (0, auth_js_1.requireRole)(["STUDENT"]), examController_js_1.startExam);
router.put("/attempts/:attemptId/answer", (0, auth_js_1.requireRole)(["STUDENT"]), examController_js_1.saveAnswer);
router.post("/attempts/:attemptId/submit", (0, auth_js_1.requireRole)(["STUDENT"]), examController_js_1.submitExam);
router.get("/attempts/:attemptId/result", examController_js_1.getAttemptResult);
exports.default = router;
