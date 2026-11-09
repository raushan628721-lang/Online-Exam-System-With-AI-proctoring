import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { examApi } from "../../services/api";
import {
  Award,
  CheckCircle,
  XCircle,
  Clock,
  ShieldAlert,
  ArrowLeft,
  HelpCircle,
  Check,
  X,
  AlertTriangle,
  Download,
  Eye,
  ShieldCheck,
  Printer,
  Calendar,
  FileText,
  Activity,
  Sliders,
  Sparkles,
} from "lucide-react";

export const ExamResult: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showProctoringModal, setShowProctoringModal] = useState<boolean>(false);

  useEffect(() => {
    if (!attemptId) return;

    const fetchResult = async () => {
      try {
        const data = await examApi.getResult(attemptId);
        setResult(data);
      } catch (err) {
        console.error("Failed to load result:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600 font-medium text-sm">Calculating marks and generating scorecard...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Result Not Found</h2>
        <Link to="/student" className="text-indigo-600 font-semibold underline mt-3 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const {
    exam,
    score,
    isPassed,
    status,
    violationsCount,
    violations = [],
    allowDetailedReview,
    questions,
    startedAt,
    submittedAt,
  } = result;

  const percentage = Math.round((score / exam.totalMarks) * 100);

  // Time calculations
  const formatTime = (isoString?: string) => {
    if (!isoString) return "--:--";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const calculateTimeTaken = (start?: string, end?: string) => {
    if (!start || !end) return "24 min";
    const diffMs = Math.max(0, new Date(end).getTime() - new Date(start).getTime());
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    if (diffMins === 0) return `${diffSecs} sec`;
    return `${diffMins} min ${diffSecs > 0 ? `${diffSecs}s` : ""}`;
  };

  const startTimeStr = formatTime(startedAt);
  const submitTimeStr = formatTime(submittedAt);
  const timeTakenStr = calculateTimeTaken(startedAt, submittedAt);
  const examDurationStr = `${exam.durationMinutes || 30} min`;

  // Violation breakdown calculations
  const tabSwitchCount = violations.filter((v: any) => v.type === "TAB_SWITCH" || v.type === "WINDOW_UNFOCUS").length;
  const faceMissingCount = violations.filter((v: any) => v.type === "NO_FACE_DETECTED").length;
  const multipleFaceCount = violations.filter((v: any) => v.type === "MULTIPLE_FACES").length;
  const suspiciousAudioCount = violations.filter((v: any) => v.type === "SUSPICIOUS_AUDIO").length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 print:p-0 print:max-w-none space-y-6">
      {/* Top Back Link (hidden on print) */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          to="/student/history"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Examination History
        </Link>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-xl border border-slate-700 shadow-md transition cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-indigo-400" /> Print Scorecard
        </button>
      </div>

      {/* Main Score Summary Card */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 shadow-2xl overflow-hidden text-white">
        <div
          className={`p-8 text-center text-white ${
            isPassed
              ? "bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900"
              : "bg-gradient-to-br from-rose-600 via-red-700 to-slate-900"
          }`}
        >
          <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center mx-auto mb-4 border-2 border-white/30 shadow-lg">
            {isPassed ? <Award className="w-10 h-10 text-amber-200" /> : <XCircle className="w-10 h-10 text-white" />}
          </div>
          <span className="text-xs uppercase tracking-widest font-extrabold bg-white/20 px-3.5 py-1 rounded-full border border-white/30">
            Official Examination Result
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mt-2 tracking-tight">{exam.title}</h1>
          <p className="text-slate-200 text-sm mt-1 max-w-lg mx-auto">
            {isPassed
              ? "Congratulations! You have successfully passed this proctored assessment."
              : "You did not achieve the required passing score for this examination."}
          </p>

          <div className="mt-8 flex justify-center items-baseline gap-2">
            <span className="text-6xl font-black tracking-tight">{score}</span>
            <span className="text-2xl text-slate-200 font-semibold">/ {exam.totalMarks} Marks</span>
          </div>
          <span className="inline-block mt-3 font-bold text-sm bg-black/40 px-4 py-1.5 rounded-full border border-white/20 shadow-sm">
            {percentage}% Overall Score • {isPassed ? "PASSED" : "FAILED"}
          </span>
        </div>

        {/* Breakdown Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 bg-slate-900/90 p-4 border-t border-slate-800 text-center">
          <div className="p-3">
            <span className="text-xs text-slate-400 font-medium">Passing Marks</span>
            <p className="text-lg font-extrabold text-white mt-0.5">{exam.passingMarks} pts</p>
          </div>
          <div className="p-3">
            <span className="text-xs text-slate-400 font-medium">Attempt Status</span>
            <p className="text-lg font-extrabold text-emerald-400 uppercase text-xs sm:text-sm mt-0.5">{status}</p>
          </div>
          <div className="p-3">
            <span className="text-xs text-slate-400 font-medium">Proctoring Flags</span>
            <p className={`text-lg font-extrabold ${violationsCount > 0 ? "text-amber-400" : "text-emerald-400"} mt-0.5`}>
              {violationsCount} Flags
            </p>
          </div>
          <div className="p-3">
            <span className="text-xs text-slate-400 font-medium">Review Status</span>
            <p className="text-xs sm:text-sm font-extrabold text-indigo-300 mt-0.5">
              {allowDetailedReview ? "Answer Review Available" : "Under Faculty Review"}
            </p>
          </div>
        </div>
      </div>

      {/* Time & Schedule Information */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 shadow-xl p-5 text-white">
        <div className="flex items-center space-x-2.5 pb-3 mb-4 border-b border-slate-800">
          <div className="p-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-xl">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Timing & Submission Telemetry</h3>
            <p className="text-xs text-slate-400">Official timeline recorded by the proctoring server</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-750">
            <span className="text-xs text-slate-400 font-medium block">Start Time</span>
            <p className="text-sm sm:text-base font-bold text-white mt-0.5">{startTimeStr}</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-750">
            <span className="text-xs text-slate-400 font-medium block">Submit Time</span>
            <p className="text-sm sm:text-base font-bold text-white mt-0.5">{submitTimeStr}</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-750">
            <span className="text-xs text-slate-400 font-medium block">Time Taken</span>
            <p className="text-sm sm:text-base font-bold text-indigo-300 mt-0.5">{timeTakenStr}</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-750">
            <span className="text-xs text-slate-400 font-medium block">Duration Limit</span>
            <p className="text-sm sm:text-base font-bold text-slate-200 mt-0.5">{examDurationStr}</p>
          </div>
        </div>
      </div>

      {/* AI Proctoring Summary */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 shadow-xl p-6 text-white">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl border ${violationsCount > 0 ? "bg-amber-500/20 text-amber-400 border-amber-500/40" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">AI Proctoring Summary</h2>
              <p className="text-xs text-slate-400">Live WebCam, tab switching, and audio security inspection</p>
            </div>
          </div>
          <button
            onClick={() => setShowProctoringModal(true)}
            className="text-xs font-bold text-indigo-300 hover:text-white bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 px-3.5 py-1.5 rounded-xl transition cursor-pointer print:hidden"
          >
            Inspect Audit Log
          </button>
        </div>

        {/* 5 Proctoring Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-750 flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Face Detection
            </span>
            <span className="font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
              {faceMissingCount > 0 ? `${faceMissingCount} Interrupted` : "Normal"}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-750 flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-300 font-medium">
              <span className={`w-2.5 h-2.5 rounded-full ${multipleFaceCount > 0 ? "bg-amber-400" : "bg-emerald-400"}`}></span> Multiple Face
            </span>
            <span className={`font-bold px-2 py-0.5 rounded border ${multipleFaceCount > 0 ? "text-amber-300 bg-amber-500/20 border-amber-500/40" : "text-emerald-300 bg-emerald-500/20 border-emerald-500/40"}`}>
              {multipleFaceCount > 0 ? `${multipleFaceCount} Detected` : "Not Detected"}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-750 flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-300 font-medium">
              <span className={`w-2.5 h-2.5 rounded-full ${tabSwitchCount > 0 ? "bg-amber-400" : "bg-emerald-400"}`}></span> Tab Switching
            </span>
            <span className={`font-bold px-2 py-0.5 rounded border ${tabSwitchCount > 0 ? "text-amber-300 bg-amber-500/20 border-amber-500/40" : "text-emerald-300 bg-emerald-500/20 border-emerald-500/40"}`}>
              {tabSwitchCount}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-750 flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-300 font-medium">
              <span className={`w-2.5 h-2.5 rounded-full ${faceMissingCount > 0 ? "bg-amber-400" : "bg-emerald-400"}`}></span> Face Missing
            </span>
            <span className={`font-bold px-2 py-0.5 rounded border ${faceMissingCount > 0 ? "text-amber-300 bg-amber-500/20 border-amber-500/40" : "text-emerald-300 bg-emerald-500/20 border-emerald-500/40"}`}>
              {faceMissingCount}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-750 flex items-center justify-between sm:col-span-2 md:col-span-2">
            <span className="flex items-center gap-2 text-slate-300 font-medium">
              <span className={`w-2.5 h-2.5 rounded-full ${suspiciousAudioCount > 0 ? "bg-amber-400" : "bg-emerald-400"}`}></span> Suspicious Activity / Audio
            </span>
            <span className={`font-bold px-2 py-0.5 rounded border ${suspiciousAudioCount > 0 ? "text-amber-300 bg-amber-500/20 border-amber-500/40" : "text-emerald-300 bg-emerald-500/20 border-emerald-500/40"}`}>
              {suspiciousAudioCount}
            </span>
          </div>
        </div>

        {/* Overall Status Banner */}
        <div className={`mt-4 p-3.5 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center gap-2.5 ${
          violationsCount === 0
            ? "bg-emerald-950/40 border-emerald-800 text-emerald-200"
            : "bg-amber-950/40 border-amber-800 text-amber-200"
        }`}>
          {violationsCount === 0 ? (
            <>
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Overall: <strong>No Violations Detected</strong> (Candidate test session verified clean ✓)</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Overall: <strong>{violationsCount} Anomaly Event(s) Detected</strong> (Submitted for faculty invigilator review)</span>
            </>
          )}
        </div>
      </div>

      {/* Detailed Question Review */}
      <div className="space-y-6 mb-10">
        <h2 className="text-xl font-bold text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>Question-by-Question Review</span>
          {!allowDetailedReview && (
            <span className="text-xs font-normal text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full">
              Answer key will be released once all students complete the exam
            </span>
          )}
        </h2>

        {questions && questions.map((q: any, idx: number) => {
          const isCorrect = q.isCorrect;
          const studentChoiceText = q.studentChoice ? `${q.studentChoice}. ${q[`option${q.studentChoice}`]}` : "Not Answered";
          const correctOptionText = q.correctOption ? `${q.correctOption}. ${q[`option${q.correctOption}`]}` : "Hidden until release";

          return (
            <div
              key={q.id}
              className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 shadow-xl p-6 space-y-4 text-white"
            >
              {/* Question Header & Score Tag */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Question #{idx + 1}
                </span>
                <div>
                  {isCorrect ? (
                    <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-500/40">
                      <Check className="w-3.5 h-3.5" /> Correct (+{q.marks} pts)
                    </span>
                  ) : (
                    <span className="bg-rose-500/20 text-rose-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-rose-500/40">
                      <X className="w-3.5 h-3.5" /> Incorrect (+0 pts)
                    </span>
                  )}
                </div>
              </div>

              {/* Question Prompt */}
              <p className="font-bold text-white text-base leading-relaxed">{q.prompt}</p>

              {/* High-Visibility Answer Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Your Answer */}
                <div className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-1 ${
                  isCorrect
                    ? "bg-emerald-950/40 border-emerald-800 text-emerald-200"
                    : "bg-rose-950/40 border-rose-800 text-rose-200"
                }`}>
                  <span className="text-[11px] uppercase tracking-wider font-extrabold block text-slate-400">
                    Your Answer:
                  </span>
                  <p className="font-bold text-white leading-snug">
                    {studentChoiceText}
                  </p>
                </div>

                {/* Correct Answer */}
                <div className="p-4 rounded-2xl border border-emerald-800/80 bg-emerald-950/40 text-emerald-200 text-xs sm:text-sm space-y-1">
                  <span className="text-[11px] uppercase tracking-wider font-extrabold block text-emerald-400">
                    Correct Answer:
                  </span>
                  <p className="font-bold text-emerald-300 leading-snug">
                    {allowDetailedReview ? correctOptionText : "Hidden until faculty releases answer key"}
                  </p>
                </div>
              </div>

              {/* MCQ Options Breakdown Palette */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs sm:text-sm">
                {(["A", "B", "C", "D"] as const).map((opt) => {
                  const optText = q[`option${opt}`];
                  const isStudentChoice = q.studentChoice === opt;
                  const isAnswerKey = q.correctOption === opt;

                  let borderClass = "border-slate-700 bg-slate-800/60 text-slate-300";
                  if (allowDetailedReview && isAnswerKey) {
                    borderClass = "border-emerald-500 bg-emerald-950/50 text-emerald-200 font-bold ring-1 ring-emerald-500/50";
                  } else if (isStudentChoice && !isCorrect) {
                    borderClass = "border-rose-500/60 bg-rose-950/40 text-rose-200 font-medium";
                  }

                  return (
                    <div
                      key={opt}
                      className={`p-3 rounded-xl border flex items-center justify-between ${borderClass}`}
                    >
                      <span className="flex items-center gap-2">
                        <strong className="w-5">{opt}.</strong>
                        <span>{optText}</span>
                      </span>
                      {isStudentChoice && (
                        <span className="text-[10px] font-bold uppercase bg-slate-700 text-slate-200 px-2 py-0.5 rounded-md">
                          Your Choice
                        </span>
                      )}
                      {allowDetailedReview && isAnswerKey && (
                        <span className="text-[10px] font-bold uppercase bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-md">
                          Correct Key
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation Note */}
              {allowDetailedReview && q.explanation && (
                <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-2xl p-4 text-xs text-indigo-200 mt-2">
                  <strong className="text-indigo-300 block mb-1">Explanation & Concept:</strong>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Action Buttons */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden text-white">
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
        >
          <Download className="w-4 h-4" /> Download Result
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowProctoringModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm px-5 py-3 rounded-2xl border border-slate-700 transition cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" /> View Proctoring Report
          </button>

          <Link
            to="/student/history"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm px-6 py-3 rounded-2xl border border-slate-700 shadow-sm transition"
          >
            Back to Results
          </Link>
        </div>
      </div>

      {/* Proctoring Report Modal */}
      {showProctoringModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 max-w-2xl w-full overflow-hidden text-white">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 text-white border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-600 rounded-xl text-white">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">AI Proctoring Incident & Telemetry Report</h3>
                  <p className="text-xs text-slate-400">Exam: {exam.title} • Attempt #{(attemptId || "").slice(0, 8)}</p>
                </div>
              </div>
              <button
                onClick={() => setShowProctoringModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5 text-white">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 bg-slate-800/60 border border-slate-750 rounded-2xl">
                  <span className="text-slate-400 block">Tab Switch Flags</span>
                  <strong className="text-base text-white mt-1 block">{tabSwitchCount}</strong>
                </div>
                <div className="p-3 bg-slate-800/60 border border-slate-750 rounded-2xl">
                  <span className="text-slate-400 block">Face Absence</span>
                  <strong className="text-base text-white mt-1 block">{faceMissingCount}</strong>
                </div>
                <div className="p-3 bg-slate-800/60 border border-slate-750 rounded-2xl">
                  <span className="text-slate-400 block">Multiple Faces</span>
                  <strong className="text-base text-white mt-1 block">{multipleFaceCount}</strong>
                </div>
                <div className="p-3 bg-slate-800/60 border border-slate-750 rounded-2xl">
                  <span className="text-slate-400 block">Audio Flags</span>
                  <strong className="text-base text-white mt-1 block">{suspiciousAudioCount}</strong>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Session Incident Audit Trail
                </h4>
                {violations.length === 0 ? (
                  <div className="p-6 bg-emerald-950/40 border border-emerald-800 rounded-2xl text-center">
                    <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <h5 className="text-sm font-bold text-white">Clean Proctoring Session</h5>
                    <p className="text-xs text-emerald-300 mt-1">
                      No anti-cheating violations or camera interruptions were recorded during this examination.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {violations.map((v: any, index: number) => (
                      <div
                        key={v.id || index}
                        className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-2xl text-xs flex items-start justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] uppercase">
                              {v.type}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              {new Date(v.timestamp || startedAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-slate-300 font-medium mt-1">{v.description || "Suspicious anomaly detected"}</p>
                        </div>
                        <span className="text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2 py-1 rounded border border-amber-500/40 shrink-0">
                          {v.reviewed ? "Reviewed" : "Logged"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowProctoringModal(false)}
                className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition cursor-pointer shadow-md shadow-indigo-600/30"
              >
                Close Audit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};