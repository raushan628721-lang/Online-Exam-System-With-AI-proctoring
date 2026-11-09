import React, { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  ShieldAlert,
  LogIn,
  GraduationCap,
  School,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { Role } from "../../types";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const roleParam = (searchParams.get("role") || "STUDENT").toUpperCase() as Role;
  const [selectedRole, setSelectedRole] = useState<Role>(
    roleParam === "FACULTY" || roleParam === "ADMIN" ? roleParam : "STUDENT"
  );

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Sync role param with tab state
  useEffect(() => {
    if (roleParam && ["STUDENT", "FACULTY", "ADMIN"].includes(roleParam)) {
      setSelectedRole(roleParam);
    }
  }, [roleParam]);

  const handleRoleTabChange = (role: Role) => {
    setSelectedRole(role);
    setSearchParams({ role });
    setError(null);
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email.trim(), password);
      // Verify role matches or navigate to respective dashboard
      if (user.role === "ADMIN") {
        navigate("/admin");
      } else if (user.role === "FACULTY") {
        navigate("/faculty");
      } else {
        navigate("/student");
      }
    } catch (err: unknown) {
      if (isAxiosError<{ message?: string }>(err)) {
        setError(
          err.response?.data?.message ||
            (err.response
              ? "Unable to sign in. Please check your account details and try again."
              : "Cannot reach the server. Make sure the backend is running, then try again.")
        );
      } else {
        setError("An unexpected error occurred while signing in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleMeta = () => {
    switch (selectedRole) {
      case "FACULTY":
        return {
          title: "Faculty Member Portal",
          desc: "Manage Question Banks, Schedule Exams & Review Live Proctoring",
          icon: <School className="w-5 h-5 text-blue-400" />,
          accent: "text-blue-400",
          border: "border-blue-500",
          demoEmail: "faculty@exam.com",
        };
      case "ADMIN":
        return {
          title: "Master Administration Portal",
          desc: "Platform Oversight, User Management, Reports & Audit Center",
          icon: <ShieldCheck className="w-5 h-5 text-purple-400" />,
          accent: "text-purple-400",
          border: "border-purple-500",
          demoEmail: "admin@exam.com",
        };
      default:
        return {
          title: "Student Examination Portal",
          desc: "Take Proctored Exams, Review History & View Scorecards",
          icon: <GraduationCap className="w-5 h-5 text-indigo-400" />,
          accent: "text-indigo-400",
          border: "border-indigo-500",
          demoEmail: "student@exam.com",
        };
    }
  };

  const meta = getRoleMeta();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 mx-auto mb-3 border border-indigo-400/30">
          <School className="w-8 h-8 text-indigo-100" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
          Pondicherry University
        </h2>
        <p className="mt-1.5 text-xs text-indigo-300 font-medium">
          Online Examination & AI Proctoring System
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900 border border-slate-800 py-7 px-6 sm:px-9 shadow-2xl rounded-3xl text-white">
          {/* Role Portal Selector Tabs */}
          <div className="mb-6">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2">
              Select Portal Role
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-800/90 rounded-2xl border border-slate-700">
              <button
                type="button"
                onClick={() => handleRoleTabChange("STUDENT")}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition ${
                  selectedRole === "STUDENT"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <GraduationCap className="w-4 h-4" /> Student
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange("FACULTY")}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition ${
                  selectedRole === "FACULTY"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <School className="w-4 h-4" /> Faculty
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange("ADMIN")}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition ${
                  selectedRole === "ADMIN"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> Admin
              </button>
            </div>
          </div>

          {/* Role Header Banner */}
          <div className="mb-5 pb-4 border-b border-slate-800 text-center">
            <div className="flex items-center justify-center gap-2 font-bold text-base text-white">
              {meta.icon}
              <span>{meta.title}</span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">{meta.desc}</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl flex items-start gap-2">
              <span className="text-red-400 font-bold">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Email Address
              </label>

              {selectedRole === "FACULTY" && (
                <div className="mb-3 space-y-1.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Select Teacher Account:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setEmail("krishnapriya@gmail.com");
                        setPassword("faculty123");
                      }}
                      className="text-left p-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-200 transition"
                    >
                      <strong className="block text-[11px] text-white">DR G KRISHNAPRIYA</strong>
                      <span className="text-[10px] text-indigo-300">2 Exams • 2 QBs</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEmail("faculty@exam.com");
                        setPassword("faculty123");
                      }}
                      className="text-left p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 transition"
                    >
                      <strong className="block text-[11px] text-white">Prof. Sarah Connor</strong>
                      <span className="text-[10px] text-slate-400">1 Exam • 2 QBs</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEmail("jayalakshmi@gmail.com");
                        setPassword("faculty123");
                      }}
                      className="text-left p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 transition"
                    >
                      <strong className="block text-[11px] text-white">Dr. S L JAYALAKSHMI</strong>
                      <span className="text-[10px] text-slate-400">1 Exam • 1 QB</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEmail("sunitha@gmail.com");
                        setPassword("faculty123");
                      }}
                      className="text-left p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 transition"
                    >
                      <strong className="block text-[11px] text-white">SUNITHA R.</strong>
                      <span className="text-[10px] text-slate-400">1 Exam • 1 QB</span>
                    </button>
                  </div>
                </div>
              )}

              <input
                type="email"
                required
                placeholder={meta.demoEmail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-11 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" /> {loading ? "Authenticating..." : `Sign In as ${selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase()}`}
            </button>
          </form>

          {/* Registration / Account Creation Footer */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            {selectedRole === "STUDENT" && (
              <p className="text-xs text-slate-400">
                New candidate?{" "}
                <Link to="/register?role=STUDENT" className="font-bold text-indigo-400 hover:underline inline-flex items-center gap-1">
                  <UserPlus className="w-3.5 h-3.5" /> Create Student Account
                </Link>
              </p>
            )}

            {selectedRole === "FACULTY" && (
              <p className="text-xs text-slate-400">
                New faculty member?{" "}
                <Link to="/register?role=FACULTY" className="font-bold text-blue-400 hover:underline inline-flex items-center gap-1">
                  <UserPlus className="w-3.5 h-3.5" /> Register Faculty Account
                </Link>
              </p>
            )}

            {selectedRole === "ADMIN" && (
              <p className="text-[11px] text-slate-500">
                Administrative portal requires authorized institutional credentials.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};