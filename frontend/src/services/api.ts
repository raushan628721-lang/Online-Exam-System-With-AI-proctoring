import axios from "axios";
import {
  Exam,
  Question,
  QuestionBank,
  ProctoringViolation,
  User,
  Role,
} from "../types";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post<{ token: string; user: User }>("/auth/login", credentials).then((r) => r.data),
  register: (data: { email: string; password: string; name: string; role?: Role; classGroup?: string }) =>
    api.post<{ token: string; user: User }>("/auth/register", data).then((r) => r.data),
  getMe: () => api.get<User>("/auth/me").then((r) => r.data),
};

// Student Exam API
export const examApi = {
  getAvailable: () => api.get<Exam[]>("/exams/available").then((r) => r.data),
  getHistory: () => api.get<any[]>("/exams/history").then((r) => r.data),
  startExam: (examId: string) =>
    api.post<{
      attemptId: string;
      startedAt: string;
      answers: Record<string, string>;
      exam: Exam;
      questions: Question[];
    }>(`/exams/${examId}/start`).then((r) => r.data),
  saveAnswer: (attemptId: string, questionId: string, selectedOption: string) =>
    api.put(`/exams/attempts/${attemptId}/answer`, { questionId, selectedOption }).then((r) => r.data),
  submitExam: (attemptId: string) =>
    api.post(`/exams/attempts/${attemptId}/submit`).then((r) => r.data),
  getResult: (attemptId: string) =>
    api.get<any>(`/exams/attempts/${attemptId}/result`).then((r) => r.data),
};

// Faculty API
export const facultyApi = {
  getQuestionBanks: () => api.get<QuestionBank[]>("/faculty/question-banks").then((r) => r.data),
  createQuestionBank: (data: { title: string; subject: string }) =>
    api.post<QuestionBank>("/faculty/question-banks", data).then((r) => r.data),
  deleteQuestionBank: (id: string) => api.delete(`/faculty/question-banks/${id}`).then((r) => r.data),
  getQuestions: (params?: { questionBankId?: string; examId?: string }) =>
    api.get<Question[]>("/faculty/questions", { params }).then((r) => r.data),
  addQuestion: (data: Partial<Question>) =>
    api.post<Question>("/faculty/questions", data).then((r) => r.data),
  updateQuestion: (id: string, data: Partial<Question>) =>
    api.put<Question>(`/faculty/questions/${id}`, data).then((r) => r.data),
  deleteQuestion: (id: string) => api.delete(`/faculty/questions/${id}`).then((r) => r.data),
  getExams: () => api.get<Exam[]>("/faculty/exams").then((r) => r.data),
  createExam: (data: any) => api.post<Exam>("/faculty/exams/schedule", data).then((r) => r.data),
  togglePublish: (id: string) => api.patch(`/faculty/exams/${id}/toggle-publish`).then((r) => r.data),
  toggleResults: (id: string) => api.patch(`/faculty/exams/${id}/toggle-results`).then((r) => r.data),
  getLiveMonitor: (examId: string) => api.get<any>(`/faculty/exams/${examId}/live-monitor`).then((r) => r.data),
  getViolations: (examId?: string) =>
    api.get<ProctoringViolation[]>("/faculty/exams/violations", { params: { examId } }).then((r) => r.data),
  markViolationReviewed: (id: string) => api.patch(`/faculty/violations/${id}/review`).then((r) => r.data),
};

// Admin API
export const adminApi = {
  getStats: () => api.get<any>("/admin/stats").then((r) => r.data),
  getUsers: (role?: string) => api.get<User[]>("/admin/users", { params: { role } }).then((r) => r.data),
  updateUser: (id: string, data: Partial<User>) =>
    api.put<{ message: string; user: User }>(`/admin/users/${id}`, data).then((r) => r.data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`).then((r) => r.data),
  getExams: () => api.get<Exam[]>("/admin/exams").then((r) => r.data),
  updateExam: (id: string, data: Partial<Exam>) => api.put(`/admin/exams/${id}`, data).then((r) => r.data),
  deleteExam: (id: string) => api.delete(`/admin/exams/${id}`).then((r) => r.data),
  getReports: (params?: { examId?: string; studentId?: string }) =>
    api.get<any[]>("/admin/reports", { params }).then((r) => r.data),
  deleteReport: (attemptId: string) =>
    api.delete<{ message: string; attempt: any }>(`/admin/reports/${attemptId}`).then((r) => r.data),
  clearReports: (examId?: string) =>
    api.delete<{ message: string; deletedCount: number }>("/admin/reports", { params: { examId } }).then((r) => r.data),
  getAllViolations: () => api.get<ProctoringViolation[]>("/admin/violations").then((r) => r.data),
  deleteViolation: (id: string) => api.delete<{ message: string; violation: ProctoringViolation }>(`/admin/violations/${id}`).then((r) => r.data),
  clearAllViolations: (type?: string) =>
    api.delete<{ message: string; deletedCount: number }>("/admin/violations", { params: { type } }).then((r) => r.data),
};

// Proctoring Telemetry API
export const proctoringApi = {
  logViolation: (data: { attemptId: string; examId: string; type: string; description: string }) =>
    api.post("/proctoring/violation", data).then((r) => r.data),
};

export default api;