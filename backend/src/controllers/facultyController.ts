import { Response } from "express";
import db from "../db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

// Question Bank CRUD
export const getQuestionBanks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const faculty = req.user;
    if (!faculty) return res.status(401).json({ message: "Unauthorized" });

    // Return teacher's own question banks (or all if admin)
    const qbs = db.questionBanks.findMany(
      (qb) => faculty.role === "ADMIN" || qb.createdById === faculty.id
    );
    const result = qbs.map((qb) => {
      const qCount = db.questions.findMany((q) => q.questionBankId === qb.id && !q.examId).length;
      return { ...qb, questionCount: qCount };
    });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching question banks" });
  }
};

export const createQuestionBank = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const faculty = req.user;
    const { title, subject } = req.body;
    if (!title || !subject) {
      return res.status(400).json({ message: "Title and subject are required" });
    }

    const qb = db.questionBanks.create({
      title,
      subject,
      createdById: faculty!.id,
    });
    return res.status(201).json(qb);
  } catch (error) {
    return res.status(500).json({ message: "Error creating question bank" });
  }
};

export const deleteQuestionBank = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const faculty = req.user;
    const { id } = req.params;
    const qb = db.questionBanks.findUnique((q) => q.id === id);
    if (!qb) return res.status(404).json({ message: "Question bank not found" });

    if (faculty?.role === "FACULTY" && qb.createdById !== faculty.id) {
      return res.status(403).json({ message: "Access denied. You can only delete your own question banks." });
    }

    const removed = db.questionBanks.delete(id);
    if (!removed) return res.status(404).json({ message: "Question bank not found" });
    return res.json({ message: "Question bank deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting question bank" });
  }
};

// Questions Management
export const getQuestions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { questionBankId, examId } = req.query;
    let questions = db.questions.findMany();
    if (questionBankId) {
      questions = questions.filter((q) => q.questionBankId === questionBankId && !q.examId);
    }
    if (examId) {
      questions = questions.filter((q) => q.examId === examId);
    }
    return res.json(questions);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching questions" });
  }
};

export const addQuestion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      questionBankId,
      examId,
      prompt,
      optionA,
      optionB,
      optionC,
      optionD,
      correctOption,
      marks = 1,
      explanation,
    } = req.body;

    if (!prompt || !optionA || !optionB || !optionC || !optionD || !correctOption) {
      return res.status(400).json({ message: "All options and prompt are required" });
    }

    const q = db.questions.create({
      questionBankId: questionBankId || null,
      examId: examId || null,
      prompt,
      optionA,
      optionB,
      optionC,
      optionD,
      correctOption: correctOption.toUpperCase() as "A" | "B" | "C" | "D",
      marks: Number(marks),
      difficulty: req.body.difficulty ? String(req.body.difficulty).toUpperCase() : "MEDIUM",
      explanation: explanation || "",
    });

    return res.status(201).json(q);
  } catch (error) {
    return res.status(500).json({ message: "Error creating question" });
  }
};

export const updateQuestion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updated = db.questions.update(id, req.body);
    if (!updated) return res.status(404).json({ message: "Question not found" });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Error updating question" });
  }
};

export const deleteQuestion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = db.questions.delete(id);
    if (!deleted) return res.status(404).json({ message: "Question not found" });
    return res.json({ message: "Question deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting question" });
  }
};

// Exam Scheduling & Management
export const getFacultyExams = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const faculty = req.user;
    if (!faculty) return res.status(401).json({ message: "Unauthorized" });

    // Show exams created by this specific teacher (or all if admin)
    const exams = db.exams.findMany(
      (e) => faculty.role === "ADMIN" || e.createdById === faculty.id
    );
    const formatted = exams.map((e) => {
      const qCount = db.questions.findMany((q) => q.examId === e.id).length;
      const attempts = db.attempts.findMany((a) => a.examId === e.id);
      const activeAttempts = attempts.filter((a) => a.status === "IN_PROGRESS").length;
      const completedAttempts = attempts.filter((a) => a.status === "SUBMITTED");
      const passedAttempts = completedAttempts.filter((a) => a.isPassed).length;
      const failedAttempts = completedAttempts.filter((a) => !a.isPassed).length;
      const allStudents = db.users.findMany((u) => u.role === "STUDENT");
      const targetStudents = allStudents.filter(
        (s) => e.targetClass === "ALL" || !e.targetClass || s.classGroup === e.targetClass
      );
      const notAttemptedCount = Math.max(0, targetStudents.length - attempts.length);

      const totalScores = completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
      const averageScore = completedAttempts.length > 0 && e.totalMarks > 0
        ? Math.round(((totalScores / (completedAttempts.length * e.totalMarks))) * 100)
        : 0;

      const violations = db.violations.findMany((v) => v.examId === e.id);

      let lifecycleStatus = "SCHEDULED";
      if (!e.isPublished) {
        lifecycleStatus = "SCHEDULED";
      } else if (activeAttempts > 0) {
        lifecycleStatus = "LIVE";
      } else if (completedAttempts.length > 0) {
        lifecycleStatus = "COMPLETED";
      } else {
        lifecycleStatus = "SCHEDULED";
      }

      return {
        ...e,
        questionCount: qCount,
        totalEnrolledStudents: targetStudents.length,
        totalAttempts: attempts.length,
        activeAttempts,
        completedAttempts: completedAttempts.length,
        passedAttempts,
        failedAttempts,
        notAttemptedCount,
        averageScore,
        lifecycleStatus,
        violationsCount: violations.length,
      };
    });

    return res.json(formatted);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching faculty exams" });
  }
};

export const createAndScheduleExam = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const faculty = req.user;
    const {
      title,
      description,
      durationMinutes,
      totalMarks,
      passingMarks,
      targetClass,
      startTime,
      endTime,
      isPublished = true,
      selectedQuestionIds = [],
    } = req.body;

    if (!title || !durationMinutes || !totalMarks || !passingMarks) {
      return res.status(400).json({ message: "Missing required exam fields" });
    }

    const exam = db.exams.create({
      title,
      description: description || "",
      createdById: faculty!.id,
      durationMinutes: Number(durationMinutes),
      totalMarks: Number(totalMarks),
      passingMarks: Number(passingMarks),
      targetClass: targetClass || "ALL",
      startTime: startTime || new Date().toISOString(),
      endTime: endTime || new Date(Date.now() + 86400000 * 30).toISOString(),
      isPublished: Boolean(isPublished),
      resultsReleased: false,
    });

    // If existing questions from bank were selected, clone or associate them to this exam
    if (Array.isArray(selectedQuestionIds) && selectedQuestionIds.length > 0) {
      selectedQuestionIds.forEach((qId) => {
        const sourceQ = db.questions.findUnique((q) => q.id === qId);
        if (sourceQ) {
          db.questions.create({
            examId: exam.id,
            questionBankId: null,
            prompt: sourceQ.prompt,
            optionA: sourceQ.optionA,
            optionB: sourceQ.optionB,
            optionC: sourceQ.optionC,
            optionD: sourceQ.optionD,
            correctOption: sourceQ.correctOption,
            marks: sourceQ.marks,
            difficulty: sourceQ.difficulty || "MEDIUM",
            explanation: sourceQ.explanation,
          });
        }
      });
    }

    return res.status(201).json(exam);
  } catch (error) {
    console.error("Error creating exam:", error);
    return res.status(500).json({ message: "Error creating exam" });
  }
};

export const togglePublishExam = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const exam = db.exams.findUnique((e) => e.id === id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const updated = db.exams.update(id, { isPublished: !exam.isPublished });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Error toggling exam status" });
  }
};

export const togglePublishResults = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const exam = db.exams.findUnique((e) => e.id === id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const updated = db.exams.update(id, { resultsReleased: !exam.resultsReleased });
    return res.json({
      message: `Results ${updated?.resultsReleased ? "published" : "hidden"} successfully`,
      exam: updated,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error toggling result publication" });
  }
};

// Live Exam Monitoring
export const getLiveExamMonitor = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { examId } = req.params;
    const exam = db.exams.findUnique((e) => e.id === examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const attempts = db.attempts.findMany((a) => a.examId === examId);
    const questions = db.questions.findMany((q) => q.examId === examId);

    const monitorData = attempts.map((a) => {
      const student = db.users.findUnique((u) => u.id === a.studentId);
      const studentViolations = db.violations.findMany((v) => v.attemptId === a.id);
      const answersCount = Object.keys(a.answers || {}).length;

      // Calculate Time Left
      let timeLeftFormatted = "--:--";
      let timeLeftSeconds = 0;
      if (a.status === "IN_PROGRESS" && a.startedAt) {
        const durationSecs = (exam.durationMinutes || 30) * 60;
        const elapsedSecs = Math.floor((Date.now() - new Date(a.startedAt).getTime()) / 1000);
        timeLeftSeconds = Math.max(0, durationSecs - elapsedSecs);
        const mins = Math.floor(timeLeftSeconds / 60);
        const secs = timeLeftSeconds % 60;
        timeLeftFormatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
      } else if (a.status === "SUBMITTED") {
        timeLeftFormatted = "Submitted";
      }

      return {
        attemptId: a.id,
        studentId: a.studentId,
        studentName: student?.name || "Unknown",
        studentEmail: student?.email || "Unknown",
        classGroup: student?.classGroup || "N/A",
        status: a.status,
        startedAt: a.startedAt,
        submittedAt: a.submittedAt,
        answeredCount: answersCount,
        totalQuestions: questions.length,
        timeLeftFormatted,
        timeLeftSeconds,
        score: a.score,
        isPassed: a.isPassed,
        violationsCount: studentViolations.length,
        violations: studentViolations,
      };
    });

    return res.json({
      exam,
      activeCount: attempts.filter((a) => a.status === "IN_PROGRESS").length,
      submittedCount: attempts.filter((a) => a.status === "SUBMITTED").length,
      totalEnrolled: attempts.length,
      students: monitorData,
    });
  } catch (error) {
    console.error("Error fetching live monitor data:", error);
    return res.status(500).json({ message: "Error fetching monitor data" });
  }
};

// Review Proctoring Flags for an Exam
export const getExamViolations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const faculty = req.user;
    if (!faculty) return res.status(401).json({ message: "Unauthorized" });

    const facultyExams = db.exams.findMany(
      (e) => faculty.role === "ADMIN" || e.createdById === faculty.id
    );
    const facultyExamIds = new Set(facultyExams.map((e) => e.id));

    const { examId } = req.query as { examId?: string };
    const violations = db.violations.findMany((v) => {
      if (examId && v.examId !== examId) return false;
      if (faculty.role !== "ADMIN" && !facultyExamIds.has(v.examId)) return false;
      return true;
    });
    return res.json(violations);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching violations" });
  }
};

export const markViolationReviewed = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updated = db.violations.update(id, { reviewed: true });
    if (!updated) return res.status(404).json({ message: "Violation not found" });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Error updating violation" });
  }
};

