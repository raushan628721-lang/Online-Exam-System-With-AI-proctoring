import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";

// Auth
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";

// Student
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { ExamRunner } from "./pages/student/ExamRunner";
import { ExamResult } from "./pages/student/ExamResult";
import { ExamHistory } from "./pages/student/ExamHistory";

// Faculty
import { FacultyDashboard } from "./pages/faculty/FacultyDashboard";
import { QuestionBankPage } from "./pages/faculty/QuestionBankPage";
import { ExamSchedulerPage } from "./pages/faculty/ExamSchedulerPage";
import { LiveMonitorPage } from "./pages/faculty/LiveMonitorPage";
import { ProctoringReviewPage } from "./pages/faculty/ProctoringReviewPage";

// Admin
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { UserManagementPage } from "./pages/admin/UserManagementPage";
import { ExamManagementPage } from "./pages/admin/ExamManagementPage";
import { AttemptReportsPage } from "./pages/admin/AttemptReportsPage";
import { SystemViolationsPage } from "./pages/admin/SystemViolationsPage";

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    const roleHint = allowedRoles?.includes("ADMIN")
      ? "ADMIN"
      : allowedRoles?.includes("FACULTY")
      ? "FACULTY"
      : "STUDENT";
    return <Navigate to={`/login?role=${roleHint}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
    if (user.role === "FACULTY") return <Navigate to="/faculty" replace />;
    return <Navigate to="/student" replace />;
  }

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login?role=STUDENT" replace />;
  if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
  if (user.role === "FACULTY") return <Navigate to="/faculty" replace />;
  return <Navigate to="/student" replace />;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isExamRunner = location.pathname.startsWith("/student/exam/");

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("app_theme") || "navy";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {!isExamRunner && <Navbar />}
      <main className="flex-1">{children}</main>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<RootRedirect />} />

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={["STUDENT"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/exam/:examId"
              element={
                <ProtectedRoute allowedRoles={["STUDENT"]}>
                  <ExamRunner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/result/:attemptId"
              element={
                <ProtectedRoute allowedRoles={["STUDENT", "FACULTY", "ADMIN"]}>
                  <ExamResult />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/history"
              element={
                <ProtectedRoute allowedRoles={["STUDENT"]}>
                  <ExamHistory />
                </ProtectedRoute>
              }
            />

            {/* Faculty Routes */}
            <Route
              path="/faculty"
              element={
                <ProtectedRoute allowedRoles={["FACULTY", "ADMIN"]}>
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/question-banks"
              element={
                <ProtectedRoute allowedRoles={["FACULTY", "ADMIN"]}>
                  <QuestionBankPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/schedule"
              element={
                <ProtectedRoute allowedRoles={["FACULTY", "ADMIN"]}>
                  <ExamSchedulerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/monitor/:examId"
              element={
                <ProtectedRoute allowedRoles={["FACULTY", "ADMIN"]}>
                  <LiveMonitorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/violations"
              element={
                <ProtectedRoute allowedRoles={["FACULTY", "ADMIN"]}>
                  <ProctoringReviewPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/exams"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <ExamManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AttemptReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/violations"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <SystemViolationsPage />
                </ProtectedRoute>
              }
            />

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;