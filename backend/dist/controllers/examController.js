"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentHistory = exports.getAttemptResult = exports.submitExam = exports.saveAnswer = exports.startExam = exports.getAvailableExams = void 0;
const db_js_1 = __importDefault(require("../db.js"));
// Student: Get all exams available for the student
const getAvailableExams = async (req, res) => {
    try {
        const student = req.user;
        if (!student)
            return res.status(401).json({ message: "Unauthorized" });
        const now = new Date().toISOString();
        const allExams = db_js_1.default.exams.findMany((e) => e.isPublished);
        // Filter by class group or 'ALL'
        const studentExams = allExams.filter((e) => {
            const matchClass = !e.targetClass || e.targetClass === "ALL" || e.targetClass === student.classGroup;
            return matchClass;
        });
        // Check attempts for each exam
        const results = studentExams.map((exam) => {
            const questionsCount = db_js_1.default.questions.findMany((q) => q.examId === exam.id).length;
            const attempt = db_js_1.default.attempts.findUnique((a) => a.examId === exam.id && a.studentId === student.id);
            return {
                id: exam.id,
                title: exam.title,
                description: exam.description,
                durationMinutes: exam.durationMinutes,
                totalMarks: exam.totalMarks,
                passingMarks: exam.passingMarks,
                targetClass: exam.targetClass,
                startTime: exam.startTime,
                endTime: exam.endTime,
                questionCount: questionsCount,
                hasAttempted: !!attempt && attempt.status === "SUBMITTED",
                attemptStatus: attempt ? attempt.status : "NOT_STARTED",
                score: attempt?.score ?? null,
                isPassed: attempt?.isPassed ?? null,
                resultsReleased: exam.resultsReleased,
            };
        });
        return res.json(results);
    }
    catch (error) {
        console.error("Error fetching available exams:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.getAvailableExams = getAvailableExams;
// Student: Start or resume an exam
const startExam = async (req, res) => {
    try {
        const student = req.user;
        const { id: examId } = req.params;
        if (!student)
            return res.status(401).json({ message: "Unauthorized" });
        const exam = db_js_1.default.exams.findUnique((e) => e.id === examId);
        if (!exam || !exam.isPublished) {
            return res.status(404).json({ message: "Exam not found or inactive" });
        }
        // Check for existing attempt
        let attempt = db_js_1.default.attempts.findUnique((a) => a.examId === examId && a.studentId === student.id);
        if (attempt && attempt.status === "SUBMITTED") {
            return res.status(400).json({ message: "You have already completed this exam", attemptId: attempt.id });
        }
        if (!attempt) {
            attempt = db_js_1.default.attempts.create({
                examId,
                studentId: student.id,
                answers: {},
                status: "IN_PROGRESS",
            });
        }
        // Fetch questions without revealing answers or explanations to student
        const questions = db_js_1.default.questions.findMany((q) => q.examId === examId);
        const sanitizedQuestions = questions.map((q) => ({
            id: q.id,
            prompt: q.prompt,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            marks: q.marks,
        }));
        return res.json({
            attemptId: attempt.id,
            startedAt: attempt.startedAt,
            answers: attempt.answers || {},
            exam: {
                id: exam.id,
                title: exam.title,
                description: exam.description,
                durationMinutes: exam.durationMinutes,
                totalMarks: exam.totalMarks,
                passingMarks: exam.passingMarks,
            },
            questions: sanitizedQuestions,
        });
    }
    catch (error) {
        console.error("Error starting exam:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.startExam = startExam;
// Student: Save answer in real time
const saveAnswer = async (req, res) => {
    try {
        const student = req.user;
        const { attemptId } = req.params;
        const { questionId, selectedOption } = req.body;
        if (!student)
            return res.status(401).json({ message: "Unauthorized" });
        const attempt = db_js_1.default.attempts.findUnique((a) => a.id === attemptId && a.studentId === student.id);
        if (!attempt) {
            return res.status(404).json({ message: "Attempt not found" });
        }
        if (attempt.status !== "IN_PROGRESS") {
            return res.status(400).json({ message: "Exam is already submitted" });
        }
        const updatedAnswers = { ...attempt.answers, [questionId]: selectedOption };
        const updated = db_js_1.default.attempts.update(attemptId, { answers: updatedAnswers });
        return res.json({ success: true, answers: updated?.answers });
    }
    catch (error) {
        console.error("Error saving answer:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.saveAnswer = saveAnswer;
// Student: Submit exam attempt and calculate marks automatically
const submitExam = async (req, res) => {
    try {
        const student = req.user;
        const { attemptId } = req.params;
        if (!student)
            return res.status(401).json({ message: "Unauthorized" });
        const attempt = db_js_1.default.attempts.findUnique((a) => a.id === attemptId && a.studentId === student.id);
        if (!attempt) {
            return res.status(404).json({ message: "Attempt not found" });
        }
        if (attempt.status === "SUBMITTED") {
            return res.json({ message: "Exam was already submitted", attempt });
        }
        const exam = db_js_1.default.exams.findUnique((e) => e.id === attempt.examId);
        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }
        // Auto-calculate score
        const questions = db_js_1.default.questions.findMany((q) => q.examId === exam.id);
        let calculatedScore = 0;
        const answers = attempt.answers || {};
        questions.forEach((q) => {
            const studentAnswer = answers[q.id];
            if (studentAnswer && studentAnswer.toUpperCase() === q.correctOption.toUpperCase()) {
                calculatedScore += q.marks;
            }
        });
        const isPassed = calculatedScore >= exam.passingMarks;
        const finalizedAttempt = db_js_1.default.attempts.update(attemptId, {
            status: "SUBMITTED",
            submittedAt: new Date().toISOString(),
            score: calculatedScore,
            isPassed,
        });
        return res.json({
            message: "Exam submitted successfully",
            attempt: finalizedAttempt,
            score: calculatedScore,
            totalMarks: exam.totalMarks,
            passingMarks: exam.passingMarks,
            isPassed,
        });
    }
    catch (error) {
        console.error("Error submitting exam:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.submitExam = submitExam;
// Student: View result for a specific attempt
const getAttemptResult = async (req, res) => {
    try {
        const student = req.user;
        const { attemptId } = req.params;
        if (!student)
            return res.status(401).json({ message: "Unauthorized" });
        const attempt = db_js_1.default.attempts.findUnique((a) => a.id === attemptId);
        if (!attempt) {
            return res.status(404).json({ message: "Attempt not found" });
        }
        // Ensure student only views their own, unless admin/faculty
        if (student.role === "STUDENT" && attempt.studentId !== student.id) {
            return res.status(403).json({ message: "Forbidden" });
        }
        const exam = db_js_1.default.exams.findUnique((e) => e.id === attempt.examId);
        if (!exam)
            return res.status(404).json({ message: "Exam not found" });
        const questions = db_js_1.default.questions.findMany((q) => q.examId === exam.id);
        const violations = db_js_1.default.violations.findMany((v) => v.attemptId === attemptId || (v.studentId === attempt.studentId && v.examId === attempt.examId));
        // If results are released or user is faculty/admin, include detailed review
        const allowDetailedReview = exam.resultsReleased || student.role !== "STUDENT";
        const questionBreakdown = questions.map((q) => {
            const studentChoice = attempt.answers?.[q.id] || null;
            const isCorrect = studentChoice?.toUpperCase() === q.correctOption.toUpperCase();
            return {
                id: q.id,
                prompt: q.prompt,
                optionA: q.optionA,
                optionB: q.optionB,
                optionC: q.optionC,
                optionD: q.optionD,
                marks: q.marks,
                studentChoice,
                isCorrect,
                correctOption: allowDetailedReview ? q.correctOption : undefined,
                explanation: allowDetailedReview ? q.explanation : undefined,
            };
        });
        return res.json({
            attemptId: attempt.id,
            exam: {
                id: exam.id,
                title: exam.title,
                description: exam.description,
                totalMarks: exam.totalMarks,
                passingMarks: exam.passingMarks,
                durationMinutes: exam.durationMinutes || 30,
                resultsReleased: exam.resultsReleased,
            },
            score: attempt.score,
            isPassed: attempt.isPassed,
            startedAt: attempt.startedAt,
            submittedAt: attempt.submittedAt,
            status: attempt.status,
            violationsCount: violations.length,
            violations: violations,
            allowDetailedReview,
            questions: questionBreakdown,
        });
    }
    catch (error) {
        console.error("Error getting attempt result:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.getAttemptResult = getAttemptResult;
// Student: View previous exam history
const getStudentHistory = async (req, res) => {
    try {
        const student = req.user;
        if (!student)
            return res.status(401).json({ message: "Unauthorized" });
        const myAttempts = db_js_1.default.attempts.findMany((a) => a.studentId === student.id);
        const history = myAttempts.map((attempt) => {
            const exam = db_js_1.default.exams.findUnique((e) => e.id === attempt.examId);
            const violations = db_js_1.default.violations.findMany((v) => v.attemptId === attempt.id || (v.studentId === student.id && v.examId === attempt.examId));
            return {
                attemptId: attempt.id,
                examId: attempt.examId,
                examTitle: exam?.title || "Archived Exam",
                durationMinutes: exam?.durationMinutes || 0,
                totalMarks: exam?.totalMarks || 0,
                passingMarks: exam?.passingMarks || 0,
                resultsReleased: exam?.resultsReleased ?? false,
                score: attempt.score,
                isPassed: attempt.isPassed,
                status: attempt.status,
                startedAt: attempt.startedAt,
                submittedAt: attempt.submittedAt,
                violationsCount: violations.length,
            };
        });
        return res.json(history);
    }
    catch (error) {
        console.error("Error fetching student history:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.getStudentHistory = getStudentHistory;
