import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../services/api";
import {
  Users,
  Award,
  BookOpen,
  ShieldAlert,
  GraduationCap,
  Briefcase,
  FileSpreadsheet,
  Settings,
  ArrowRight,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Eye,
  UserX,
  Volume2,
  Smartphone,
  Camera,
  Activity,
  ChevronRight,
  FileText,
  BarChart3,
  Sparkles,
} from "lucide-react";
import adminBannerImg from "../../assets/admin-banner.jpg";

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await adminApi.getStats();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "Recently";
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      if (diffSecs < 60) return "Just now";
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return "Recently";
    }
  };

  const formatExamDate = (dateStr?: string) => {
    if (!dateStr) return "Upcoming";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return "Upcoming";
    }
  };

  const formatExamTime = (dateStr?: string) => {
    if (!dateStr) return "10:00 AM";
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    } catch {
      return "10:00 AM";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500">Loading University Dashboard...</span>
        </div>
      </div>
    );
  }

  const upcomingExams = stats?.upcomingExams || [];
  const aiTelemetry = stats?.aiTelemetry || {
    faceNotDetected: 0,
    multipleFaces: 0,
    tabSwitch: 0,
    suspiciousAudio: 0,
    unauthorizedDevice: 0,
    highSeverity: 0,
  };
  const recentActivity = stats?.recentActivity || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Executive Hero Banner matching Student & Faculty Dashboards */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/95 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-slate-800/80 mb-8">
        {/* Ambient Subtle Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 lg:gap-10">
          {/* Centered Text, Badge, Subtitle & Stats */}
          <div className="flex-1 w-full flex flex-col items-center text-center">
            {/* Centered Badge */}
            <div className="inline-flex items-center gap-2 bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs font-semibold px-3.5 py-1 rounded-full uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              University Operations & Control Center
            </div>

            {/* Centered Heading */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Examination Administration <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-indigo-100 to-cyan-200">Dashboard</span>
            </h1>

            {/* Centered Subtitle */}
            <p className="mt-2 text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
              System-wide management of student candidates, faculty instructors, examinations, automated grading, and real-time AI-proctoring security.
            </p>

            {/* Centered Quick Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 pt-5 border-t border-slate-800/80 w-full max-w-xl mx-auto">
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-3 sm:p-3.5 text-center">
                <span className="text-slate-400 text-xs font-medium block">Total Students</span>
                <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-0.5">{stats?.totalStudents ?? 0}</p>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-3 sm:p-3.5 text-center">
                <span className="text-slate-400 text-xs font-medium block">Faculty Staff</span>
                <p className="text-xl sm:text-2xl font-bold text-blue-400 mt-0.5">{stats?.totalFaculty ?? 0}</p>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-3 sm:p-3.5 text-center">
                <span className="text-slate-400 text-xs font-medium block">Active Exams</span>
                <p className="text-xl sm:text-2xl font-bold text-indigo-300 mt-0.5">{stats?.activeExams ?? 0}</p>
              </div>
            </div>

            {/* Quick Actions Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
              <Link
                to="/admin/users"
                className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm transition shadow-lg"
              >
                <Users className="w-4 h-4 text-indigo-400" /> User Directory
              </Link>
              <Link
                to="/admin/exams"
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm transition shadow-lg shadow-indigo-600/30"
              >
                <BookOpen className="w-4 h-4" /> Examination Calendar
              </Link>
              <Link
                to="/admin/violations"
                className="flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm transition"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" /> Proctoring Logs
              </Link>
            </div>
          </div>

          {/* Right Side: 3D Cartoon Photo */}
          <div className="flex-shrink-0 flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-3xl blur-md opacity-40 group-hover:opacity-60 transition duration-300" />
              <img
                src={adminBannerImg}
                alt="University system administrator operations command center"
                className="relative w-44 h-44 sm:w-48 sm:h-48 md:w-52 md:h-52 lg:w-60 lg:h-60 object-cover rounded-3xl shadow-2xl border-2 border-slate-700/80"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5 Key Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Registered Students */}
        <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl hover:border-emerald-500/50 hover:shadow-2xl transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Registered Students
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-sm">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{stats?.totalStudents ?? 0}</p>
          <Link
            to="/admin/users?role=STUDENT"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold mt-2 flex items-center gap-1"
          >
            Manage students <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* 2. Registered Faculty */}
        <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl hover:border-blue-500/50 hover:shadow-2xl transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Registered Faculty
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-sm">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{stats?.totalFaculty ?? 0}</p>
          <Link
            to="/admin/users?role=FACULTY"
            className="text-xs text-blue-400 hover:text-blue-300 font-bold mt-2 flex items-center gap-1"
          >
            Manage faculty <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* 3. Total Exams */}
        <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl hover:border-indigo-500/50 hover:shadow-2xl transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Exams
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{stats?.totalExams ?? 0}</p>
          <Link
            to="/admin/exams"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold mt-2 flex items-center gap-1"
          >
            All examinations <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* 4. Active Exams */}
        <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl hover:border-purple-500/50 hover:shadow-2xl transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Exams
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-sm">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{stats?.activeExams ?? 0}</p>
          <span className="text-xs text-purple-400 font-bold mt-2 flex items-center gap-1">
            Live & Published
          </span>
        </div>

        {/* 5. Proctoring Violations */}
        <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl hover:border-amber-500/50 hover:shadow-2xl transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Proctoring Violations
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-400">{stats?.totalViolations ?? 0}</p>
          <Link
            to="/admin/violations"
            className="text-xs text-amber-400 hover:text-amber-300 font-bold mt-2 flex items-center gap-1"
          >
            {stats?.unreviewedViolations ?? 0} flagged logs <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main Grid: Upcoming Examinations & AI Proctoring Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Real Dynamic Upcoming Examinations */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Scheduled Examinations</h2>
                  <p className="text-xs text-slate-400">Real curriculum examinations & schedules</p>
                </div>
              </div>
              <Link
                to="/admin/exams"
                className="text-xs font-bold text-indigo-300 hover:text-white flex items-center gap-1 bg-indigo-600/30 border border-indigo-500/40 px-3 py-1.5 rounded-lg"
              >
                Manage <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingExams.length === 0 ? (
                <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-dashed border-slate-700 text-slate-400 text-xs">
                  No scheduled examinations currently in session.
                </div>
              ) : (
                upcomingExams.slice(0, 4).map((exam: any) => {
                  const isFuture = exam.startTime && new Date(exam.startTime).getTime() > Date.now();
                  return (
                    <div
                      key={exam.id}
                      className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 hover:border-indigo-500/50 transition flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-white">{exam.title}</h3>
                          {isFuture ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-purple-400" /> Upcoming
                            </span>
                          ) : exam.status === "LIVE" ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span> Live
                            </span>
                          ) : exam.status === "COMPLETED" ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Completed
                            </span>
                          ) : exam.status === "DRAFT" ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Draft
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              Active Scheduled
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1 text-slate-300 font-semibold bg-slate-750 px-2 py-0.5 rounded-md">
                            <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Start: {formatExamDate(exam.startTime)} • {formatExamTime(exam.startTime)}
                          </span>
                          <span className="flex items-center gap-1 text-slate-400 px-2 py-0.5 rounded-md">
                            <Clock className="w-3.5 h-3.5 text-slate-500" /> End: {formatExamDate(exam.endTime)} • {formatExamTime(exam.endTime)}
                          </span>
                          <span className="text-indigo-300 font-bold bg-indigo-500/15 px-2 py-0.5 rounded-md border border-indigo-500/30 text-[11px]">
                            Batch: {exam.targetClass || "ALL"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-slate-200 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                          {exam.durationMinutes || 30} Mins
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <Link
              to="/admin/exams"
              className="text-xs font-bold text-indigo-300 hover:text-white flex items-center justify-center gap-1 w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 rounded-xl transition"
            >
              View Full Examination Calendar ({upcomingExams.length} Total) &rarr;
            </Link>
          </div>
        </div>

        {/* Real Dynamic AI Proctoring Center */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-xl">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">AI Proctoring Center</h2>
                  <p className="text-xs text-slate-400">Real-time anti-cheat telemetry & incident detectors</p>
                </div>
              </div>
              <Link
                to="/admin/violations"
                className="text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1 bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-lg transition"
              >
                View Audit Logs <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* AI Security Capabilities & Alerts Breakdown (Dynamic counts) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 transition flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">👁️</div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Face Not Detected</h4>
                    <p className="text-[11px] text-slate-400">Absence during test session</p>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-200 bg-slate-900/90 px-2.5 py-0.5 rounded-md border border-slate-700">
                  {aiTelemetry.faceNotDetected}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 transition flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">👥</div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Multiple Faces</h4>
                    <p className="text-[11px] text-slate-400">Secondary person in frame</p>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-200 bg-slate-900/90 px-2.5 py-0.5 rounded-md border border-slate-700">
                  {aiTelemetry.multipleFaces}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 transition flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🖥️</div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Tab Switching</h4>
                    <p className="text-[11px] text-slate-400">Browser blur / unfocus events</p>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-200 bg-slate-900/90 px-2.5 py-0.5 rounded-md border border-slate-700">
                  {aiTelemetry.tabSwitch}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 transition flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🔊</div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Suspicious Audio</h4>
                    <p className="text-[11px] text-slate-400">Ambient voice / whisper tracker</p>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-200 bg-slate-900/90 px-2.5 py-0.5 rounded-md border border-slate-700">
                  {aiTelemetry.suspiciousAudio}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 transition flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">📱</div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Unauthorized Device</h4>
                    <p className="text-[11px] text-slate-400">Mobile phone object detection</p>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-200 bg-slate-900/90 px-2.5 py-0.5 rounded-md border border-slate-700">
                  {aiTelemetry.unauthorizedDevice}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/15 transition flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🚨</div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-200">High-Severity Flags</h4>
                    <p className="text-[11px] text-amber-300/80">Immediate invigilator review</p>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-md border border-amber-500/40">
                  {aiTelemetry.highSeverity}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-indigo-500/15 border border-indigo-500/30 rounded-2xl flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium text-indigo-200">
                <Camera className="w-4 h-4 text-indigo-400" />
                Live anti-cheat detection engine actively streaming.
              </span>
              <span className="text-[11px] font-bold text-white bg-indigo-600 px-2.5 py-0.5 rounded-md shadow-sm">
                Active
              </span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800">
            <Link
              to="/admin/violations"
              className="text-xs font-bold text-amber-300 hover:text-white flex items-center justify-center gap-1 w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-xl transition"
            >
              Open Security Incident Log &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Second Grid: Real Dynamic Recent Activity & Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Real Dynamic Recent Activity */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Recent Activity</h2>
                  <p className="text-xs text-slate-400">Live operational events & candidate actions</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                Live Stream
              </span>
            </div>

            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs bg-slate-800/40 rounded-2xl border border-dashed border-slate-700">
                  No recent activities logged yet.
                </div>
              ) : (
                recentActivity.map((act: any) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition flex items-start space-x-3 text-xs"
                  >
                    {act.type === "VIOLATION" ? (
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">
                        ⚠
                      </div>
                    ) : act.type === "ATTEMPT" ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">
                        ✓
                      </div>
                    ) : act.type === "EXAM" ? (
                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">
                        📝
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">
                        👤
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">
                        {act.title}: <span className="text-slate-300 font-normal">{act.description}</span>
                      </p>
                      <span className="text-[11px] text-slate-400 font-medium">{formatTimeAgo(act.timestamp)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800">
            <Link
              to="/admin/reports"
              className="text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1 w-full py-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl transition"
            >
              View System Audit Trails &rarr;
            </Link>
          </div>
        </div>

        {/* Reports & Analytics Quick Hub */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-500/15 border border-blue-500/30 text-blue-400 rounded-xl">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Reports & Analytics</h2>
                  <p className="text-xs text-slate-400">University records, exports and evaluation metrics</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Exam Reports */}
              <Link
                to="/admin/exams"
                className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 hover:border-blue-500/50 transition flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-blue-300 transition">
                      Exam Reports
                    </h3>
                    <p className="text-xs text-slate-400">Curriculum coverage, test schedules & participation</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition" />
              </Link>

              {/* Result Reports */}
              <Link
                to="/admin/reports"
                className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 hover:border-emerald-500/50 transition flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition">
                      Result Reports & CSV Export
                    </h3>
                    <p className="text-xs text-slate-400">Scorecard archives, grade distributions & pass/fail statistics</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
              </Link>

              {/* Proctoring Reports */}
              <Link
                to="/admin/violations"
                className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 hover:border-amber-500/50 transition flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-amber-300 transition">
                      Proctoring Reports & Audit Logs
                    </h3>
                    <p className="text-xs text-slate-400">Full audit trail of AI flags, camera telemetry & deletions</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
              </Link>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800">
            <Link
              to="/admin/reports"
              className="text-xs font-bold text-indigo-300 hover:text-white flex items-center justify-center gap-1 w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-xl transition"
            >
              Open Reports Dashboard &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};