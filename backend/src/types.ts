export type Role = "STUDENT" | "FACULTY" | "ADMIN";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: Role;
  classGroup: string;
  createdAt: string;
}

export interface QuestionBank {
  id: string;
  title: string;
  subject: string;
  createdById: string;
  createdAt: string;
}

export interface Question {
  id: string;
  questionBankId?: string | null;
  examId?: string | null;
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
  marks: number;
  explanation?: string;
  createdAt: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  createdById: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  targetClass: string;
  startTime: string;
  endTime: string;
  isPublished: boolean;
  resultsReleased: boolean;
  createdAt: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  startedAt: string;
  submittedAt?: string;
  score?: number;
  isPassed?: boolean;
  answers: Record<string, string>; // { questionId: "A" }
  status: "IN_PROGRESS" | "SUBMITTED" | "DISQUALIFIED";
}

export type ViolationType =
  | "TAB_SWITCH"
  | "FULLSCREEN_EXIT"
  | "NO_FACE_DETECTED"
  | "MULTIPLE_FACES_DETECTED"
  | "LOOKING_AWAY";

export interface ProctoringViolation {
  id: string;
  attemptId: string;
  examId: string;
  studentId: string;
  studentName: string;
  type: ViolationType;
  description: string;
  timestamp: string;
  reviewed: boolean;
}

export interface DatabaseSchema {
  users: User[];
  questionBanks: QuestionBank[];
  questions: Question[];
  exams: Exam[];
  attempts: ExamAttempt[];
  violations: ProctoringViolation[];
}
