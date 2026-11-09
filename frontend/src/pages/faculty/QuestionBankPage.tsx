import React, { useEffect, useState } from "react";
import { facultyApi } from "../../services/api";
import { QuestionBank, Question } from "../../types";
import {
  Database,
  Plus,
  Trash2,
  Edit2,
  BookOpen,
  CheckCircle,
  HelpCircle,
  ArrowLeft,
  Upload,
  Layers,
  Sparkles,
  Check,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { Link } from "react-router-dom";

export const QuestionBankPage: React.FC = () => {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New Bank Modal State
  const [showBankModal, setShowBankModal] = useState<boolean>(false);
  const [bankTitle, setBankTitle] = useState<string>("");
  const [bankSubject, setBankSubject] = useState<string>("");

  // Import Modal State
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>("");
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  // New/Edit Question Modal State
  const [showQModal, setShowQModal] = useState<boolean>(false);
  const [editingQId, setEditingQId] = useState<string | null>(null);
  const [qForm, setQForm] = useState({
    prompt: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "A" as "A" | "B" | "C" | "D",
    marks: 5,
    difficulty: "MEDIUM" as "EASY" | "MEDIUM" | "HARD",
    explanation: "",
  });

  const loadBanks = async () => {
    try {
      const data = await facultyApi.getQuestionBanks();
      setBanks(data);
      if (data.length > 0 && !selectedBankId) {
        setSelectedBankId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (bankId: string) => {
    try {
      const data = await facultyApi.getQuestions({ questionBankId: bankId });
      setQuestions(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadBanks();
  }, []);

  useEffect(() => {
    if (selectedBankId) {
      loadQuestions(selectedBankId);
    }
  }, [selectedBankId]);

  const selectedBank = banks.find((b) => b.id === selectedBankId);

  const handleCreateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankTitle || !bankSubject) return;
    const created = await facultyApi.createQuestionBank({ title: bankTitle, subject: bankSubject });
    setBankTitle("");
    setBankSubject("");
    setShowBankModal(false);
    await loadBanks();
    setSelectedBankId(created.id);
  };

  const handleDeleteBank = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question bank and its questions?")) return;
    await facultyApi.deleteQuestionBank(id);
    setSelectedBankId(null);
    loadBanks();
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBankId) return;

    if (editingQId) {
      await facultyApi.updateQuestion(editingQId, qForm);
    } else {
      await facultyApi.addQuestion({ ...qForm, questionBankId: selectedBankId });
    }

    setShowQModal(false);
    setEditingQId(null);
    setQForm({
      prompt: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "A",
      marks: 5,
      difficulty: "MEDIUM",
      explanation: "",
    });
    loadQuestions(selectedBankId);
  };

  const handleEditQuestion = (q: any) => {
    setEditingQId(q.id);
    setQForm({
      prompt: q.prompt,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctOption: q.correctOption,
      marks: q.marks || 5,
      difficulty: getQuestionDifficulty(q),
      explanation: q.explanation || "",
    });
    setShowQModal(true);
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    await facultyApi.deleteQuestion(id);
    if (selectedBankId) loadQuestions(selectedBankId);
  };

  const handleImportQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBankId) return;

    try {
      const parsed = JSON.parse(importJsonText);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          await facultyApi.addQuestion({
            questionBankId: selectedBankId,
            prompt: item.prompt || "Imported Question",
            optionA: item.optionA || "Option A",
            optionB: item.optionB || "Option B",
            optionC: item.optionC || "Option C",
            optionD: item.optionD || "Option D",
            correctOption: item.correctOption || "A",
            marks: item.marks || 5,
            explanation: item.explanation || "",
          });
        }
      }
      setImportSuccess(true);
      setTimeout(() => {
        setImportSuccess(false);
        setShowImportModal(false);
        setImportJsonText("");
        loadQuestions(selectedBankId);
      }, 1000);
    } catch (err) {
      alert("Invalid JSON format. Please paste a valid JSON array of questions.");
    }
  };

  // Real Difficulty determination helper
  const getQuestionDifficulty = (q: any): "EASY" | "MEDIUM" | "HARD" => {
    if (q.difficulty) {
      const d = String(q.difficulty).toUpperCase();
      if (d === "EASY" || d === "MEDIUM" || d === "HARD") return d;
    }
    // Dynamic fallback based on marks if difficulty was not explicitly tagged
    if (q.marks && q.marks <= 2) return "EASY";
    if (q.marks && q.marks >= 10) return "HARD";
    return "MEDIUM";
  };

  // Exact Difficulty counts calculation from active questions
  const easyCount = questions.filter((q) => getQuestionDifficulty(q) === "EASY").length;
  const mediumCount = questions.filter((q) => getQuestionDifficulty(q) === "MEDIUM").length;
  const hardCount = questions.filter((q) => getQuestionDifficulty(q) === "HARD").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to="/faculty" className="text-xs text-indigo-400 font-bold hover:underline flex items-center gap-1">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Faculty Dashboard
      </Link>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <Database className="w-6 h-6" />
            </div>
            Curated Question Banks
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Manage reusable subject-wise MCQ repositories, difficulty tags, and bulk question imports.
          </p>
        </div>

        <button
          onClick={() => setShowBankModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create New Bank
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Question Bank Selector Sidebar */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 p-5 shadow-xl space-y-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Available Banks ({banks.length})
          </h2>

          <div className="space-y-2">
            {banks.map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedBankId(b.id)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between group ${
                  selectedBankId === b.id
                    ? "bg-indigo-600/30 border-indigo-500/50 text-white shadow-md shadow-indigo-500/10"
                    : "bg-slate-800/60 border-slate-750 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div>
                  <h3 className="font-bold text-sm leading-tight">{b.title}</h3>
                  <span className="text-[11px] text-slate-400 font-medium">Subject: {b.subject}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBank(b.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-400 rounded-lg transition cursor-pointer"
                  title="Delete Bank"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Selected Bank Details & Questions */}
        <div className="lg:col-span-3 space-y-6">
          {selectedBank ? (
            <>
              {/* Question Bank Header Card */}
              <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 text-white shadow-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 px-2.5 py-1 rounded-md border border-indigo-500/30 inline-block">
                      Subject: {selectedBank.subject}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
                      {selectedBank.title}
                    </h2>
                    <p className="text-slate-300 text-xs mt-1">
                      Total Questions: <strong className="text-white">{questions.length} Active MCQs</strong>
                    </p>
                  </div>

                  {/* Action Buttons: + Add Question and + Import Questions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="inline-flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-bold px-3.5 py-2 rounded-xl text-xs border border-slate-700 transition cursor-pointer shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-400" /> + Import Questions
                    </button>
                    <button
                      onClick={() => {
                        setEditingQId(null);
                        setQForm({
                          prompt: "",
                          optionA: "",
                          optionB: "",
                          optionC: "",
                          optionD: "",
                          correctOption: "A",
                          marks: 5,
                          difficulty: "MEDIUM",
                          explanation: "",
                        });
                        setShowQModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> + Add Question
                    </button>
                  </div>
                </div>

                {/* Difficulty Breakdown (Accurate Real Counts) */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Difficulty Breakdown:</span>
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Easy: {easyCount}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Medium: {mediumCount}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-rose-500/15 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full font-bold">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    Hard: {hardCount}
                  </span>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const diff = getQuestionDifficulty(q);
                  return (
                    <div
                      key={q.id}
                      className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4 hover:border-indigo-500/50 transition"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-400 uppercase">
                            Question #{idx + 1}
                          </span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                            diff === "HARD"
                              ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                              : diff === "EASY"
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          }`}>
                            {diff}
                          </span>
                          <span className="text-xs font-bold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded">
                            +{q.marks || 5} pts
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditQuestion(q)}
                            className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                            title="Edit Question"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                            title="Delete Question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="font-bold text-white text-sm leading-relaxed">{q.prompt}</p>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {(["A", "B", "C", "D"] as const).map((opt) => {
                          const isCorrect = q.correctOption === opt;
                          return (
                            <div
                              key={opt}
                              className={`p-3 rounded-xl border flex items-center justify-between ${
                                isCorrect
                                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-bold"
                                  : "bg-slate-800/60 border-slate-700/60 text-slate-300"
                              }`}
                            >
                              <span>
                                <strong className={isCorrect ? "text-emerald-400" : "text-white"}>{opt}.</strong> {q[`option${opt}`]}
                              </span>
                              {isCorrect && (
                                <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                                  Correct Key
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-xl p-3 text-xs text-indigo-300">
                          <strong className="text-indigo-200">Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-slate-900/70 backdrop-blur-md rounded-3xl border border-slate-800">
              Select or create a question bank from the left panel.
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Question Modal */}
      {showQModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingQId ? "Edit Question" : "Add New MCQ Question"}
              </h3>
              <button
                onClick={() => setShowQModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-slate-800 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Question Prompt</label>
                <textarea
                  required
                  rows={3}
                  value={qForm.prompt}
                  onChange={(e) => setQForm({ ...qForm, prompt: e.target.value })}
                  placeholder="Enter the question text here..."
                  className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Option A</label>
                  <input
                    required
                    type="text"
                    value={qForm.optionA}
                    onChange={(e) => setQForm({ ...qForm, optionA: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Option B</label>
                  <input
                    required
                    type="text"
                    value={qForm.optionB}
                    onChange={(e) => setQForm({ ...qForm, optionB: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Option C</label>
                  <input
                    required
                    type="text"
                    value={qForm.optionC}
                    onChange={(e) => setQForm({ ...qForm, optionC: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Option D</label>
                  <input
                    required
                    type="text"
                    value={qForm.optionD}
                    onChange={(e) => setQForm({ ...qForm, optionD: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Correct Answer</label>
                  <select
                    value={qForm.correctOption}
                    onChange={(e: any) => setQForm({ ...qForm, correctOption: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-emerald-700 bg-white"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Difficulty</label>
                  <select
                    value={qForm.difficulty}
                    onChange={(e: any) => setQForm({ ...qForm, difficulty: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold bg-white"
                  >
                    <option value="EASY">🟢 Easy</option>
                    <option value="MEDIUM">🟡 Medium</option>
                    <option value="HARD">🔴 Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Marks</label>
                  <input
                    type="number"
                    min="1"
                    value={qForm.marks}
                    onChange={(e) => setQForm({ ...qForm, marks: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Explanation</label>
                <input
                  type="text"
                  value={qForm.explanation}
                  onChange={(e) => setQForm({ ...qForm, explanation: e.target.value })}
                  placeholder="Optional concept explanation for students..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Questions Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" /> Bulk Import Questions (JSON)
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleImportQuestions} className="space-y-4 text-xs">
              <p className="text-slate-500">
                Paste an array of questions in JSON format with fields: <code>prompt</code>, <code>optionA</code>, <code>optionB</code>, <code>optionC</code>, <code>optionD</code>, <code>correctOption</code>.
              </p>

              <textarea
                rows={8}
                required
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='[
  {
    "prompt": "What does SQL stand for?",
    "optionA": "Structured Query Language",
    "optionB": "Sequential Question Language",
    "optionC": "Simple Query Logic",
    "optionD": "System Query Link",
    "correctOption": "A",
    "marks": 5
  }
]'
                className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              />

              {importSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 font-bold rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> Questions imported successfully!
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Import Questions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Question Bank Modal */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Create Question Bank</h3>
              <button
                onClick={() => setShowBankModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBank} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Bank Title</label>
                <input
                  type="text"
                  required
                  value={bankTitle}
                  onChange={(e) => setBankTitle(e.target.value)}
                  placeholder="e.g., Database Management Systems QB"
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={bankSubject}
                  onChange={(e) => setBankSubject(e.target.value)}
                  placeholder="e.g., DBMS / Computer Science"
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Create Bank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};