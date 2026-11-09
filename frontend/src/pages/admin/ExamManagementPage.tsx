import React, { useEffect, useState } from "react";
import { adminApi } from "../../services/api";
import { Exam } from "../../types";
import {
  BookOpen,
  Edit2,
  Trash2,
  ArrowLeft,
  Clock,
  Calendar,
  CheckCircle2,
  Award,
  Users,
  Search,
  Filter,
  Eye,
  EyeOff,
  Sparkles,
  LayoutGrid,
  List,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

export const ExamManagementPage: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editExam, setEditExam] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "UPCOMING" | "COMPLETED">("ALL");
  const [viewMode, setViewMode] = useState<"CARDS" | "TABLE">("CARDS");

  const loadExams = async () => {
    try {
      const data = await adminApi.getExams();
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

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete examination "${title}" and all its associated questions and candidate attempts?`)) return;
    await adminApi.deleteExam(id);
    loadExams();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editExam) return;

    await adminApi.updateExam(editExam.id, {
      title: editExam.title,
      description: editExam.description,
      durationMinutes: Number(editExam.durationMinutes),
      totalMarks: Number(editExam.totalMarks),
      passingMarks: Number(editExam.passingMarks),
      targetClass: editExam.targetClass,
      startTime: editExam.startTime,
      endTime: editExam.endTime,
      isPublished: Boolean(editExam.isPublished),
    });

    setEditExam(null);
    loadExams();
  };

  const formatExamDate = (dateStr?: string) => {
    if (!dateStr) return "Scheduled";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return "Scheduled";
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

  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exam.description && exam.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (exam.createdByName && exam.createdByName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (exam.targetClass && exam.targetClass.toLowerCase().includes(searchQuery.toLowerCase()));

    const isFuture = exam.startTime && new Date(exam.startTime).getTime() > Date.now();
    const isCompleted = (exam.attemptsCount || 0) > 0;

    if (statusFilter === "ACTIVE") {
      return matchesSearch && exam.isPublished && !isFuture;
    }
    if (statusFilter === "UPCOMING") {
      return matchesSearch && isFuture;
    }
    if (statusFilter === "COMPLETED") {
      return matchesSearch && isCompleted;
    }
    return matchesSearch;
  });

  const activeCount = exams.filter((e) => e.isPublished && !(e.startTime && new Date(e.startTime).getTime() > Date.now())).length;
  const upcomingCount = exams.filter((e) => e.startTime && new Date(e.startTime).getTime() > Date.now()).length;
  const completedCount = exams.filter((e) => (e.attemptsCount || 0) > 0).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Navigation Breadcrumb */}
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-xs text-indigo-300 font-bold hover:text-white transition bg-indigo-500/15 hover:bg-indigo-500/25 px-3.5 py-1.5 rounded-xl border border-indigo-500/30"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Administration Dashboard
      </Link>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Pondicherry University Examination Calendar
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Full Examination Schedule & Oversight
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
            Real-time schedule timelines, test configurations, batch allocations, invigilation windows, and active proctoring telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80 self-start md:self-auto">
          <button
            onClick={() => setViewMode("CARDS")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              viewMode === "CARDS"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Examination Cards
          </button>
          <button
            onClick={() => setViewMode("TABLE")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              viewMode === "TABLE"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <List className="w-4 h-4" /> Compact Table
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search examinations, faculty, batch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/90 border border-slate-700 rounded-xl text-xs font-medium text-white placeholder:text-slate-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700"
            }`}
          >
            All Exams ({exams.length})
          </button>
          <button
            onClick={() => setStatusFilter("ACTIVE")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === "ACTIVE"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/30"
            }`}
          >
            Active Scheduled ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter("UPCOMING")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === "UPCOMING"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 border border-purple-500/30"
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            onClick={() => setStatusFilter("COMPLETED")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === "COMPLETED"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30"
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {/* Main Examination View */}
      {loading ? (
        <div className="text-center py-16 bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <span className="text-xs font-semibold text-slate-400">Loading university examination schedules...</span>
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 text-slate-400 text-sm">
          No examinations match your search or filter criteria.
        </div>
      ) : viewMode === "CARDS" ? (
        /* Rich Dark Slate Card View */
        <div className="space-y-4">
          {filteredExams.map((exam) => {
            const isFuture = exam.startTime && new Date(exam.startTime).getTime() > Date.now();
            const isCompleted = (exam.attemptsCount || 0) > 0;

            return (
              <div
                key={exam.id}
                className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 shadow-xl hover:border-indigo-500/50 hover:shadow-2xl transition p-5 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Title & Badges */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                        {exam.title}
                      </h2>
                      {isFuture ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-300 bg-purple-500/20 border border-purple-500/30 px-3 py-1 rounded-full">
                          <Calendar className="w-3.5 h-3.5 text-purple-400" /> Upcoming
                        </span>
                      ) : isCompleted ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      ) : !exam.isPublished ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-full">
                          <Clock className="w-3.5 h-3.5" /> Draft / Hidden
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 rounded-full">
                          <Calendar className="w-3.5 h-3.5" /> Active Scheduled
                        </span>
                      )}
                    </div>

                    {exam.description && (
                      <p className="text-xs text-slate-400 font-medium">{exam.description}</p>
                    )}

                    {/* Start & End Date Badges */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 text-xs">
                      <span className="inline-flex items-center gap-1.5 text-slate-200 font-bold bg-slate-800/90 px-3 py-1 rounded-xl border border-slate-700">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        Start: {formatExamDate(exam.startTime)} • {formatExamTime(exam.startTime)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-slate-400 bg-slate-800/50 px-3 py-1 rounded-xl border border-slate-700/60">
                        <Clock className="w-4 h-4 text-slate-500" />
                        End: {formatExamDate(exam.endTime)} • {formatExamTime(exam.endTime)}
                      </span>
                      <span className="inline-flex items-center text-indigo-300 font-bold bg-indigo-500/15 px-3 py-1 rounded-xl border border-indigo-500/30">
                        Batch: {exam.targetClass || "ALL"}
                      </span>
                    </div>

                    {/* Metadata & Creator Row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800 mt-3">
                      <span>
                        Instructor: <span className="text-cyan-400 font-bold">{exam.createdByName || "Faculty"}</span>
                      </span>
                      <span>•</span>
                      <span>
                        Marks: <span className="font-bold text-white">{exam.totalMarks} Total / {exam.passingMarks} Pass</span>
                      </span>
                      <span>•</span>
                      <span>
                        Questions: <span className="font-bold text-white">{exam.questionCount || 10} MCQs</span>
                      </span>
                      <span>•</span>
                      <span>
                        Attempts: <span className="font-bold text-emerald-400">{exam.attemptsCount || 0} candidate(s)</span>
                      </span>
                    </div>
                  </div>

                  {/* Right Side: Duration Pill & Action Buttons */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0 pt-2 sm:pt-0">
                    <span className="text-sm font-black text-white bg-slate-800 px-4 py-1.5 rounded-xl border border-slate-700 shadow-sm">
                      {exam.durationMinutes || 30} Mins
                    </span>

                    <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
                      <button
                        onClick={() => setEditExam(exam)}
                        className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 rounded-lg transition"
                        title="Edit Exam Configuration"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exam.id, exam.title)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition"
                        title="Delete Examination"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Compact Table View */
        <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/90 text-slate-300 uppercase text-[11px] font-bold border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Exam Title</th>
                  <th className="px-6 py-4">Schedule (Start ➔ End)</th>
                  <th className="px-6 py-4">Created By</th>
                  <th className="px-6 py-4">Duration & Marks</th>
                  <th className="px-6 py-4">Batch</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredExams.map((exam) => {
                  const isFuture = exam.startTime && new Date(exam.startTime).getTime() > Date.now();
                  const isCompleted = (exam.attemptsCount || 0) > 0;

                  return (
                    <tr key={exam.id} className="hover:bg-slate-800/60 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{exam.title}</div>
                        {exam.description && (
                          <div className="text-xs text-slate-400 font-normal line-clamp-1 mt-0.5 max-w-xs">
                            {exam.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="font-semibold text-slate-200">
                          {formatExamDate(exam.startTime)} • {formatExamTime(exam.startTime)}
                        </div>
                        <div className="text-slate-400">
                          to {formatExamDate(exam.endTime)} • {formatExamTime(exam.endTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-cyan-400 font-semibold">
                        {exam.createdByName}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="font-bold text-white">{exam.durationMinutes} mins</div>
                        <div className="text-slate-400">{exam.totalMarks} / {exam.passingMarks} pass</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-indigo-300">
                        {exam.targetClass || "ALL"}
                      </td>
                      <td className="px-6 py-4">
                        {isFuture ? (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Upcoming
                          </span>
                        ) : isCompleted ? (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Completed
                          </span>
                        ) : exam.isPublished ? (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Active
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                            Hidden
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-1">
                        <button
                          onClick={() => setEditExam(exam)}
                          className="text-slate-400 hover:text-cyan-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                          title="Edit Settings"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(exam.id, exam.title)}
                          className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                          title="Delete Exam"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editExam && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleUpdate} className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 text-white animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-4">Edit Exam Configuration</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editExam.title}
                  onChange={(e) => setEditExam({ ...editExam, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-white placeholder:text-slate-500 border border-slate-700 rounded-xl text-sm font-medium focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Description & Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Enter exam guidelines or instructor name..."
                  value={editExam.description || ""}
                  onChange={(e) => setEditExam({ ...editExam, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-white placeholder:text-slate-500 border border-slate-700 rounded-xl text-sm font-medium focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editExam.durationMinutes}
                    onChange={(e) => setEditExam({ ...editExam, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 text-white border border-slate-700 rounded-xl text-sm font-medium focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Total Marks</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editExam.totalMarks}
                    onChange={(e) => setEditExam({ ...editExam, totalMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 text-white border border-slate-700 rounded-xl text-sm font-medium focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Passing Marks</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editExam.passingMarks}
                    onChange={(e) => setEditExam({ ...editExam, passingMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 text-white border border-slate-700 rounded-xl text-sm font-medium focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Target Class</label>
                  <input
                    type="text"
                    value={editExam.targetClass}
                    onChange={(e) => setEditExam({ ...editExam, targetClass: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 text-white border border-slate-700 rounded-xl text-sm font-medium focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Visibility Status</label>
                  <select
                    value={editExam.isPublished ? "true" : "false"}
                    onChange={(e) => setEditExam({ ...editExam, isPublished: e.target.value === "true" })}
                    className="w-full px-3 py-2 bg-slate-950 text-white border border-slate-700 rounded-xl text-sm font-semibold outline-none transition"
                  >
                    <option value="true" className="bg-slate-900 text-white">Published & Active</option>
                    <option value="false" className="bg-slate-900 text-white">Hidden / Draft</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditExam(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};