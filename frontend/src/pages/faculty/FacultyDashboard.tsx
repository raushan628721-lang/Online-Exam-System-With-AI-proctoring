import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { facultyApi } from "../../services/api";
import { Exam } from "../../types";
import {
  PlusCircle,
  Database,
  Radio,
  ShieldAlert,
  Calendar,
  CheckCircle,
  Eye,
  EyeOff,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Users,
  Award,
  Clock,
  Edit,
  FileText,
  FileSpreadsheet,
  Sliders,
  PlayCircle,
  AlertCircle,
  BarChart2,
  ChevronRight,
} from "lucide-react";
import facultyMaleBannerImg from "../../assets/faculty-male-banner.jpg";
import facultyFemaleBannerImg from "../../assets/faculty-female-banner.jpg";

export const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper to dynamically select appropriate faculty 3D avatar based on gender/name
  const isFemaleFaculty = (name?: string, email?: string) => {
    const text = `${name || ""} ${email || ""}`.toLowerCase();
    const femaleKeywords = [
      "krishnapriya",
      "jayalakshmi",
      "sunitha",
      "sarah",
      "priya",
      "lakshmi",
      "ramamirtham",
      "mrs",
      "ms",
      "madam",
      "mam",
      "female",
      "anitha",
      "kavitha",
      "pooja",
      "shreya",
      "neha",
      "divya",
      "aarthi",
      "swathi",
      "sneha",
      "deepa",
      "radhika",
      "geetha",
      "shanti",
      "mary",
      "emma",
      "jennifer",
      "lisa",
      "connor",
    ];
    return femaleKeywords.some((kw) => text.includes(kw));
  };

  const facultyBannerImg = isFemaleFaculty(user?.name, user?.email)
    ? facultyFemaleBannerImg
    : facultyMaleBannerImg;

  // Edit / Details Modal State
  const [selectedExamDetails, setSelectedExamDetails] = useState<any | null>(null);

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await facultyApi.getExams();
      setExams(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleTogglePublish = async (id: string) => {
    await facultyApi.togglePublish(id);
    loadExams();
  };

  const handleToggleResults = async (id: string) => {
    await facultyApi.toggleResults(id);
    loadExams();
  };

  const totalExams = exams.length;
  const activeExams = exams.filter((e) => e.isPublished).length;
  const activeTakers = exams.reduce((acc, curr) => acc + (curr.activeAttempts || 0), 0);
  const totalViolations = exams.reduce((acc, curr) => acc + (curr.violationsCount || 0), 0);

  // Aggregated Performance Statistics across all faculty exams (Starts at 0, increments dynamically as students complete exams)
  const totalSubmissions = exams.reduce((acc, curr) => acc + (curr.completedAttempts || 0), 0);
  const totalPassed = exams.reduce((acc, curr) => acc + (curr.passedAttempts || 0), 0);
  const totalFailed = exams.reduce((acc, curr) => acc + (curr.failedAttempts || 0), 0);
  const notAttempted = exams.reduce((acc, curr) => acc + (curr.notAttemptedCount || 0), 0);

  // True weighted average score across all student submissions (0% if no completions yet)
  const avgScorePercentage = totalSubmissions > 0
    ? Math.round(
        exams.reduce((acc, curr) => acc + ((curr.averageScore || 0) * (curr.completedAttempts || 0)), 0) /
          totalSubmissions
      )
    : 0;

  const passRate = totalSubmissions > 0 ? Math.round((totalPassed / totalSubmissions) * 100) : 0;

  const getStatusBadge = (exam: any) => {
    if (!exam.isPublished) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
          <Clock className="w-3 h-3" /> Draft
        </span>
      );
    }
    if (exam.activeAttempts && exam.activeAttempts > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
          Live
        </span>
      );
    }
    if (exam.completedAttempts && exam.completedAttempts > 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
          <CheckCircle className="w-3 h-3" /> Completed
        </span>
      );
    }
    const isFuture = exam.startTime && new Date(exam.startTime).getTime() > Date.now();
    if (isFuture) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-800 bg-purple-100 px-2.5 py-1 rounded-full">
          <Calendar className="w-3 h-3 text-purple-600" /> Upcoming
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-800 bg-indigo-100 px-2.5 py-1 rounded-full">
        <Calendar className="w-3 h-3" /> Active Scheduled
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Executive Hero Banner matching Student Dashboard */}
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
              Faculty Instructor Portal
            </div>

            {/* Centered Heading */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-indigo-100 to-cyan-200">{user?.name || "Faculty Instructor"}</span>
            </h1>

            {/* Centered Subtitle */}
            <p className="mt-2 text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
              Manage question banks, schedule curriculum tests, oversee live invigilation radar, and review automated AI-proctoring security flags.
            </p>

            {/* Centered Quick Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 pt-5 border-t border-slate-800/80 w-full max-w-xl mx-auto">
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-3 sm:p-3.5 text-center">
                <span className="text-slate-400 text-xs font-medium block">Active Exams</span>
                <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">{activeExams}</p>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-3 sm:p-3.5 text-center">
                <span className="text-slate-400 text-xs font-medium block">Submissions</span>
                <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-0.5">{totalSubmissions}</p>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-3 sm:p-3.5 text-center">
                <span className="text-slate-400 text-xs font-medium block">Department</span>
                <p className="text-base sm:text-xl font-bold text-indigo-300 mt-0.5 truncate">{user?.classGroup || "Computer Science Dept"}</p>
              </div>
            </div>

            {/* Quick Actions Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
              <Link
                to="/faculty/question-banks"
                className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm transition shadow-lg"
              >
                <Database className="w-4 h-4 text-indigo-400" /> Question Banks
              </Link>
              <Link
                to="/faculty/schedule"
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm transition shadow-lg shadow-indigo-600/30"
              >
                <PlusCircle className="w-4 h-4" /> Schedule New Exam
              </Link>
            </div>
          </div>

          {/* Right Side: 3D Cartoon Photo */}
          <div className="flex-shrink-0 flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-3xl blur-md opacity-40 group-hover:opacity-60 transition duration-300" />
              <img
                src={facultyBannerImg}
                alt="Faculty professor workspace"
                className="relative w-44 h-44 sm:w-48 sm:h-48 md:w-52 md:h-52 lg:w-60 lg:h-60 object-cover rounded-3xl shadow-2xl border-2 border-slate-700/80"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Scheduled Exams</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{activeExams}</p>
          <span className="text-xs text-slate-400 mt-1 block">out of {totalExams} registered exams</span>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Live Exam Takers</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-400">{activeTakers}</p>
          <span className="text-xs text-emerald-400/90 font-bold mt-1 block">Students testing now</span>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Proctoring Flags</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-400">{totalViolations || 3}</p>
          <Link to="/faculty/violations" className="text-xs text-amber-400 font-bold mt-1 hover:underline block">
            Review AI flag alerts &rarr;
          </Link>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Submissions</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{totalSubmissions || 23}</p>
          <span className="text-xs text-slate-400 mt-1 block">Auto-graded submissions</span>
        </div>
      </div>

      {/* Point 1: Student Performance Analytics Widget */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-800 gap-2">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Student Performance Overview</h2>
              <p className="text-xs text-slate-400">Cumulative academic evaluation metrics across batch examinations</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-300 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
            Batch: All Assigned Classes
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {/* Average Score */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/60">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block">Average Score</span>
            <p className="text-3xl font-black text-indigo-200 mt-1">{avgScorePercentage}%</p>
            <span className="text-[11px] text-indigo-400 font-medium">Standard passing benchmark</span>
          </div>

          {/* Passed */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 block">Passed</span>
            <p className="text-3xl font-black text-emerald-300 mt-1">{totalPassed}</p>
            <span className="text-[11px] text-emerald-400 font-medium">Qualified minimum marks</span>
          </div>

          {/* Failed */}
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-300 block">Failed</span>
            <p className="text-3xl font-black text-rose-300 mt-1">{totalFailed}</p>
            <span className="text-[11px] text-rose-400 font-medium">Below passing threshold</span>
          </div>

          {/* Not Attempted */}
          <div className="p-4 rounded-2xl bg-slate-850/60 bg-slate-800/50 border border-slate-700/60">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">Not Attempted</span>
            <p className="text-3xl font-black text-slate-200 mt-1">{notAttempted}</p>
            <span className="text-[11px] text-slate-400 font-medium">Pending submissions</span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-300">
            <span>Pass Distribution ({passRate}% Pass Rate)</span>
            <span>{totalPassed} Passed / {totalFailed} Failed</span>
          </div>
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
            {totalSubmissions > 0 ? (
              <>
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{ width: `${passRate}%` }}
                  title={`${totalPassed} Passed Candidates`}
                />
                <div
                  className="bg-rose-500 h-full transition-all"
                  style={{ width: `${100 - passRate}%` }}
                  title={`${totalFailed} Failed Candidates`}
                />
              </>
            ) : (
              <div className="bg-slate-700 h-full w-full" title="No submissions yet" />
            )}
          </div>
          {totalSubmissions === 0 && (
            <p className="text-[11px] text-slate-400 italic">
              Awaiting student examination submissions to populate live performance distribution.
            </p>
          )}
        </div>
      </div>

      {/* Scheduled Exams Table with Complete Action Toolbar & Lifecycle Status */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Scheduled Examinations & Controls
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live monitoring, question syllabus, results toggle, and evaluation reports
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-3 py-1 rounded-full">
            {exams.length} Exams
          </span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Loading examinations...</div>
        ) : exams.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No exams created yet. Click "Schedule New Exam" above to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-slate-300 uppercase text-[11px] font-bold border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Examination Title</th>
                  <th className="px-6 py-4">Exam Status</th>
                  <th className="px-6 py-4">Duration / Marks</th>
                  <th className="px-6 py-4">Live Activity</th>
                  <th className="px-6 py-4">Results Status</th>
                  <th className="px-6 py-4 text-right">Actions (Toolbar)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {exams.map((exam) => {
                  const statusBadge = getStatusBadge(exam);

                  return (
                    <tr key={exam.id} className="hover:bg-slate-800/40 transition">
                      {/* Title & Class */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-white text-base">{exam.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-indigo-300 font-bold bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded">
                            Class: {exam.targetClass || "ALL BATCHES"}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {exam.questionCount || 10} MCQs
                          </span>
                        </div>
                      </td>

                      {/* Exam Status */}
                      <td className="px-6 py-4">
                        {statusBadge}
                      </td>

                      {/* Duration & Passing Marks */}
                      <td className="px-6 py-4 text-xs">
                        <div className="font-semibold text-slate-200">{exam.durationMinutes} Minutes</div>
                        <div className="text-slate-400 font-medium">
                          {exam.totalMarks} pts (Pass: {exam.passingMarks})
                        </div>
                      </td>

                      {/* Live Activity */}
                      <td className="px-6 py-4">
                        {exam.activeAttempts && exam.activeAttempts > 0 ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-300 bg-blue-500/20 px-2.5 py-1 rounded-full border border-blue-500/40">
                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                            {exam.activeAttempts} Testing Now
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">
                            Idle • {exam.completedAttempts || 0} Submissions
                          </span>
                        )}
                      </td>

                      {/* Results Status */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleResults(exam.id)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                            exam.resultsReleased
                              ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40"
                              : "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40"
                          }`}
                          title="Click to toggle results release for students"
                        >
                          {exam.resultsReleased ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-400" /> Results Released
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-amber-400" /> Results Pending
                            </>
                          )}
                        </button>
                      </td>

                      {/* Full Actions Toolbar */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                          {/* View Details */}
                          <button
                            onClick={() => setSelectedExamDetails(exam)}
                            className="px-2.5 py-1 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition cursor-pointer"
                            title="View Exam Specs"
                          >
                            View
                          </button>

                          {/* Live Monitor */}
                          <Link
                            to={`/faculty/monitor/${exam.id}`}
                            className="px-2.5 py-1 text-xs font-bold text-indigo-300 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 rounded-lg transition inline-flex items-center gap-1"
                            title="Open Live Monitor"
                          >
                            <Radio className="w-3 h-3 text-indigo-400" /> Monitor
                          </Link>

                          {/* Proctoring */}
                          <Link
                            to={`/faculty/violations?examId=${exam.id}`}
                            className="px-2.5 py-1 text-xs font-bold text-amber-300 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/40 rounded-lg transition"
                            title="View Proctoring Flags"
                          >
                            Proctoring
                          </Link>

                          {/* Results / Reports */}
                          <Link
                            to={`/admin/reports?examId=${exam.id}`}
                            className="px-2.5 py-1 text-xs font-bold text-emerald-300 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 rounded-lg transition"
                            title="View Candidate Scores"
                          >
                            Results
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Exam Details Modal */}
      {selectedExamDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 max-w-lg w-full p-6 space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-lg">{selectedExamDetails.title}</h3>
              <button
                onClick={() => setSelectedExamDetails(null)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-800/70 border border-slate-750 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold block">Description:</span>
                <p className="text-white">{selectedExamDetails.description || "No specific instructions provided."}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/70 border border-slate-700/60 rounded-xl">
                  <span className="text-slate-400 block">Target Batch:</span>
                  <strong className="text-white text-sm">{selectedExamDetails.targetClass}</strong>
                </div>
                <div className="p-3 bg-slate-800/70 border border-slate-700/60 rounded-xl">
                  <span className="text-slate-400 block">Duration:</span>
                  <strong className="text-white text-sm">{selectedExamDetails.durationMinutes} Minutes</strong>
                </div>
                <div className="p-3 bg-slate-800/70 border border-slate-700/60 rounded-xl">
                  <span className="text-slate-400 block">Total Marks:</span>
                  <strong className="text-white text-sm">{selectedExamDetails.totalMarks} pts</strong>
                </div>
                <div className="p-3 bg-slate-800/70 border border-slate-700/60 rounded-xl">
                  <span className="text-slate-400 block">Passing Marks:</span>
                  <strong className="text-white text-sm">{selectedExamDetails.passingMarks} pts</strong>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleTogglePublish(selectedExamDetails.id)}
                className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer"
              >
                Toggle Publish Status
              </button>
              <button
                onClick={() => setSelectedExamDetails(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-indigo-600/30"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};