import { Response } from "express";
import db from "../db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

// System Overview & Stats
export const getAdminStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = db.users.findMany();
    const students = users.filter((u) => u.role === "STUDENT");
    const faculty = users.filter((u) => u.role === "FACULTY");
    const exams = db.exams.findMany();
    const attempts = db.attempts.findMany();
    const completedAttempts = attempts.filter((a) => a.status === "SUBMITTED");
    const passedAttempts = completedAttempts.filter((a) => a.isPassed);
    const violations = db.violations.findMany();

    const passRate = completedAttempts.length > 0
      ? Math.round((passedAttempts.length / completedAttempts.length) * 100)
      : 0;

    const activeExams = exams.filter((e) => e.isPublished).length;

    // Real upcoming / active examinations with actual database durationMinutes
    const formattedExams = exams.map((e) => {
      const creator = db.users.findUnique((u) => u.id === e.createdById);
      const examAttempts = attempts.filter((a) => a.examId === e.id);
      const activeAttemptsCount = examAttempts.filter((a) => a.status === "IN_PROGRESS").length;
      const completedCount = examAttempts.filter((a) => a.status === "SUBMITTED").length;

      let status = "SCHEDULED";
      if (!e.isPublished) {
        status = "DRAFT";
      } else if (activeAttemptsCount > 0) {
        status = "LIVE";
      } else if (completedCount > 0) {
        status = "COMPLETED";
      } else {
        status = "SCHEDULED";
      }

      return {
        id: e.id,
        title: e.title,
        description: e.description,
        createdById: e.createdById,
        creatorName: creator?.name || "Faculty",
        durationMinutes: e.durationMinutes || 30,
        totalMarks: e.totalMarks || 50,
        passingMarks: e.passingMarks || 40,
        targetClass: e.targetClass || "ALL",
        startTime: e.startTime,
        endTime: e.endTime,
        isPublished: e.isPublished,
        resultsReleased: e.resultsReleased,
        status,
        attemptsCount: examAttempts.length,
        activeAttemptsCount,
      };
    });

    // Real AI Proctoring Telemetry Breakdown
    const aiTelemetry = {
      faceNotDetected: violations.filter(
        (v) => v.type === "NO_FACE_DETECTED" || v.type === "FACE_NOT_DETECTED"
      ).length,
      multipleFaces: violations.filter((v) => v.type === "MULTIPLE_FACES").length,
      tabSwitch: violations.filter((v) => v.type === "TAB_SWITCH").length,
      suspiciousAudio: violations.filter((v) => v.type === "SUSPICIOUS_AUDIO").length,
      unauthorizedDevice: violations.filter(
        (v) => v.type === "UNAUTHORIZED_DEVICE" || v.type === "PHONE_DETECTED"
      ).length,
      highSeverity: violations.filter(
        (v) => !v.reviewed || v.type === "MULTIPLE_FACES" || v.type === "UNAUTHORIZED_DEVICE"
      ).length,
      totalFlags: violations.length,
      unreviewed: violations.filter((v) => !v.reviewed).length,
    };

    // Real chronological activity events from DB
    const activityEvents: Array<{
      id: string;
      type: "USER" | "EXAM" | "VIOLATION" | "ATTEMPT";
      title: string;
      description: string;
      timestamp: string;
      severity?: "info" | "success" | "warning" | "error";
    }> = [];

    // 1. Violations
    violations.forEach((v) => {
      const exam = exams.find((e) => e.id === v.examId);
      activityEvents.push({
        id: `v-${v.id}`,
        type: "VIOLATION",
        title: `AI Flag: ${v.type.replace(/_/g, " ")}`,
        description: `Flagged on candidate ${v.studentName || "Student"}${exam ? ` during ${exam.title}` : ""}`,
        timestamp: v.timestamp || new Date().toISOString(),
        severity: "warning",
      });
    });

    // 2. Exam Submissions
    completedAttempts.forEach((a) => {
      const student = users.find((u) => u.id === a.studentId);
      const exam = exams.find((e) => e.id === a.examId);
      activityEvents.push({
        id: `a-${a.id}`,
        type: "ATTEMPT",
        title: "Exam Submitted",
        description: `${student?.name || "Candidate"} completed ${exam?.title || "Exam"} (Score: ${a.score ?? 0}/${exam?.totalMarks ?? 50})`,
        timestamp: a.submittedAt || a.startedAt || new Date().toISOString(),
        severity: "success",
      });
    });

    // 3. Exam Creations
    exams.forEach((e) => {
      const creator = users.find((u) => u.id === e.createdById);
      activityEvents.push({
        id: `e-${e.id}`,
        type: "EXAM",
        title: "Exam Scheduled",
        description: `"${e.title}" (${e.durationMinutes || 30} mins) scheduled by ${creator?.name || "Faculty"}`,
        timestamp: e.createdAt || new Date().toISOString(),
        severity: "info",
      });
    });

    // 4. User Registrations
    users.slice(-10).forEach((u) => {
      if (u.createdAt) {
        activityEvents.push({
          id: `u-${u.id}`,
          type: "USER",
          title: `New ${u.role === "STUDENT" ? "Student" : u.role === "FACULTY" ? "Faculty" : "User"} Registered`,
          description: `${u.name} joined ${u.classGroup || "Platform"}`,
          timestamp: u.createdAt,
          severity: "info",
        });
      }
    });

    // Sort recent activity newest first and take top 6
    activityEvents.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return res.json({
      totalStudents: students.length,
      totalFaculty: faculty.length,
      totalExams: exams.length,
      activeExams,
      totalAttempts: attempts.length,
      completedAttempts: completedAttempts.length,
      passRate,
      totalViolations: violations.length,
      unreviewedViolations: violations.filter((v) => !v.reviewed).length,
      upcomingExams: formattedExams,
      aiTelemetry,
      recentActivity: activityEvents.slice(0, 6),
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching admin stats" });
  }
};

// View registered students & users
export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role } = req.query;
    let users = db.users.findMany();
    if (role) {
      users = users.filter((u) => u.role === role);
    }
    const safeUsers = users.map(({ passwordHash, ...u }) => {
      const attemptsCount = db.attempts.findMany((a) => a.studentId === u.id).length;
      const examsCreatedCount = db.exams.findMany((e) => e.createdById === u.id).length;
      const qbCreatedCount = db.questionBanks.findMany((qb) => qb.createdById === u.id).length;
      return { ...u, attemptsCount, examsCreatedCount, qbCreatedCount };
    });
    return res.json(safeUsers);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching users" });
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, classGroup, role } = req.body;

    const existing = db.users.findUnique((u) => u.id === id);
    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }

    // If changing email, check for duplicates
    if (email && email.trim().toLowerCase() !== existing.email.toLowerCase()) {
      const duplicate = db.users.findUnique(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.id !== id
      );
      if (duplicate) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }
    }

    const updated = db.users.update(id, {
      ...(name !== undefined && { name: name.trim() }),
      ...(email !== undefined && { email: email.trim().toLowerCase() }),
      ...(classGroup !== undefined && { classGroup: classGroup.trim() }),
      ...(role !== undefined && { role }),
    });

    if (!updated) {
      return res.status(500).json({ message: "Failed to update user" });
    }

    const { passwordHash, ...safeUser } = updated;
    return res.json({ message: "User details updated successfully", user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: "Error updating user" });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (id === req.user?.id) {
      return res.status(400).json({ message: "Cannot delete your own admin account" });
    }
    const deleted = db.users.delete(id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting user" });
  }
};

// CRUD Exams for Admin
export const getAllExams = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const exams = db.exams.findMany();
    const formatted = exams.map((e) => {
      const creator = db.users.findUnique((u) => u.id === e.createdById);
      const qCount = db.questions.findMany((q) => q.examId === e.id).length;
      const attemptsCount = db.attempts.findMany((a) => a.examId === e.id).length;
      const violationsCount = db.violations.findMany((v) => v.examId === e.id).length;

      return {
        ...e,
        createdByName: creator?.name || "Unknown",
        questionCount: qCount,
        attemptsCount,
        violationsCount,
      };
    });
    return res.json(formatted);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching exams" });
  }
};

export const updateExamSettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      durationMinutes,
      totalMarks,
      passingMarks,
      targetClass,
      startTime,
      endTime,
      isPublished,
      resultsReleased,
    } = req.body;

    const updated = db.exams.update(id, {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(durationMinutes !== undefined && { durationMinutes: Number(durationMinutes) }),
      ...(totalMarks !== undefined && { totalMarks: Number(totalMarks) }),
      ...(passingMarks !== undefined && { passingMarks: Number(passingMarks) }),
      ...(targetClass !== undefined && { targetClass }),
      ...(startTime !== undefined && { startTime }),
      ...(endTime !== undefined && { endTime }),
      ...(isPublished !== undefined && { isPublished: Boolean(isPublished) }),
      ...(resultsReleased !== undefined && { resultsReleased: Boolean(resultsReleased) }),
    });

    if (!updated) return res.status(404).json({ message: "Exam not found" });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Error updating exam" });
  }
};

export const deleteExam = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = db.exams.delete(id);
    if (!deleted) return res.status(404).json({ message: "Exam not found" });
    return res.json({ message: "Exam deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting exam" });
  }
};

// Exam Attempt Reports & Results
export const getAttemptReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { examId, studentId } = req.query;
    let attempts = db.attempts.findMany();

    if (examId) attempts = attempts.filter((a) => a.examId === examId);
    if (studentId) attempts = attempts.filter((a) => a.studentId === studentId);

    const report = attempts.map((a) => {
      const student = db.users.findUnique((u) => u.id === a.studentId);
      const exam = db.exams.findUnique((e) => e.id === a.examId);
      const violations = db.violations.findMany(
        (v) => v.attemptId === a.id || (v.studentId === a.studentId && v.examId === a.examId)
      );

      return {
        attemptId: a.id,
        examId: a.examId,
        examTitle: exam?.title || "Unknown Exam",
        studentId: a.studentId,
        studentName: student?.name || "Unknown Student",
        studentEmail: student?.email || "Unknown Email",
        classGroup: student?.classGroup || "N/A",
        score: a.score ?? 0,
        totalMarks: exam?.totalMarks ?? 0,
        passingMarks: exam?.passingMarks ?? 0,
        percentage:
          exam?.totalMarks && a.score !== undefined
            ? Math.round((a.score / exam.totalMarks) * 100)
            : 0,
        isPassed: a.isPassed ?? false,
        status: a.status,
        startedAt: a.startedAt,
        submittedAt: a.submittedAt,
        violationsCount: violations.length,
      };
    });

    return res.json(report);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching attempt reports" });
  }
};

// Delete single candidate examination attempt report (Admin only)
export const deleteAttemptReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { attemptId } = req.params;
    const deleted = db.attempts.delete(attemptId);
    if (!deleted) {
      return res.status(404).json({ message: "Attempt report record not found" });
    }
    return res.json({ message: "Candidate attempt report deleted successfully", attempt: deleted });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting attempt report" });
  }
};

// Clear all candidate attempt reports (Admin only, optional filter by examId)
export const clearAttemptReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { examId } = req.query;
    const deletedCount = db.attempts.deleteMany(
      examId ? (a) => a.examId === examId : undefined
    );
    return res.json({
      message: `Cleared ${deletedCount} candidate examination report(s) successfully`,
      deletedCount,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error clearing attempt reports" });
  }
};


// View AI-Proctoring Violations
export const getAllViolations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const violations = db.violations.findMany();
    const enriched = violations.map((v) => {
      const exam = db.exams.findUnique((e) => e.id === v.examId);
      return {
        ...v,
        examTitle: exam?.title || "Exam Session",
      };
    });
    return res.json(enriched.reverse()); // most recent first
  } catch (error) {
    return res.status(500).json({ message: "Error fetching violations" });
  }
};

// Delete single AI-Proctoring violation (Admin only)
export const deleteViolation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = db.violations.delete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Violation record not found" });
    }
    return res.json({ message: "Violation log deleted successfully", violation: deleted });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting violation" });
  }
};

// Clear all AI-Proctoring violations (Admin only, optional filter by type)
export const clearAllViolations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type } = req.query;
    const deletedCount = db.violations.deleteMany(
      type ? (v) => v.type === type : undefined
    );
    return res.json({
      message: `Cleared ${deletedCount} AI-Proctoring violation log(s) successfully`,
      deletedCount,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error clearing violations" });
  }
};

