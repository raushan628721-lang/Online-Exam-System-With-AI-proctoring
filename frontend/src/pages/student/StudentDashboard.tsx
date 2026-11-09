import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { examApi } from "../../services/api";
import { Exam } from "../../types";
import { BookOpen, Clock, Award, PlayCircle, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import studentsBannerImg from "../../assets/students-banner.jpg";

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await examApi.getAvailable();
        setExams(data);
      } catch (err) {
        console.error("Failed to load exams:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const completedCount = exams.filter((e) => e.hasAttempted).length;
  const pendingCount = exams.filter((e) => !e.hasAttempted).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Professional Executive Banner: Centered Text & Right-Side 3D Cartoon */}
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
              Student Assessment Portal
            </div>

            {/* Centered Heading */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-indigo-100 to-cyan-200">{user?.name || "Student"}</span>
            </h1>

            {/* Centered Subtitle */}
            <p className="mt-2 text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
              Take scheduled tests with automated instant grading and AI-powered proctoring. Ensure your camera is working before starting an exam.
            </p>

            {/* Centered Quick Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 pt-5 border-t border-slate-800/80 w-full max-w-xl mx-auto">
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-3 sm:p-3.5 text-center">
                <span className="text-slate-400 text-xs font-medium block">Available Exams</span>
                <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">{pendingCount}</p>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-3 sm:p-3.5 text-center">
                <span className="text-slate-400 text-xs font-medium block">Completed</span>
                <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-0.5">{completedCount}</p>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-3 sm:p-3.5 text-center">
                <span className="text-slate-400 text-xs font-medium block">Class Group</span>
                <p className="text-base sm:text-xl font-bold text-indigo-300 mt-0.5 truncate">{user?.classGroup || "CS-2026-A"}</p>
              </div>
            </div>
          </div>

          {/* Right Side: 3D Cartoon Photo */}
          <div className="flex-shrink-0 flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-3xl blur-md opacity-40 group-hover:opacity-60 transition duration-300" />
              <img
                src={studentsBannerImg}
                alt="College students studying together"
                className="relative w-44 h-44 sm:w-48 sm:h-48 md:w-52 md:h-52 lg:w-60 lg:h-60 object-cover rounded-3xl shadow-2xl border-2 border-slate-700/80"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Available Exams Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            Assigned Examinations
          </h2>
          <Link
            to="/student/history"
            className="text-xs sm:text-sm font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 px-3.5 py-1.5 rounded-xl transition"
          >
            View Attempt History <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading assessments...</span>
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-10 text-center border border-slate-800 shadow-xl">
            <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-200">No examinations scheduled right now</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
              You are all caught up! Check back once your faculty schedules a new assessment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => {
              const isDone = exam.hasAttempted;
              const isUpcoming = exam.startTime && new Date(exam.startTime).getTime() > Date.now();
              const formattedStartDate = exam.startTime
                ? new Date(exam.startTime).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                : "Upcoming";
              const formattedStartTime = exam.startTime
                ? new Date(exam.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
                : "";

              return (
                <div
                  key={exam.id}
                  className="group relative bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 hover:border-indigo-500/60 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/15 transition-all duration-300 p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3.5">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 uppercase tracking-wide">
                        {exam.targetClass || "General"}
                      </span>
                      {isDone ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      ) : isUpcoming ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300">
                          <Clock className="w-3.5 h-3.5 text-purple-400" /> Upcoming
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          Active / Ready
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-white text-lg mb-1.5 group-hover:text-indigo-200 transition-colors leading-snug">
                      {exam.title}
                    </h3>
                    <p className="text-slate-400 text-xs mb-4 line-clamp-2 leading-relaxed">
                      {exam.description || "Official proctored examination module."}
                    </p>

                    <div className="space-y-2.5 border-t border-slate-800/80 pt-3.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="w-4 h-4 text-indigo-400" /> Duration:
                        </span>
                        <span className="font-semibold text-slate-200">{exam.durationMinutes} mins</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Award className="w-4 h-4 text-cyan-400" /> Total / Pass Marks:
                        </span>
                        <span className="font-semibold text-slate-200">
                          {exam.totalMarks} / {exam.passingMarks}
                        </span>
                      </div>
                      {exam.startTime && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Scheduled Date:</span>
                          <span className="font-semibold text-indigo-200 text-[11px]">{formattedStartDate} • {formattedStartTime}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80">
                    {isDone ? (
                      <div className="flex items-center justify-between bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/60">
                        <span className="text-xs font-medium text-slate-300">
                          Score: <span className="text-indigo-300 font-bold text-sm">{exam.score} pts</span>
                        </span>
                        <button
                          onClick={() => navigate(`/student/result/${exam.id}`)}
                          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                        >
                          View Result
                        </button>
                      </div>
                    ) : isUpcoming ? (
                      <div className="bg-purple-950/40 border border-purple-800/60 text-purple-300 text-center py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4 text-purple-400" /> Opens on {formattedStartDate} at {formattedStartTime}
                      </div>
                    ) : (
                      <button
                        onClick={() => navigate(`/student/exam/${exam.id}`)}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition duration-200 active:scale-[0.99] cursor-pointer"
                      >
                        <PlayCircle className="w-4 h-4" /> Start Examination
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};