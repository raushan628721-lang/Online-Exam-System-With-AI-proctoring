import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { DatabaseSchema, User, Exam, Question, QuestionBank, ExamAttempt, ProctoringViolation } from "./types.js";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultAdminPassword = bcrypt.hashSync("admin123", 10);
const defaultFacultyPassword = bcrypt.hashSync("faculty123", 10);
const defaultStudentPassword = bcrypt.hashSync("student123", 10);

const initialData: DatabaseSchema = {
  users: [
    {
      id: "admin-1",
      email: "admin@exam.com",
      passwordHash: defaultAdminPassword,
      name: "University Administrator",
      role: "ADMIN",
      classGroup: "Administration",
      createdAt: new Date().toISOString(),
    },
    {
      id: "faculty-1",
      email: "faculty@exam.com",
      passwordHash: defaultFacultyPassword,
      name: "Prof. Sarah Connor",
      role: "FACULTY",
      classGroup: "Computer Science Dept",
      createdAt: new Date().toISOString(),
    },
    {
      id: "student-1",
      email: "student@exam.com",
      passwordHash: defaultStudentPassword,
      name: "Alex Johnson",
      role: "STUDENT",
      classGroup: "CS-2026-A",
      createdAt: new Date().toISOString(),
    },
  ],
  questionBanks: [
    {
      id: "qb-1",
      title: "Web Engineering & Protocols",
      subject: "Computer Science",
      createdById: "faculty-1",
      createdAt: new Date().toISOString(),
    },
  ],
  questions: [
    {
      id: "q-1",
      questionBankId: "qb-1",
      examId: "exam-1",
      prompt: "Which HTTP status code signifies that a requested resource was successfully created on the server?",
      optionA: "200 OK",
      optionB: "201 Created",
      optionC: "204 No Content",
      optionD: "304 Not Modified",
      correctOption: "B",
      marks: 5,
      explanation: "HTTP status code 201 indicates that the request has succeeded and has led to the creation of a resource.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "q-2",
      questionBankId: "qb-1",
      examId: "exam-1",
      prompt: "What is the primary purpose of the DNS (Domain Name System) protocol?",
      optionA: "Encrypt network communication",
      optionB: "Translate human-readable domain names into IP addresses",
      optionC: "Route packets dynamically between autonomous systems",
      optionD: "Compress web assets during transmission",
      correctOption: "B",
      marks: 5,
      explanation: "DNS translates memorable hostnames (like google.com) into numerical IP addresses.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "q-3",
      questionBankId: "qb-1",
      examId: "exam-1",
      prompt: "Which data structure uses the Last-In-First-Out (LIFO) order of operation?",
      optionA: "Queue",
      optionB: "Binary Search Tree",
      optionC: "Stack",
      optionD: "Linked List",
      correctOption: "C",
      marks: 5,
      explanation: "A Stack operates strictly on a LIFO (Last In, First Out) principle.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "q-4",
      questionBankId: "qb-1",
      examId: "exam-1",
      prompt: "What is the worst-case time complexity of QuickSort with standard partition?",
      optionA: "O(n log n)",
      optionB: "O(n)",
      optionC: "O(n^2)",
      optionD: "O(log n)",
      correctOption: "C",
      marks: 5,
      explanation: "When poorly partitioned (such as already sorted arrays with poor pivot choice), QuickSort degrades to O(n^2).",
      createdAt: new Date().toISOString(),
    },
  ],
  exams: [
    {
      id: "exam-1",
      title: "Mid-Term CS-101: Web & Data Structures",
      description: "Covers HTTP/DNS architecture, stack/queue concepts, and sorting algorithms. Closed-book, AI proctored.",
      createdById: "faculty-1",
      durationMinutes: 20,
      totalMarks: 20,
      passingMarks: 10,
      targetClass: "CS-2026-A",
      startTime: new Date(Date.now() - 3600000).toISOString(),
      endTime: new Date(Date.now() + 86400000 * 7).toISOString(),
      isPublished: true,
      resultsReleased: true,
      createdAt: new Date().toISOString(),
    },
  ],
  attempts: [],
  violations: [],
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const loaded: DatabaseSchema = JSON.parse(raw);
        let updated = false;

        // Ensure default accounts exist for demo/testing
        for (const defaultUser of initialData.users) {
          if (!loaded.users.some((u) => u.email === defaultUser.email)) {
            loaded.users.push(defaultUser);
            updated = true;
          }
        }

        if (updated) {
          this.save(loaded);
        }
        return loaded;
      }
    } catch (e) {
      console.error("Error reading database file, using defaults:", e);
    }
    this.save(initialData);
    return initialData;
  }

  private save(dataToSave?: DatabaseSchema) {
    const toWrite = dataToSave || this.data;
    fs.writeFileSync(DB_FILE, JSON.stringify(toWrite, null, 2), "utf-8");
  }

  public get users() {
    return {
      findUnique: (predicate: (u: User) => boolean) => this.data.users.find(predicate),
      findMany: (predicate?: (u: User) => boolean) => (predicate ? this.data.users.filter(predicate) : [...this.data.users]),
      create: (u: Omit<User, "id" | "createdAt">) => {
        const newUser: User = {
          ...u,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        this.data.users.push(newUser);
        this.save();
        return newUser;
      },
      update: (id: string, updates: Partial<User>) => {
        const idx = this.data.users.findIndex((u) => u.id === id);
        if (idx !== -1) {
          this.data.users[idx] = { ...this.data.users[idx], ...updates };
          this.save();
          return this.data.users[idx];
        }
        return null;
      },
      delete: (id: string) => {
        const idx = this.data.users.findIndex((u) => u.id === id);
        if (idx !== -1) {
          const removed = this.data.users.splice(idx, 1)[0];
          this.save();
          return removed;
        }
        return null;
      },
    };
  }

  public get exams() {
    return {
      findUnique: (predicate: (e: Exam) => boolean) => this.data.exams.find(predicate),
      findMany: (predicate?: (e: Exam) => boolean) => (predicate ? this.data.exams.filter(predicate) : [...this.data.exams]),
      create: (e: Omit<Exam, "id" | "createdAt">) => {
        const newExam: Exam = {
          ...e,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        this.data.exams.push(newExam);
        this.save();
        return newExam;
      },
      update: (id: string, updates: Partial<Exam>) => {
        const idx = this.data.exams.findIndex((e) => e.id === id);
        if (idx !== -1) {
          this.data.exams[idx] = { ...this.data.exams[idx], ...updates };
          this.save();
          return this.data.exams[idx];
        }
        return null;
      },
      delete: (id: string) => {
        const idx = this.data.exams.findIndex((e) => e.id === id);
        if (idx !== -1) {
          const removed = this.data.exams.splice(idx, 1)[0];
          this.data.questions = this.data.questions.filter((q) => q.examId !== id);
          this.save();
          return removed;
        }
        return null;
      },
    };
  }

  public get questionBanks() {
    return {
      findUnique: (predicate: (qb: QuestionBank) => boolean) => this.data.questionBanks.find(predicate),
      findMany: (predicate?: (qb: QuestionBank) => boolean) => (predicate ? this.data.questionBanks.filter(predicate) : [...this.data.questionBanks]),
      create: (qb: Omit<QuestionBank, "id" | "createdAt">) => {
        const newQb: QuestionBank = {
          ...qb,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        this.data.questionBanks.push(newQb);
        this.save();
        return newQb;
      },
      delete: (id: string) => {
        const idx = this.data.questionBanks.findIndex((qb) => qb.id === id);
        if (idx !== -1) {
          const removed = this.data.questionBanks.splice(idx, 1)[0];
          this.data.questions = this.data.questions.filter((q) => q.questionBankId !== id);
          this.save();
          return removed;
        }
        return null;
      },
    };
  }

  public get questions() {
    return {
      findUnique: (predicate: (q: Question) => boolean) => this.data.questions.find(predicate),
      findMany: (predicate?: (q: Question) => boolean) => (predicate ? this.data.questions.filter(predicate) : [...this.data.questions]),
      create: (q: Omit<Question, "id" | "createdAt">) => {
        const newQ: Question = {
          ...q,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        this.data.questions.push(newQ);
        this.save();
        return newQ;
      },
      update: (id: string, updates: Partial<Question>) => {
        const idx = this.data.questions.findIndex((q) => q.id === id);
        if (idx !== -1) {
          this.data.questions[idx] = { ...this.data.questions[idx], ...updates };
          this.save();
          return this.data.questions[idx];
        }
        return null;
      },
      delete: (id: string) => {
        const idx = this.data.questions.findIndex((q) => q.id === id);
        if (idx !== -1) {
          const removed = this.data.questions.splice(idx, 1)[0];
          this.save();
          return removed;
        }
        return null;
      },
    };
  }

  public get attempts() {
    return {
      findUnique: (predicate: (a: ExamAttempt) => boolean) => this.data.attempts.find(predicate),
      findMany: (predicate?: (a: ExamAttempt) => boolean) => (predicate ? this.data.attempts.filter(predicate) : [...this.data.attempts]),
      create: (a: Omit<ExamAttempt, "id" | "startedAt">) => {
        const newA: ExamAttempt = {
          ...a,
          id: crypto.randomUUID(),
          startedAt: new Date().toISOString(),
        };
        this.data.attempts.push(newA);
        this.save();
        return newA;
      },
      update: (id: string, updates: Partial<ExamAttempt>) => {
        const idx = this.data.attempts.findIndex((a) => a.id === id);
        if (idx !== -1) {
          this.data.attempts[idx] = { ...this.data.attempts[idx], ...updates };
          this.save();
          return this.data.attempts[idx];
        }
        return null;
      },
      delete: (id: string) => {
        const idx = this.data.attempts.findIndex((a) => a.id === id);
        if (idx !== -1) {
          const removed = this.data.attempts.splice(idx, 1)[0];
          // Also cleanup associated violations
          this.data.violations = this.data.violations.filter((v) => v.attemptId !== id);
          this.save();
          return removed;
        }
        return null;
      },
      deleteMany: (predicate?: (a: ExamAttempt) => boolean) => {
        if (!predicate) {
          const count = this.data.attempts.length;
          this.data.attempts = [];
          this.data.violations = [];
          this.save();
          return count;
        }
        const initialCount = this.data.attempts.length;
        const toDelete = this.data.attempts.filter(predicate);
        const toDeleteIds = new Set(toDelete.map((a) => a.id));
        this.data.attempts = this.data.attempts.filter((a) => !toDeleteIds.has(a.id));
        this.data.violations = this.data.violations.filter((v) => !toDeleteIds.has(v.attemptId));
        const deletedCount = initialCount - this.data.attempts.length;
        this.save();
        return deletedCount;
      },
    };
  }

  public get violations() {
    return {
      findMany: (predicate?: (v: ProctoringViolation) => boolean) => (predicate ? this.data.violations.filter(predicate) : [...this.data.violations]),
      findUnique: (predicate: (v: ProctoringViolation) => boolean) => this.data.violations.find(predicate),
      create: (v: Omit<ProctoringViolation, "id" | "timestamp" | "reviewed">) => {
        const newV: ProctoringViolation = {
          ...v,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          reviewed: false,
        };
        this.data.violations.push(newV);
        this.save();
        return newV;
      },
      update: (id: string, updates: Partial<ProctoringViolation>) => {
        const idx = this.data.violations.findIndex((v) => v.id === id);
        if (idx !== -1) {
          this.data.violations[idx] = { ...this.data.violations[idx], ...updates };
          this.save();
          return this.data.violations[idx];
        }
        return null;
      },
      delete: (id: string) => {
        const idx = this.data.violations.findIndex((v) => v.id === id);
        if (idx !== -1) {
          const removed = this.data.violations.splice(idx, 1)[0];
          this.save();
          return removed;
        }
        return null;
      },
      deleteMany: (predicate?: (v: ProctoringViolation) => boolean) => {
        if (!predicate) {
          const count = this.data.violations.length;
          this.data.violations = [];
          this.save();
          return count;
        }
        const initialCount = this.data.violations.length;
        this.data.violations = this.data.violations.filter((v) => !predicate(v));
        const deletedCount = initialCount - this.data.violations.length;
        this.save();
        return deletedCount;
      },
    };
  }
}

const db = new Database();
export default db;
