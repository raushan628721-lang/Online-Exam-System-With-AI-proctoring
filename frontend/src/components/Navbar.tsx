import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShieldAlert,
  LogOut,
  GraduationCap,
  School,
  ShieldCheck,
  Settings,
  X,
  CheckCircle2,
  Sliders,
  Bell,
  Lock,
  Palette,
  Check,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);
  const [showThemeMenu, setShowThemeMenu] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<string>("navy");

  useEffect(() => {
    const saved = localStorage.getItem("app_theme") || "navy";
    setCurrentTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const handleSelectTheme = (themeName: string) => {
    setCurrentTheme(themeName);
    localStorage.setItem("app_theme", themeName);
    document.documentElement.setAttribute("data-theme", themeName);
    setShowThemeMenu(false);
  };

  // Settings State
  const [examLockdown, setExamLockdown] = useState<boolean>(true);
  const [faceDetectionSensitivity, setFaceDetectionSensitivity] = useState<string>("HIGH");
  const [audioMonitoring, setAudioMonitoring] = useState<boolean>(true);
  const [autoPassThreshold, setAutoPassThreshold] = useState<number>(40);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSwitchRole = (targetRole: "STUDENT" | "FACULTY" | "ADMIN") => {
    if (user.role === targetRole) {
      if (targetRole === "ADMIN") navigate("/admin");
      else if (targetRole === "FACULTY") navigate("/faculty");
      else navigate("/student");
    } else {
      logout();
      navigate(`/login?role=${targetRole}`);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaved(true);
    setTimeout(() => {
      setSettingsSaved(false);
      setShowSettingsModal(false);
    }, 1200);
  };

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[4.25rem] py-2 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: University Branding */}
          <div className="flex items-center space-x-3.5">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30 group-hover:scale-105 transition">
                <School className="w-5 h-5 text-indigo-100" />
              </div>
              <div className="flex flex-col">
                <span className="tracking-wide text-white font-extrabold text-base sm:text-lg leading-tight uppercase group-hover:text-indigo-200 transition">
                  Pondicherry University
                </span>
                <span className="text-[11px] sm:text-xs text-indigo-300/90 font-medium tracking-tight">
                  Online Examination & AI Proctoring System
                </span>
              </div>
            </Link>
          </div>

          {/* Center/Nav Menu */}
          <nav className="flex items-center flex-wrap gap-1 text-xs sm:text-sm font-medium">
            {user.role === "STUDENT" && (
              <>
                <Link
                  to="/student"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    location.pathname === "/student" ? "bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Available Exams
                </Link>
                <Link
                  to="/student/history"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    location.pathname === "/student/history" ? "bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Results & History
                </Link>
              </>
            )}

            {user.role === "FACULTY" && (
              <>
                <Link
                  to="/faculty"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    location.pathname === "/faculty" ? "bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Overview
                </Link>
                <Link
                  to="/faculty/question-banks"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    location.pathname.startsWith("/faculty/question-banks") ? "bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Question Banks
                </Link>
                <Link
                  to="/faculty/schedule"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    location.pathname === "/faculty/schedule" ? "bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Schedule Exam
                </Link>
                <Link
                  to="/faculty/violations"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    location.pathname === "/faculty/violations" ? "bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Proctoring Flags
                </Link>
              </>
            )}

            {user.role === "ADMIN" && (
              <>
                <Link
                  to="/admin"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    location.pathname === "/admin" ? "bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Overview
                </Link>
                <Link
                  to="/admin/users"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    location.pathname === "/admin/users" ? "bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Users
                </Link>
                <Link
                  to="/admin/exams"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    location.pathname === "/admin/exams" ? "bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Examinations
                </Link>
                <Link
                  to="/admin/reports"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    location.pathname === "/admin/reports" ? "bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Results
                </Link>
                <Link
                  to="/admin/violations"
                  className={`px-3 py-1.5 rounded-lg transition ${
                    location.pathname === "/admin/violations" ? "bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  AI Proctoring
                </Link>
                <Link
                  to="/admin/reports"
                  className={`px-3 py-1.5 rounded-lg transition text-slate-300 hover:bg-slate-800`}
                >
                  Reports
                </Link>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="px-3 py-1.5 rounded-lg transition text-slate-300 hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  Settings
                </button>
              </>
            )}
          </nav>

          {/* Right: Switch Portal & Profile */}
          <div className="flex items-center space-x-3 self-end md:self-auto">
            {/* Professional Theme Selector */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-xs text-slate-200 hover:text-white hover:border-indigo-500/50 transition cursor-pointer shadow-sm"
                title="Change Background Style & Theme"
              >
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline font-medium">Theme:</span>
                <span className="capitalize font-bold text-indigo-300">{currentTheme}</span>
              </button>

              {showThemeMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Select Background Style
                  </div>
                  <button
                    onClick={() => handleSelectTheme("navy")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      currentTheme === "navy"
                        ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-600 shadow-sm shadow-blue-500/50" />
                      <span>🌌 Executive Navy Dark</span>
                    </div>
                    {currentTheme === "navy" && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>

                  <button
                    onClick={() => handleSelectTheme("obsidian")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer mt-1 ${
                      currentTheme === "obsidian"
                        ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-slate-950 border border-slate-700 shadow-sm" />
                      <span>⚡ Obsidian Cyber Dark</span>
                    </div>
                    {currentTheme === "obsidian" && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>

                  <button
                    onClick={() => handleSelectTheme("slate")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer mt-1 ${
                      currentTheme === "slate"
                        ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-400 shadow-sm" />
                      <span>🏛️ Slate Modern Light</span>
                    </div>
                    {currentTheme === "slate" && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                </div>
              )}
            </div>

            {/* Portal Role Switcher */}
            <div className="hidden xl:flex items-center bg-slate-800/90 rounded-lg p-1 border border-slate-700 text-xs">
              <span className="text-slate-400 px-2 font-medium">Switch Portal:</span>
              <button
                onClick={() => handleSwitchRole("STUDENT")}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  user.role === "STUDENT" ? "bg-indigo-600 text-white font-semibold shadow-sm" : "text-slate-300 hover:text-white"
                }`}
                title="Switch to Student Portal"
              >
                Student
              </button>
              <button
                onClick={() => handleSwitchRole("FACULTY")}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  user.role === "FACULTY" ? "bg-indigo-600 text-white font-semibold shadow-sm" : "text-slate-300 hover:text-white"
                }`}
                title="Switch to Faculty Portal"
              >
                Faculty
              </button>
              <button
                onClick={() => handleSwitchRole("ADMIN")}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  user.role === "ADMIN" ? "bg-indigo-600 text-white font-semibold shadow-sm" : "text-slate-300 hover:text-white"
                }`}
                title="Switch to Admin Portal"
              >
                Admin
              </button>
            </div>

            {/* Profile badge */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-700">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-white leading-tight">
                  {user.role === "ADMIN" ? "University Administrator" : user.name}
                </span>
                <span className="text-[10px] text-indigo-400 uppercase tracking-wider font-extrabold">
                  {user.role === "ADMIN" ? "ADMINISTRATION" : user.role} {user.role !== "ADMIN" && user.classGroup ? `• ${user.classGroup}` : ""}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-600 rounded-lg text-white">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">System Settings</h3>
                  <p className="text-xs text-slate-400">Pondicherry University Examination Controls</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="p-6 space-y-5 text-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  University / Institute Name
                </label>
                <input
                  type="text"
                  disabled
                  value="Pondicherry University"
                  className="w-full px-3.5 py-2 text-sm bg-slate-100 border border-slate-300 rounded-xl text-slate-700 font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  AI Proctoring Sensitivity Level
                </label>
                <select
                  value={faceDetectionSensitivity}
                  onChange={(e) => setFaceDetectionSensitivity(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="MAXIMUM">Maximum (Zero Tolerance for Tab Switch / Face Loss)</option>
                  <option value="HIGH">High (Flag after 3 sec absence)</option>
                  <option value="STANDARD">Standard (Flag after 5 sec absence)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Enforce Fullscreen Lockdown</h4>
                  <p className="text-xs text-slate-500">Auto-prompt fullscreen and record exits as security violations</p>
                </div>
                <input
                  type="checkbox"
                  checked={examLockdown}
                  onChange={(e) => setExamLockdown(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Audio Noise & Speech Telemetry</h4>
                  <p className="text-xs text-slate-500">Monitor suspicious ambient noise during proctored tests</p>
                </div>
                <input
                  type="checkbox"
                  checked={audioMonitoring}
                  onChange={(e) => setAudioMonitoring(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Default Minimum Passing Percentage
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="30"
                    max="60"
                    step="5"
                    value={autoPassThreshold}
                    onChange={(e) => setAutoPassThreshold(Number(e.target.value))}
                    className="flex-1 accent-indigo-600 cursor-pointer"
                  />
                  <span className="font-extrabold text-sm text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                    {autoPassThreshold}%
                  </span>
                </div>
              </div>

              {settingsSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  System preferences updated successfully.
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/25 transition cursor-pointer"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};