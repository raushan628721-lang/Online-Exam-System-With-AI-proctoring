"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logViolation = void 0;
const db_js_1 = __importDefault(require("../db.js"));
const logViolation = async (req, res) => {
    try {
        const student = req.user;
        if (!student)
            return res.status(401).json({ message: "Unauthorized" });
        const { attemptId, examId, type, description } = req.body;
        if (!examId || !type) {
            return res.status(400).json({ message: "Missing required violation details" });
        }
        // Resilient attempt lookup: by attemptId, or by active student+exam attempt
        let attempt = attemptId ? db_js_1.default.attempts.findUnique((a) => a.id === attemptId) : null;
        if (!attempt) {
            attempt = db_js_1.default.attempts.findUnique((a) => a.examId === examId && a.studentId === student.id);
        }
        const targetAttemptId = attempt?.id || attemptId || "unknown-attempt";
        const targetStudentId = attempt?.studentId || student.id;
        const targetStudent = db_js_1.default.users.findUnique((u) => u.id === targetStudentId);
        const targetStudentName = targetStudent?.name || student.name || "Candidate";
        const validTypes = [
            "TAB_SWITCH",
            "FULLSCREEN_EXIT",
            "NO_FACE_DETECTED",
            "MULTIPLE_FACES_DETECTED",
            "LOOKING_AWAY",
        ];
        const violationType = validTypes.includes(type) ? type : "TAB_SWITCH";
        const violation = db_js_1.default.violations.create({
            attemptId: targetAttemptId,
            examId,
            studentId: targetStudentId,
            studentName: targetStudentName,
            type: violationType,
            description: description || `Proctoring alert: ${violationType}`,
        });
        console.log(`[Proctoring Engine] Logged violation: ${violationType} for ${targetStudentName} (Attempt: ${targetAttemptId})`);
        return res.status(201).json({ success: true, violation });
    }
    catch (error) {
        console.error("Error logging proctoring violation:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.logViolation = logViolation;
