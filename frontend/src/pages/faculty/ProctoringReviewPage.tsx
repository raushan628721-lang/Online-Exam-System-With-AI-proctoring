import React, { useEffect, useState } from "react";
import { facultyApi } from "../../services/api";
import { ProctoringViolation, Exam } from "../../types";
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  Filter,
  ArrowLeft,
  AlertTriangle,
  Eye,
  Check,
  X,
  Sliders,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

export const ProctoringReviewPage: React.FC = () => {
  const [violations, setViolations] = useState<any[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState<boolean>(true);

  const getSeverity = (type: string) => {
    if (type === "MULTIPLE_FACES" || type === "UNAUTHORIZED_DEVICE" || type === "CAMERA_OFF") {
      return "HIGH";
    }
    if (type === "TAB_SWITCH" || type === "WINDOW_UNFOCUS" || type === "FULLSCREEN_EXIT") {
      return "MEDIUM";
    }
    return "LOW";
  };

  const loadData = async () => {
    try {
      const [vList, eList] = await Promise.all([
        facultyApi.getViolations(selectedExamId || undefined),
        facultyApi.getExams(),
      ]);
      setViolations(vList);
      setExams(eList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedExamId]);

  const handleMarkReviewed = async (id: string) => {
    await facultyApi.markViolationReviewed(id);
    setViolations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, reviewed: true } : v))
    );
  };

  const pendingCount = violations.filter((v) => !v.reviewed).length;

  const filteredViolations = violations.filter((v) => {
    if (severityFilter === "ALL") return true;
    return getSeverity(v.type) === severityFilter;
  });

  const getSeverityBadge = (type: string) => {
    const sev = getSeverity(type);
    if (sev === "HIGH") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-800 bg-red-100 px-2.5 py-0.5 rounded-full border border-red-200">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          🔴 High Severity
        </span>
      );
    }
    if (sev === "MEDIUM") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          🟠 Medium Severity
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-yellow-800 bg-yellow-100 px-2.5 py-0.5 rounded-full border border-yellow-300">
        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
        🟡 Low Severity
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to="/faculty" className="text-xs text-indigo-400 font-bold hover:underline flex items-center gap-1">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Faculty Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            AI Proctoring Flag Review & Audit
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Classify and review automatic security incidents flagged during examination sessions.
          </p>
        </div>

        {/* Filter by Exam */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-3.5 py-2 border border-slate-700 rounded-xl text-xs font-bold bg-slate-900/90 text-white outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-lg"
          >
            <option value="" className="bg-slate-900 text-white">All Examinations</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id} className="bg-slate-900 text-white">
                {e.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Severity Hierarchy & Filter Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setSeverityFilter("ALL")}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            severityFilter === "ALL"
              ? "bg-indigo-600/30 border-indigo-500/60 text-white shadow-lg shadow-indigo-600/20"
              : "bg-slate-900/80 backdrop-blur-md text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
          }`}
        >
          <span className="text-[11px] uppercase tracking-wider font-bold block text-slate-400">All Incidents</span>
          <p className="text-2xl font-black mt-1 text-white">{violations.length}</p>
          <span className="text-xs text-slate-400">Total logged flags</span>
        </button>

        <button
          onClick={() => setSeverityFilter("HIGH")}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            severityFilter === "HIGH"
              ? "bg-red-950/80 border-red-500 text-white shadow-lg shadow-red-500/20 ring-1 ring-red-500/40"
              : "bg-red-950/30 text-red-200 border-red-900/50 hover:border-red-700/60"
          }`}
        >
          <span className="text-[11px] uppercase tracking-wider font-bold block text-red-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> High Severity
          </span>
          <p className="text-2xl font-black mt-1 text-red-300">
            {violations.filter((v) => getSeverity(v.type) === "HIGH").length}
          </p>
          <span className="text-xs text-red-400/90">Multiple faces, unauthorized phone</span>
        </button>

        <button
          onClick={() => setSeverityFilter("MEDIUM")}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            severityFilter === "MEDIUM"
              ? "bg-amber-950/80 border-amber-500 text-white shadow-lg shadow-amber-500/20 ring-1 ring-amber-500/40"
              : "bg-amber-950/30 text-amber-200 border-amber-900/50 hover:border-amber-700/60"
          }`}
        >
          <span className="text-[11px] uppercase tracking-wider font-bold block text-amber-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Medium Severity
          </span>
          <p className="text-2xl font-black mt-1 text-amber-300">
            {violations.filter((v) => getSeverity(v.type) === "MEDIUM").length}
          </p>
          <span className="text-xs text-amber-400/90">Tab switching, browser unfocus</span>
        </button>

        <button
          onClick={() => setSeverityFilter("LOW")}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            severityFilter === "LOW"
              ? "bg-yellow-950/80 border-yellow-500 text-white shadow-lg shadow-yellow-500/20 ring-1 ring-yellow-500/40"
              : "bg-yellow-950/30 text-yellow-200 border-yellow-900/50 hover:border-yellow-700/60"
          }`}
        >
          <span className="text-[11px] uppercase tracking-wider font-bold block text-yellow-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-500" /> Low Severity
          </span>
          <p className="text-2xl font-black mt-1 text-yellow-300">
            {violations.filter((v) => getSeverity(v.type) === "LOW").length}
          </p>
          <span className="text-xs text-yellow-400/90">Face absence, ambient whisper</span>
        </button>
      </div>

      {/* Flag Review Table */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Flagged Incidents Roster
          </h2>
          <span className="text-xs font-bold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-3 py-1 rounded-full">
            {filteredViolations.length} Incidents Shown
          </span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Loading proctoring flags...</div>
        ) : filteredViolations.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            No incidents found matching the selected severity or examination filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-slate-300 uppercase text-[11px] font-bold border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Severity Level</th>
                  <th className="px-6 py-4">Incident Trigger</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Instructor Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredViolations.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-bold text-white">
                      {v.studentName || "Candidate"}
                    </td>
                    <td className="px-6 py-4">
                      {getSeverityBadge(v.type)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-xs bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-lg">
                        {v.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300 max-w-xs leading-relaxed">
                      {v.description}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(v.timestamp || Date.now()).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4">
                      {v.reviewed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/40">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Reviewed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/40">
                          Pending Audit
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!v.reviewed ? (
                        <button
                          onClick={() => handleMarkReviewed(v.id)}
                          className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 rounded-xl shadow-md shadow-indigo-600/30 transition cursor-pointer"
                        >
                          Mark Reviewed
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Cleared</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};