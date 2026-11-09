import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { examApi } from "../../services/api";
import { History, Award, Clock, ArrowRight, ShieldAlert, CheckCircle, XCircle } from "lucide-react";

export const ExamHistory: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await examApi.getHistory();
        setHistory(data);
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
            <History className="w-6 h-6" />
          </div>
          Previous Examination Results
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Review all your submitted tests, performance metrics, and proctoring status.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading your exam records...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl p-10 text-center border border-slate-800 shadow-xl max-w-lg mx-auto">
          <Award className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">No attempts recorded yet</h3>
          <p className="text-slate-400 text-sm mt-1">Head over to the Available Exams section to start your first test.</p>
          <Link
            to="/student"
            className="mt-5 inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition"
          >
            Go to Available Exams
          </Link>
        </div>
      ) : (
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-slate-300 uppercase text-[11px] font-bold border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Exam Title</th>
                  <th className="px-6 py-4">Date Submitted</th>
                  <th className="px-6 py-4">Score / Max</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Proctoring</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
                {history.map((item) => {
                  const percentage = Math.round((item.score / item.totalMarks) * 100);
                  return (
                    <tr key={item.attemptId} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 font-bold text-white">
                        {item.examTitle}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(item.submittedAt || item.startedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-white">{item.score}</span> / {item.totalMarks} pts
                        <span className="text-xs text-indigo-300 ml-1.5 font-medium">({percentage}%)</span>
                      </td>
                      <td className="px-6 py-4">
                        {item.isPassed ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                            <CheckCircle className="w-3.5 h-3.5" /> Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400">
                            <XCircle className="w-3.5 h-3.5" /> Failed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {item.violationsCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                            <ShieldAlert className="w-3.5 h-3.5" /> {item.violationsCount} Flags
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">Clean Session</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/student/result/${item.attemptId}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
                        >
                          View Details <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};