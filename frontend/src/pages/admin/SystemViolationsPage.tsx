import React, { useEffect, useState } from "react";
import { adminApi } from "../../services/api";
import { ProctoringViolation } from "../../types";
import {
  ShieldAlert,
  ArrowLeft,
  Filter,
  Trash2,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

export const SystemViolationsPage: React.FC = () => {
  const [violations, setViolations] = useState<ProctoringViolation[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Delete",
    onConfirm: async () => {},
  });

  const loadViolations = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllViolations();
      setViolations(data);
      setSelectedIds([]);
    } catch (e) {
      console.error(e);
      setFeedback({ type: "error", message: "Failed to load violation logs" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadViolations();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  // Delete a single violation
  const handleDeleteSingle = (v: ProctoringViolation) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Violation Record",
      message: `Are you sure you want to permanently delete this violation log for "${v.studentName || "Student"}" (${v.type})?`,
      confirmText: "Delete Record",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await adminApi.deleteViolation(v.id);
          setViolations((prev) => prev.filter((item) => item.id !== v.id));
          setSelectedIds((prev) => prev.filter((id) => id !== v.id));
          showToast("Violation record permanently deleted.");
        } catch (err: any) {
          showToast(err?.response?.data?.message || "Error deleting violation", "error");
        } finally {
          setActionLoading(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Clear all violations (or filtered)
  const handleClearAll = () => {
    const isFiltered = Boolean(typeFilter);
    const count = isFiltered ? filtered.length : violations.length;

    setConfirmModal({
      isOpen: true,
      title: isFiltered ? `Clear ${typeFilter} Violations` : "Clear All AI Proctoring Logs",
      message: isFiltered
        ? `Are you sure you want to delete all ${count} records matching "${typeFilter}"? This cannot be undone.`
        : `Are you sure you want to wipe ALL ${count} AI proctoring telemetry violation records across all students and exams?`,
      confirmText: "Clear All",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          const res = await adminApi.clearAllViolations(typeFilter || undefined);
          if (typeFilter) {
            setViolations((prev) => prev.filter((v) => v.type !== typeFilter));
          } else {
            setViolations([]);
          }
          setSelectedIds([]);
          showToast(res.message || `Successfully cleared ${count} violation records.`);
        } catch (err: any) {
          showToast(err?.response?.data?.message || "Error clearing violations", "error");
        } finally {
          setActionLoading(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Delete selected bulk items
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;

    setConfirmModal({
      isOpen: true,
      title: `Delete ${selectedIds.length} Selected Records`,
      message: `Are you sure you want to delete the ${selectedIds.length} selected violation entries?`,
      confirmText: `Delete ${selectedIds.length} Entries`,
      onConfirm: async () => {
        try {
          setActionLoading(true);
          // Delete each in parallel
          await Promise.all(selectedIds.map((id) => adminApi.deleteViolation(id)));
          setViolations((prev) => prev.filter((v) => !selectedIds.includes(v.id)));
          showToast(`Successfully deleted ${selectedIds.length} violation records.`);
          setSelectedIds([]);
        } catch (err: any) {
          showToast("Error deleting some selected violations", "error");
        } finally {
          setActionLoading(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Filtered list
  const filtered = violations.filter((v) => {
    const matchesType = typeFilter ? v.type === typeFilter : true;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      v.studentName?.toLowerCase().includes(q) ||
      v.examTitle?.toLowerCase().includes(q) ||
      v.description?.toLowerCase().includes(q) ||
      v.type?.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length && filtered.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((v) => v.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "TAB_SWITCH":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "FULLSCREEN_EXIT":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "NO_FACE_DETECTED":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
      case "MULTIPLE_FACES_DETECTED":
        return "bg-red-500/20 text-red-300 border-red-500/40";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <Link
        to="/admin"
        className="text-xs text-indigo-400 font-semibold hover:underline flex items-center gap-1"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Dashboard
      </Link>

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-3 py-0.5 rounded-full uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3 text-amber-400" /> Admin Exclusive Controls
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5 mt-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            Institution-Wide AI Proctoring Violations
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Audit, inspect, and delete security telemetry logs, window switches, and face detection flags.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadViolations}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800/90 border border-slate-700 hover:bg-slate-700 rounded-xl transition flex items-center gap-1.5 shadow-lg disabled:opacity-50 cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>

          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={actionLoading}
              className="px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition flex items-center gap-1.5 shadow-lg disabled:opacity-50 animate-pulse cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedIds.length})
            </button>
          )}

          {violations.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={actionLoading || loading}
              className="px-4 py-2 text-xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/60 rounded-xl transition flex items-center gap-1.5 shadow-lg disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              {typeFilter ? `Clear All ${typeFilter} (${filtered.length})` : `Clear All Logs (${violations.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between transition border ${
            feedback.type === "success"
              ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
              : "bg-rose-950/60 text-rose-300 border-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Controls / Filter / Search Toolbar */}
      <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, exam, details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-700 rounded-xl text-xs bg-slate-800/90 text-white placeholder:text-slate-400 focus:border-indigo-500 outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter dropdown and metrics */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3.5 py-2 border border-slate-700 rounded-xl text-xs font-semibold bg-slate-800/90 text-white outline-none transition cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-white">All Violation Types ({violations.length})</option>
              <option value="TAB_SWITCH" className="bg-slate-900 text-white">TAB_SWITCH</option>
              <option value="FULLSCREEN_EXIT" className="bg-slate-900 text-white">FULLSCREEN_EXIT</option>
              <option value="NO_FACE_DETECTED" className="bg-slate-900 text-white">NO_FACE_DETECTED</option>
              <option value="MULTIPLE_FACES_DETECTED" className="bg-slate-900 text-white">MULTIPLE_FACES_DETECTED</option>
              <option value="LOOKING_AWAY" className="bg-slate-900 text-white">LOOKING_AWAY</option>
            </select>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Showing <span className="font-bold text-white">{filtered.length}</span> of{" "}
            <span className="font-bold text-white">{violations.length}</span> logs
          </div>
        </div>
      </div>

      {/* Main Content Table */}
      {loading ? (
        <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 p-16 text-center shadow-xl">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-400 text-sm">Loading security events...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 p-16 text-center shadow-xl">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No AI Proctoring Violations Found</h3>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            {violations.length === 0
              ? "All proctoring logs are clean. No security flags or candidate infractions are currently logged in the database."
              : "No records match the current search filter."}
          </p>
          {(typeFilter || searchQuery) && (
            <button
              onClick={() => {
                setTypeFilter("");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-indigo-400 hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-slate-300 uppercase text-[11px] font-bold border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="px-4 py-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                      title="Select all"
                    />
                  </th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Examination</th>
                  <th className="px-6 py-4">Violation Type</th>
                  <th className="px-6 py-4">Telemetry Details</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((v) => {
                  const isSelected = selectedIds.includes(v.id);
                  return (
                    <tr
                      key={v.id}
                      className={`hover:bg-slate-800/40 transition ${
                        isSelected ? "bg-indigo-950/30" : ""
                      }`}
                    >
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(v.id)}
                          className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                        />
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        {v.studentName || "Candidate"}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-300">
                        {v.examTitle || "Exam Session"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${getBadgeStyle(
                            v.type
                          )}`}
                        >
                          {v.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-300 max-w-sm">
                        {v.description}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(v.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteSingle(v)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition inline-flex items-center gap-1 text-xs font-bold cursor-pointer"
                          title="Delete this violation record"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
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

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-150 text-white">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-lg font-bold text-white">{confirmModal.title}</h3>
            </div>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={confirmModal.onConfirm}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition shadow-lg flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {actionLoading && <RefreshCw className="w-3 h-3 animate-spin" />}
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};