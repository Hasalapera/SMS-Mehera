import React, { useState, useEffect } from "react";
import api from "../../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import {
  UserCog,
  Search,
  Plus,
  Save,
  X,
  MessageSquarePlus,
  CheckCircle2,
  AlertCircle,
  UserCheck,
} from "lucide-react";
import { toast } from "react-hot-toast";

const AddUserBehavior = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedUserId, setExpandedUserId] = useState(null);

  // Form state for adding behavior
  const [formData, setFormData] = useState({
    behavior: "Good",
    note: "",
    status: "active", // new, active, inactive
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users/all-users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Exclude admins and managers from the behavior evaluation list
        const staffUsers = (res.data.users || []).filter(
          (u) => u.role !== 'admin' && u.role !== 'manager'
        );
        setUsers(staffUsers);
      } catch (err) {
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAddClick = (user) => {
    if (expandedUserId === user.user_id) {
      setExpandedUserId(null);
    } else {
      setExpandedUserId(user.user_id);
      setFormData({
        behavior: "Good",
        note: "",
        status: user.is_active ? "active" : "inactive",
      });
    }
  };

  const handleSubmit = async (userId) => {
    setSubmitting(true);
    try {
      await api.post(`/users/behavior/${userId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(`Updated performance for staff member!`);

      // Clear note after success
      setFormData((prev) => ({ ...prev, note: "" }));
      setExpandedUserId(null);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Something went wrong while saving",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full mx-auto p-6 md:p-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-10 border-b border-border pb-6">
        <div className="p-4 bg-white text-primary rounded-2xl shadow-lg border border-border">
          <UserCog size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-primary">
            User Behavior Management
          </h1>
          <p className="text-[10px] text-textMain/50 font-bold uppercase tracking-widest">
            Monitor and record staff activity
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[2rem] p-4 mb-8 shadow-sm">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-textMain/50" size={18} />
          </div>
          <input
            type="text"
            placeholder="Search staff by name or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card/50 rounded-xl py-3 pl-11 pr-4 text-sm outline-none border border-transparent focus:border-primary/30 transition-all"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/5 text-textMain border-b border-border">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">
                Staff Member
              </th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">
                System Role
              </th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td
                  colSpan="3"
                  className="p-10 text-center text-textMain/50 font-bold text-xs uppercase"
                >
                  Loading staff directory...
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <React.Fragment key={u.user_id}>
                  <tr
                    className={`hover:bg-primary/5 transition-colors ${expandedUserId === u.user_id ? "bg-primary/5" : ""}`}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <span className="text-sm font-black text-textMain uppercase">
                          {u.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-bold px-3 py-1 bg-black/5 rounded-lg border border-border uppercase">
                        {u.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => handleAddClick(u)}
                        className="inline-flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-primary transition-all shadow-lg shadow-primary/10"
                      >
                        {expandedUserId === u.user_id ? (
                          <X size={14} />
                        ) : (
                          <Plus size={14} />
                        )}
                        {expandedUserId === u.user_id
                          ? "Cancel"
                          : "Add Behavior"}
                      </button>
                    </td>
                  </tr>

                  {expandedUserId === u.user_id && (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-8 py-8 bg-primary/5 border-l-4 border-primary animate-in slide-in-from-top-2 duration-300"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-textMain/50 tracking-widest flex items-center gap-2">
                              <AlertCircle size={14} className="text-primary" />{" "}
                              Select Behavior Category
                            </label>
                            <select
                              value={formData.behavior}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  behavior: e.target.value,
                                })
                              }
                              className="w-full bg-background border border-border rounded-xl p-3 text-sm outline-none focus:border-primary transition-all font-bold"
                            >
                              <option value="Excellent">
                                Excellent Performance
                              </option>
                              <option value="Good">Good / Standard</option>
                              <option value="Average">
                                Average / Maintenance
                              </option>
                              <option value="Poor">
                                Poor / Follow-up Needed
                              </option>
                              <option value="Warning">
                                Official Warning Issued
                              </option>
                            </select>

                            <label className="text-[10px] font-black uppercase text-textMain/50 tracking-widest flex items-center gap-2 pt-2">
                              <UserCheck size={14} className="text-primary" />{" "}
                              Staff Current Status
                            </label>
                            <div className="flex gap-4">
                              {["new", "active", "inactive"].map((s) => (
                                <label
                                  key={s}
                                  className="flex items-center gap-2 cursor-pointer group"
                                >
                                  <input
                                    type="radio"
                                    name="status"
                                    checked={formData.status === s}
                                    onChange={() =>
                                      setFormData({ ...formData, status: s })
                                    }
                                    className="accent-primary w-4 h-4"
                                  />
                                  <span className="text-[10px] font-black uppercase text-textMain group-hover:text-primary transition-colors">
                                    {s} User
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-textMain/50 tracking-widest flex items-center gap-2">
                              <MessageSquarePlus
                                size={14}
                                className="text-primary"
                              />{" "}
                              Behavior Notes & Observations
                            </label>
                            <textarea
                              rows={4}
                              value={formData.note}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  note: e.target.value,
                                })
                              }
                              placeholder="Describe the behavior or incident in detail..."
                              className="w-full bg-background border border-border rounded-xl p-4 text-sm outline-none focus:border-primary transition-all resize-none"
                            />
                            <button
                              onClick={() => handleSubmit(u.user_id)}
                              disabled={submitting}
                              className="w-full bg-primary text-black py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-primary transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Save size={16} />{" "}
                              {submitting ? "Saving..." : "Save Behavior Entry"}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddUserBehavior;
