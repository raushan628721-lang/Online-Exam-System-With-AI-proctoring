import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ShieldAlert, UserPlus, Eye, EyeOff, School } from "lucide-react";
import { Role } from "../../types";

export const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Management Studies",
  "Computer Applications",
];

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roleParam = searchParams.get("role")?.toUpperCase();
  const initialRole: Role = roleParam === "FACULTY" ? "FACULTY" : "STUDENT";

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [role, setRole] = useState<Role>(initialRole);
  const [classGroup, setClassGroup] = useState<string>(
    initialRole === "STUDENT" ? "CS-2026-A" : "Computer Science"
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (roleParam === "FACULTY" || roleParam === "STUDENT") {
      setRole(roleParam as Role);
      if (roleParam === "FACULTY") {
        setClassGroup("Computer Science");
      } else {
        setClassGroup("CS-2026-A");
      }
    }
  }, [roleParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const user = await register({
        name,
        email,
        password,
        role,
        classGroup: role === "STUDENT" ? classGroup : classGroup || "Faculty Department",
      });

      if (user.role === "FACULTY") navigate("/faculty");
      else navigate("/student");
    } catch (err: any) {
      // Show the exact message from the server if available
      const serverMsg = err.response?.data?.message;
      setError(serverMsg || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 mx-auto mb-3 border border-indigo-400/30">
          <School className="w-8 h-8 text-indigo-100" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
          Pondicherry University
        </h2>
        <p className="mt-1 text-xs text-indigo-300 font-medium">
          Online Examination & AI Proctoring System
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Create candidate or faculty account
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl text-white">
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl flex items-start gap-2">
              <span className="text-red-400 mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="alex@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
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
                  className="w-full px-4 py-2.5 pr-11 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Account Role
                </label>
                <select
                  value={role}
                  onChange={(e) => {
                    const newRole = e.target.value as Role;
                    setRole(newRole);
                    if (newRole === "FACULTY") {
                      setClassGroup("Computer Science");
                    } else {
                      setClassGroup("CS-2026-A");
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                >
                  <option value="STUDENT">Student</option>
                  <option value="FACULTY">Faculty Member</option>
                </select>
              </div>

              {role === "STUDENT" ? (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Class / Batch
                  </label>
                  <select
                    value={classGroup}
                    onChange={(e) => setClassGroup(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="CS-2026-A">CS-2026-A</option>
                    <option value="CS-2026-B">CS-2026-B</option>
                    <option value="IT-2026">IT-2026</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={classGroup}
                    onChange={(e) => setClassGroup(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" /> {loading ? "Creating..." : "Complete Registration"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link to={`/login?role=${role}`} className="font-bold text-indigo-400 hover:underline">
              Sign In to {role === "FACULTY" ? "Faculty" : "Student"} Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};