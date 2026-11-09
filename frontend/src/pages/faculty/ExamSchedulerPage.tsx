import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { facultyApi } from "../../services/api";
import { QuestionBank, Question } from "../../types";
import { Calendar, Clock, Award, ArrowLeft, CheckSquare, Square, CheckCircle2 } from "lucide-react";

export const ExamSchedulerPage: React.FC = () => {
  const navigate = useNavigate();
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQIds, setSelectedQIds] = useState<string[]>([]);

  // Form Fields
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [passingMarks, setPassingMarks] = useState<number>(40);
  const [targetClass, setTargetClass] = useState<string>("CS-2026-A");
  const [startTime, setStartTime] = useState<string>(new Date().toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState<string>(
    new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16)
  );

  useEffect(() => {
    const loadBanks = async () => {
      try {
        const data = await facultyApi.getQuestionBanks();
        setBanks(data);
        if (data.length > 0) {
          setSelectedBankId(data[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadBanks();
  }, []);

  useEffect(() => {
    if (selectedBankId) {
      facultyApi.getQuestions({ questionBankId: selectedBankId }).then((qList) => {
        setAvailableQuestions(qList);
        // default select all
        setSelectedQIds(qList.map((q) => q.id));
      });
    }
  }, [selectedBankId]);

  const toggleSelectQuestion = (id: string) => {
    if (selectedQIds.includes(id)) {
      setSelectedQIds(selectedQIds.filter((qid) => qid !== id));
    } else {
      setSelectedQIds([...selectedQIds, id]);
    }
  };

  const calculatedTotalMarks = availableQuestions
    .filter((q) => selectedQIds.includes(q.id))
    .reduce((acc, curr) => acc + curr.marks, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert("Exam title is required");
    if (selectedQIds.length === 0) return alert("Please select at least one question for this exam");

    try {
      await facultyApi.createExam({
        title,
        description,
        durationMinutes,
        totalMarks: calculatedTotalMarks || 100,
        passingMarks,
        targetClass,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        isPublished: true,
        selectedQuestionIds: selectedQIds,
      });

      alert("Exam successfully scheduled and published for students!");
      navigate("/faculty");
    } catch (err: any) {
      console.error(err);
      alert("Failed to schedule exam.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Link to="/faculty" className="text-xs text-indigo-400 font-bold hover:underline flex items-center gap-1">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Faculty Dashboard
      </Link>

      <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 text-white">
        <div className="border-b border-slate-800 pb-4 mb-6">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <Calendar className="w-6 h-6" />
            </div>
            Schedule New Examination
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Configure examination rules, assign to target batch/class, and pull questions from your question bank.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title & Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Exam Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Final Assessment: Software Architecture"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800/90 text-white placeholder:text-slate-400 border border-slate-700 rounded-xl text-sm font-medium focus:border-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Description & Instructions</label>
              <textarea
                rows={2}
                placeholder="Instructions for students (e.g. Closed book, WebCam required, strict tab limits)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800/90 text-white placeholder:text-slate-400 border border-slate-700 rounded-xl text-sm font-medium focus:border-indigo-500 outline-none transition"
              />
            </div>
          </div>

          {/* Timing & Marks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-750">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Duration (Minutes)</label>
              <input
                type="number"
                min={5}
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-700 rounded-xl text-sm font-medium focus:border-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Target Class / Batch</label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-700 rounded-xl text-sm font-semibold focus:border-indigo-500 outline-none transition cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900 text-white">All Classes (General)</option>
                <option value="CS-2026-A" className="bg-slate-900 text-white">CS-2026-A (Computer Science)</option>
                <option value="CS-2026-B" className="bg-slate-900 text-white">CS-2026-B (Software Eng)</option>
                <option value="IT-2026" className="bg-slate-900 text-white">IT-2026 (Info Tech)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Passing Marks</label>
              <input
                type="number"
                min={1}
                required
                value={passingMarks}
                onChange={(e) => setPassingMarks(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-700 rounded-xl text-sm font-medium focus:border-indigo-500 outline-none transition"
              />
            </div>
          </div>

          {/* Availability Window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Start Window</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/90 text-white border border-slate-700 rounded-xl text-sm font-medium focus:border-indigo-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">End Window</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/90 text-white border border-slate-700 rounded-xl text-sm font-medium focus:border-indigo-500 outline-none transition"
              />
            </div>
          </div>

          {/* Question Bank Selection & Questions Picker */}
          <div className="border-t border-slate-800 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Select Questions from Bank</h3>
                <p className="text-xs text-slate-400">Pick questions to include in this exam.</p>
              </div>

              {banks.length > 0 && (
                <select
                  value={selectedBankId}
                  onChange={(e) => setSelectedBankId(e.target.value)}
                  className="px-3 py-1.5 border border-slate-700 rounded-xl text-xs font-semibold bg-slate-800 text-white outline-none cursor-pointer"
                >
                  {banks.map((b) => (
                    <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                      {b.title} ({b.subject})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {availableQuestions.length === 0 ? (
              <div className="bg-slate-800/40 border border-slate-750 p-6 rounded-2xl text-center text-sm text-slate-400">
                No questions found in this question bank. Please add questions in Question Banks first.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {availableQuestions.map((q) => {
                  const isChecked = selectedQIds.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      onClick={() => toggleSelectQuestion(q.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between text-xs sm:text-sm transition select-none ${
                        isChecked
                          ? "bg-indigo-600/30 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                          : "bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-500 flex-shrink-0" />
                        )}
                        <span className="font-medium text-white line-clamp-1">{q.prompt}</span>
                      </div>
                      <span className="font-bold text-indigo-300 flex-shrink-0 ml-3">+{q.marks} pts</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Total Marks & Question Count Summary */}
            <div className="mt-4 p-4 bg-indigo-950/40 border border-indigo-800/60 rounded-2xl flex items-center justify-between text-xs font-semibold text-indigo-200">
              <span>Selected: <strong className="text-white">{selectedQIds.length}</strong> Questions</span>
              <span>Calculated Total Marks: <strong className="text-base text-emerald-400">{calculatedTotalMarks}</strong> pts</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => navigate("/faculty")}
              className="px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              Schedule & Publish Exam
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};