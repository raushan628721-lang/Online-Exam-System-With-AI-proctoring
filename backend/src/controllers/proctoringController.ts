import { Response } from "express";
import db from "../db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { ViolationType } from "../types.js";

export const logViolation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = req.user;
    if (!student) return res.status(401).json({ message: "Unauthorized" });

    const { attemptId, examId, type, description } = req.body;

    if (!examId || !type) {
      return res.status(400).json({ message: "Missing required violation details" });
    }

    // Resilient attempt lookup: by attemptId, or by active student+exam attempt
    let attempt = attemptId ? db.attempts.findUnique((a) => a.id === attemptId) : null;
    if (!attempt) {
      attempt = db.attempts.findUnique((a) => a.examId === examId && a.studentId === student.id);
    }

    const targetAttemptId = attempt?.id || attemptId || "unknown-attempt";
    const targetStudentId = attempt?.studentId || student.id;
    const targetStudent = db.users.findUnique((u) => u.id === targetStudentId);
    const targetStudentName = targetStudent?.name || student.name || "Candidate";

    const validTypes: ViolationType[] = [
      "TAB_SWITCH",
      "FULLSCREEN_EXIT",
      "NO_FACE_DETECTED",
      "MULTIPLE_FACES_DETECTED",
      "LOOKING_AWAY",
    ];

    const violationType = validTypes.includes(type) ? type : "TAB_SWITCH";

    const violation = db.violations.create({
      attemptId: targetAttemptId,
      examId,
      studentId: targetStudentId,
      studentName: targetStudentName,
      type: violationType,
      description: description || `Proctoring alert: ${violationType}`,
    });

    console.log(`[Proctoring Engine] Logged violation: ${violationType} for ${targetStudentName} (Attempt: ${targetAttemptId})`);

    return res.status(201).json({ success: true, violation });
  } catch (error) {
    console.error("Error logging proctoring violation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
