import React, { useEffect, useState } from "react";
import { adminApi } from "../../services/api";
import {
  FileSpreadsheet,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  ShieldAlert,
  ArrowLeft,
  Trash2,
  AlertTriangle,
  Search,
  CheckCircle2,
  RefreshCw,
  X,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

export const AttemptReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
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

  const loadData = async () => {
    try {
      setLoading(true);
      const [rData, eData] = await Promise.all([
        adminApi.getReports({ examId: selectedExamId || undefined }),
        adminApi.getExams(),
      ]);
      setReports(rData);
      setExams(eData);
      setSelectedIds([]);
    } catch (e) {
      console.error(e);
      setFeedback({ type: "error", message: "Failed to load candidate reports" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedExamId]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  // Delete single attempt report
  const handleDeleteSingle = (r: any) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Candidate Attempt Report",
      message: `Are you sure you want to delete the exam record for "${r.studentName}" on "${r.examTitle}"? This will also remove any associated proctoring violation logs.`,
      confirmText: "Delete Attempt Record",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await adminApi.deleteReport(r.attemptId);
          setReports((prev) => prev.filter((item) => item.attemptId !== r.attemptId));
          setSelectedIds((prev) => prev.filter((id) => id !== r.attemptId));
          showToast("Candidate attempt report deleted successfully.");
        } catch (err: any) {
          showToast(err?.response?.data?.message || "Error deleting attempt report", "error");
        } finally {
          setActionLoading(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Clear all reports (or filtered by exam)
  const handleClearAll = () => {
    const selectedExam = exams.find((e) => e.id === selectedExamId);
    const count = filteredReports.length;

    setConfirmModal({
      isOpen: true,
      title: selectedExamId ? `Clear Reports for "${selectedExam?.title || "Exam"}"` : "Clear All Candidate Reports",
      message: selectedExamId
        ? `Are you sure you want to delete all ${count} attempt records for "${selectedExam?.title}"? This cannot be undone.`
        : `Are you sure you want to wipe ALL ${count} candidate examination attempt records across all exams?`,
      confirmText: "Clear All",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          const res = await adminApi.clearReports(selectedExamId || undefined);
          if (selectedExamId) {
            setReports((prev) => prev.filter((r) => r.examId !== selectedExamId));
          } else {
            setReports([]);
          }
          setSelectedIds([]);
          showToast(res.message || `Cleared ${count} examination report(s) successfully.`);
        } catch (err: any) {
          showToast(err?.response?.data?.message || "Error clearing reports", "error");
        } finally {
          setActionLoading(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Bulk delete selected items
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;

    setConfirmModal({
      isOpen: true,
      title: `Delete ${selectedIds.length} Selected Attempt Records`,
      message: `Are you sure you want to delete the ${selectedIds.length} selected candidate attempt records?`,
      confirmText: `Delete ${selectedIds.length} Records`,
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await Promise.all(selectedIds.map((id) => adminApi.deleteReport(id)));
          setReports((prev) => prev.filter((r) => !selectedIds.includes(r.attemptId)));
          showToast(`Successfully deleted ${selectedIds.length} attempt records.`);
          setSelectedIds([]);
        } catch (err: any) {
          showToast("Error deleting selected reports", "error");
        } finally {
          setActionLoading(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      r.studentName?.toLowerCase().includes(q) ||
      r.studentEmail?.toLowerCase().includes(q) ||
      r.classGroup?.toLowerCase().includes(q) ||
      r.examTitle?.toLowerCase().includes(q)
    );
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredReports.length && filteredReports.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredReports.map((r) => r.attemptId));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Export to CSV Function
  const exportToCSV = () => {
    if (filteredReports.length === 0) return alert("No records to export.");
    const headers = ["Student Name", "Email", "Class", "Exam Title", "Score", "Total Marks", "Percentage", "Passed", "Violations", "Submitted At"];
    const rows = filteredReports.map((r) => [
      `"${r.studentName}"`,
      `"${r.studentEmail}"`,
      `"${r.classGroup}"`,
      `"${r.examTitle}"`,
      r.score,
      r.totalMarks,
      `${r.percentage}%`,
      r.isPassed ? "YES" : "NO",
      r.violationsCount,
      `"${r.submittedAt ? new Date(r.submittedAt).toISOString() : "In Progress"}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `exam_attempts_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/admin" className="text-xs text-indigo-400 font-semibold hover:underline flex items-center gap-1 mb-3">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-0.5 rounded-full uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Admin Exclusive Controls
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5 mt-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            Candidate Examination Reports
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Audit candidate scores, automated grading records, and delete invalid attempts.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800/80 border border-slate-700 hover:bg-slate-700/80 rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>

          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={actionLoading}
              className="px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 animate-pulse"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedIds.length})
            </button>
          )}

          {reports.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={actionLoading || loading}
              className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              {selectedExamId ? `Clear Exam Reports (${filteredReports.length})` : `Clear All Reports (${reports.length})`}
            </button>
          )}

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-md shadow-emerald-600/20 transition"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Feedback Notification */}
      {feedback && (
        <div
          className={`mb-6 p-4 rounded-xl text-xs font-semibold flex items-center justify-between transition border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Exam Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, email, class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white text-slate-900 outline-none transition max-w-xs"
            >
              <option value="" className="text-slate-900">All Examinations</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id} className="text-slate-900">
                  {e.title}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
            Showing <span className="font-bold text-slate-800">{filteredReports.length}</span> of{" "}
            <span className="font-bold text-slate-800">{reports.length}</span> records
          </div>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-500 text-sm">Generating reports...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No Attempt Records Found</h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            {reports.length === 0
              ? "No candidate exam attempts are currently logged in the database."
              : "No records match the current filter and search."}
          </p>
          {(selectedExamId || searchQuery) && (
            <button
              onClick={() => {
                setSelectedExamId("");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-indigo-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-900 uppercase text-[11px] font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredReports.length && filteredReports.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      title="Select all"
                    />
                  </th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Exam Title</th>
                  <th className="px-6 py-4">Score / Max</th>
                  <th className="px-6 py-4">Percentage</th>
                  <th className="px-6 py-4">Result</th>
                  <th className="px-6 py-4">Security Flags</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((r) => {
                  const isSelected = selectedIds.includes(r.attemptId);
                  return (
                    <tr
                      key={r.attemptId}
                      className={`hover:bg-slate-50/80 transition ${
                        isSelected ? "bg-indigo-50/40" : ""
                      }`}
                    >
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(r.attemptId)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{r.studentName}</div>
                        <span className="text-xs text-indigo-600 font-mono font-medium block mt-0.5">{r.studentEmail}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                        {r.classGroup}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 text-xs">
                        {r.examTitle}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {r.score} / {r.totalMarks}
                      </td>
                      <td className="px-6 py-4 font-semibold text-indigo-600 text-xs">
                        {r.percentage}%
                      </td>
                      <td className="px-6 py-4">
                        {r.isPassed ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" /> Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3" /> Failed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {r.violationsCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                            <ShieldAlert className="w-3 h-3" /> {r.violationsCount} Flags
                          </span>
                        ) : (
                          <span className="text-xs text-emerald-700 font-medium">Clean</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                        {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "In Progress"}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteSingle(r)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition inline-flex items-center gap-1 text-xs font-bold"
                          title="Delete this candidate attempt record"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{confirmModal.title}</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={confirmModal.onConfirm}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
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