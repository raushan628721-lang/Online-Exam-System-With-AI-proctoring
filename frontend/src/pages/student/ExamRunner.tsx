import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { examApi } from "../../services/api";
import { Exam, Question } from "../../types";
import { ProctoringMonitor } from "../../components/ProctoringMonitor";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Maximize,
  ShieldCheck,
} from "lucide-react";

export const ExamRunner: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptId, setAttemptId] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>("");

  const timerRef = useRef<any>(null);

  // Initialize Exam Session
  useEffect(() => {
    if (!examId) return;

    const initExam = async () => {
      try {
        const data = await examApi.startExam(examId);
        setExam(data.exam);
        setQuestions(data.questions);
        setAttemptId(data.attemptId);
        setAnswers(data.answers || {});

        // Calculate Remaining Time from startedAt and duration
        const startTime = new Date(data.startedAt).getTime();
        const durationMs = data.exam.durationMinutes * 60 * 1000;
        const elapsedMs = Date.now() - startTime;
        const remainingSeconds = Math.max(0, Math.floor((durationMs - elapsedMs) / 1000));

        setTimeLeftSeconds(remainingSeconds);

        // Prompt fullscreen
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } catch (err: any) {
        console.error("Failed to start exam:", err);
        alert(err.response?.data?.message || "Could not start exam session.");
        navigate("/student");
      } finally {
        setLoading(false);
      }
    };

    initExam();
  }, [examId]);

  // Countdown Timer with Auto-Submit
  useEffect(() => {
    if (timeLeftSeconds <= 0 && !loading && attemptId) {
      // Time is up! Trigger auto-submit
      handleFinalSubmit(true);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeftSeconds, loading, attemptId]);

  // Select Option and Auto-Save to Database
  const handleSelectOption = async (optionKey: string) => {
    if (!currentQuestion || !attemptId) return;

    const updatedAnswers = { ...answers, [currentQuestion.id]: optionKey };
    setAnswers(updatedAnswers);
    setSaveStatus("Saving...");

    try {
      await examApi.saveAnswer(attemptId, currentQuestion.id, optionKey);
      setSaveStatus("Saved to database");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (e) {
      setSaveStatus("Error saving answer");
    }
  };

  // Submit Exam
  const handleFinalSubmit = async (auto: boolean = false) => {
    if (isSubmitting || !attemptId) return;
    setIsSubmitting(true);

    try {
      const res = await examApi.submitExam(attemptId);
      if (auto) {
        alert("Time has expired! Your exam was automatically submitted.");
      }
      navigate(`/student/result/${attemptId}`);
    } catch (err: any) {
      console.error("Submission failed:", err);
      alert("Error submitting exam: " + (err.response?.data?.message || err.message));
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-slate-800">Preparing Secure Examination Session</h2>
          <p className="text-slate-500 text-sm mt-1">Configuring timer and proctoring telemetry...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isLowTime = timeLeftSeconds < 120; // less than 2 minutes

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Fixed Exam Banner */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div>
          <h1 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {exam?.title}
          </h1>
          <span className="text-xs text-slate-500 font-medium">
            Question {currentIndex + 1} of {questions.length} • Total Marks: {exam?.totalMarks}
          </span>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-base sm:text-lg font-bold border transition ${
              isLowTime
                ? "bg-red-50 text-red-600 border-red-300 animate-pulse"
                : "bg-indigo-50 text-indigo-700 border-indigo-200"
            }`}
          >
            <Clock className="w-5 h-5" />
            <span>{formatTimer(timeLeftSeconds)}</span>
          </div>

          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition active:scale-95"
          >
            <Send className="w-4 h-4" /> Submit Exam
          </button>
        </div>
      </header>

      {/* Main Runner Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Question Area (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {currentQuestion ? (
            <div>
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <span className="bg-indigo-50 text-indigo-700 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                  Question #{currentIndex + 1}
                </span>
                <div className="flex items-center gap-3">
                  {saveStatus && (
                    <span className="text-xs text-slate-400 font-medium italic">{saveStatus}</span>
                  )}
                  <span className="text-xs font-semibold text-slate-500">
                    Worth: <strong className="text-slate-900">{currentQuestion.marks} Marks</strong>
                  </span>
                </div>
              </div>

              {/* Question Prompt */}
              <div className="text-slate-900 font-semibold text-lg sm:text-xl leading-relaxed mb-8">
                {currentQuestion.prompt}
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-3.5">
                {(["A", "B", "C", "D"] as const).map((optKey) => {
                  const optField = `option${optKey}` as keyof Question;
                  const optText = currentQuestion[optField] as string;
                  const isSelected = answers[currentQuestion.id] === optKey;

                  return (
                    <label
                      key={optKey}
                      onClick={() => handleSelectOption(optKey)}
                      className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition select-none ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/70 shadow-sm shadow-indigo-100"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0 transition ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {optKey}
                      </div>
                      <span className="text-slate-800 text-sm sm:text-base font-medium flex-1">
                        {optText}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">No question selected.</div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-8">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
                currentIndex === 0
                  ? "text-slate-400 bg-slate-100 cursor-not-allowed"
                  : "text-slate-700 bg-slate-100 hover:bg-slate-200"
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <div className="text-xs text-slate-500 font-medium">
              {answeredCount} of {questions.length} answered
            </div>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition"
              >
                Review & Submit <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: AI Proctoring & Question Palette (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Proctoring Widget */}
          {attemptId && exam && (
            <ProctoringMonitor attemptId={attemptId} examId={exam.id} />
          )}

          {/* Question Palette Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Question Palette</span>
              <span className="text-xs font-normal text-slate-500">
                {answeredCount}/{questions.length} Attempted
              </span>
            </h3>

            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = idx === currentIndex;

                let colorClasses = "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200";
                if (isAnswered) {
                  colorClasses = "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/30";
                }
                if (isCurrent) {
                  colorClasses = "ring-2 ring-indigo-600 font-bold border-indigo-600 " + (isAnswered ? "bg-emerald-600 text-white" : "bg-indigo-50 text-indigo-700");
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl border text-xs font-semibold flex items-center justify-center transition ${colorClasses}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-around text-[11px] text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-600"></span> Answered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300"></span> Unanswered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full ring-2 ring-indigo-600 bg-indigo-50"></span> Current
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Submit Examination?</h3>
            <p className="text-sm text-slate-600 mb-4">
              You have answered <strong className="text-indigo-600">{answeredCount}</strong> out of{" "}
              <strong>{questions.length}</strong> questions. Once submitted, answers cannot be edited.
            </p>

            {answeredCount < questions.length && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  You still have {questions.length - answeredCount} unanswered questions. Are you sure you want to finish now?
                </span>
              </div>
            )}

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Back to Exam
              </button>
              <button
                onClick={() => handleFinalSubmit(false)}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
              >
                {isSubmitting ? "Grading..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};