import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { adminApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { User } from "../../types";
import {
  Users,
  Trash2,
  Edit2,
  Shield,
  GraduationCap,
  Briefcase,
  Search,
  ArrowLeft,
  BookOpen,
  Database,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  Save,
} from "lucide-react";

export const UserManagementPage: React.FC = () => {
  const { user: currentUser, updateCurrentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeRole = searchParams.get("role") || "";

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Edit User State
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editEmail, setEditEmail] = useState<string>("");
  const [editClassGroup, setEditClassGroup] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers();
      setAllUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openEditModal = (u: any) => {
    setEditingUser(u);
    setEditName(u.name || "");
    setEditEmail(u.email || "");
    setEditClassGroup(u.classGroup || "");
    setFeedback(null);
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setSaving(false);
    setFeedback(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editName.trim()) {
      setFeedback({ type: "error", message: "Name cannot be empty" });
      return;
    }
    if (!editEmail.trim()) {
      setFeedback({ type: "error", message: "Email cannot be empty" });
      return;
    }

    try {
      setSaving(true);
      setFeedback(null);
      const res = await adminApi.updateUser(editingUser.id, {
        name: editName.trim(),
        email: editEmail.trim().toLowerCase(),
        classGroup: editClassGroup.trim(),
      });

      // Update current user context if editing currently logged in admin/user
      if (currentUser && currentUser.id === editingUser.id) {
        updateCurrentUser({
          ...currentUser,
          name: res.user.name,
          email: res.user.email,
          classGroup: res.user.classGroup,
        });
      }

      setFeedback({ type: "success", message: "User updated successfully!" });
      await loadUsers();
      setTimeout(() => {
        closeEditModal();
      }, 700);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to update user profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove user "${name}"?`)) return;
    try {
      await adminApi.deleteUser(id);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete user.");
    }
  };

  const handleTabChange = (role: string) => {
    if (role) {
      setSearchParams({ role });
    } else {
      setSearchParams({});
    }
  };

  const studentCount = allUsers.filter((u) => u.role === "STUDENT").length;
  const facultyCount = allUsers.filter((u) => u.role === "FACULTY").length;
  const adminCount = allUsers.filter((u) => u.role === "ADMIN").length;

  const roleFilteredUsers = activeRole
    ? allUsers.filter((u) => u.role === activeRole)
    : allUsers;

  const filteredUsers = roleFilteredUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.classGroup && u.classGroup.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/admin"
        className="text-xs text-indigo-400 font-semibold hover:underline flex items-center gap-1 mb-3"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            User Directory Management
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Dedicated oversight for registered students, faculty instructors, and administrators.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, email, class..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-700 rounded-xl text-xs bg-slate-900/90 text-white placeholder:text-slate-400 font-medium focus:ring-2 focus:ring-indigo-500 outline-none w-64 shadow-xl transition"
          />
        </div>
      </div>

      {/* Segmented Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-800 pb-3">
        <button
          onClick={() => handleTabChange("")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeRole === ""
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          All Registered Users
          <span
            className={`px-1.5 py-0.2 rounded-md text-[10px] ${
              activeRole === "" ? "bg-indigo-700 text-white" : "bg-slate-700 text-slate-300"
            }`}
          >
            {allUsers.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("STUDENT")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeRole === "STUDENT"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
          Students
          <span
            className={`px-1.5 py-0.2 rounded-md text-[10px] ${
              activeRole === "STUDENT" ? "bg-indigo-700 text-white" : "bg-slate-700 text-slate-300"
            }`}
          >
            {studentCount}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("FACULTY")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeRole === "FACULTY"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-blue-400" />
          Faculty Instructors
          <span
            className={`px-1.5 py-0.2 rounded-md text-[10px] ${
              activeRole === "FACULTY" ? "bg-indigo-700 text-white" : "bg-slate-700 text-slate-300"
            }`}
          >
            {facultyCount}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("ADMIN")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeRole === "ADMIN"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700"
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-purple-400" />
          Administrators
          <span
            className={`px-1.5 py-0.2 rounded-md text-[10px] ${
              activeRole === "ADMIN" ? "bg-indigo-700 text-white" : "bg-slate-700 text-slate-300"
            }`}
          >
            {adminCount}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading directory records...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-12 text-center text-slate-400">
          No users found matching the selected filter.
        </div>
      ) : (
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/90 text-slate-300 uppercase text-[11px] font-bold border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Class / Department</th>
                  {activeRole === "STUDENT" && <th className="px-6 py-4">Exam Attempts</th>}
                  {activeRole === "FACULTY" && (
                    <>
                      <th className="px-6 py-4">Scheduled Exams</th>
                      <th className="px-6 py-4">Question Banks</th>
                    </>
                  )}
                  {(!activeRole || activeRole === "ADMIN") && <th className="px-6 py-4">Activity Summary</th>}
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/60 transition duration-150">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-sm tracking-tight">{u.name}</div>
                      <div className="text-xs text-cyan-400 font-mono font-medium tracking-wide mt-0.5 select-all">
                        {u.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          u.role === "ADMIN"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : u.role === "FACULTY"
                            ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {u.role === "STUDENT" && <GraduationCap className="w-3 h-3" />}
                        {u.role === "FACULTY" && <Briefcase className="w-3 h-3" />}
                        {u.role === "ADMIN" && <Shield className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-300">
                      <span className="bg-slate-800/80 border border-slate-700/80 px-2.5 py-1 rounded-md text-slate-200">
                        {u.classGroup || "General"}
                      </span>
                    </td>

                    {/* Student Specific Column */}
                    {activeRole === "STUDENT" && (
                      <td className="px-6 py-4 font-semibold text-xs">
                        <span className="inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-lg">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {u.attemptsCount || 0} attempts
                        </span>
                      </td>
                    )}

                    {/* Faculty Specific Columns */}
                    {activeRole === "FACULTY" && (
                      <>
                        <td className="px-6 py-4 text-xs font-semibold">
                          <span className="inline-flex items-center gap-1 bg-blue-500/15 border border-blue-500/30 text-blue-300 px-2.5 py-1 rounded-lg">
                            <Calendar className="w-3.5 h-3.5" />
                            {u.examsCreatedCount || 0} exams scheduled
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold">
                          <span className="inline-flex items-center gap-1 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 px-2.5 py-1 rounded-lg">
                            <Database className="w-3.5 h-3.5" />
                            {u.qbCreatedCount || 0} question banks
                          </span>
                        </td>
                      </>
                    )}

                    {/* All / Admin View */}
                    {(!activeRole || activeRole === "ADMIN") && (
                      <td className="px-6 py-4 text-xs text-slate-300 font-medium">
                        {u.role === "STUDENT"
                          ? `${u.attemptsCount || 0} tests taken`
                          : u.role === "FACULTY"
                          ? `${u.examsCreatedCount || 0} exams / ${u.qbCreatedCount || 0} banks`
                          : "Full platform permissions"}
                      </td>
                    )}

                    <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(u)}
                          className="text-slate-400 hover:text-cyan-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                          title="Edit User Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {u.role !== "ADMIN" && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                            title="Remove user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Edit {editingUser.role === "ADMIN" ? "Admin" : "User"} Details
                  </h3>
                  <p className="text-xs text-slate-400">
                    Update profile name, email, or department.
                  </p>
                </div>
              </div>
              <button
                onClick={closeEditModal}
                disabled={saving}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedback && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  feedback.type === "success"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-red-500/20 text-red-300 border border-red-500/30"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name / Display Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. System Administrator"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-medium text-white placeholder:text-slate-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="admin@exam.com"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-medium text-cyan-300 placeholder:text-slate-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Department / Class Group
                </label>
                <input
                  type="text"
                  list="dept-options"
                  value={editClassGroup}
                  onChange={(e) => setEditClassGroup(e.target.value)}
                  placeholder="e.g. Computer Science, Information Technology, etc."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-medium text-white placeholder:text-slate-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
                <datalist id="dept-options">
                  <option value="Computer Science" />
                  <option value="Information Technology" />
                  <option value="Management Studies" />
                  <option value="Computer Applications" />
                </datalist>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={saving}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};