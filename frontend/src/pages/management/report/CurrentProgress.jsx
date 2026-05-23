import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../../api/axiosInstance";
import {
  Target,
  TrendingUp,
  Award,
  Loader2,
  Users,
  Sliders,
  X,
  MapPin,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-hot-toast";

const CurrentProgress = () => {
  const { user } = useAuth(); // ලොග් වෙලා ඉන්න යූසර්ව ගත්තා
  const token = localStorage.getItem("accessToken");
  const userRole = user?.role || "sales_rep";

  // 📝 States
  const [salesReps, setSalesReps] = useState([]);
  const [selectedRepId, setSelectedRepId] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // Default: "2026-05"

  // Progress States
  const [progressData, setProgressData] = useState({
    target: 0,
    achieved: 0,
    saloons: 0,
  });
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingReps, setLoadingReps] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCustomers, setModalCustomers] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);

  // 📡 1. ඇඩ්මින්/මැනේජර් නම් විතරක් ඩ්‍රොප්ඩවුන් එකට සේල්ස් රෙප්ලා ලිස්ට් එක ඇදීම
  useEffect(() => {
    if (userRole === "admin" || userRole === "manager") {
      const fetchSalesReps = async () => {
        try {
          setLoadingReps(true);
          const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
          const res = await api.get("/users/all-users", config);
          const allUsers = res.data?.users || [];
          setSalesReps(allUsers.filter((u) => u.role === "sales_rep"));
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingReps(false);
        }
      };
      fetchSalesReps();
    } else {
      // 🔒 සේල්ස් රෙප් කෙනෙක් නම්, එයාගේ ID එක කෙළින්ම ලොක් කරනවා
      setSelectedRepId(user?.user_id);
    }
  }, [userRole, user, token]);

  // 📡 2. තෝරාගත් රෙප්ගේ Live Target සහ Sales Progress ඇදීම
  useEffect(() => {
    const fetchLiveProgress = async () => {
      if (!selectedRepId || !month) return;

      try {
        setLoadingMetrics(true);
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};
        const res = await api.get(
          `/salesTarget/rep-summary?sales_rep_id=${selectedRepId}&month=${month}`,
          config,
        );

        if (res.data?.success && res.data?.data) {
          const d = res.data.data;
          setProgressData({
            target: d.adjusted_target_amount || 0,
            achieved: d.live_achieved_amount || 0,
            saloons: d.active_customer_count || 0,
          });
        } else {
          setProgressData({ target: 0, achieved: 0, saloons: 0 });
        }
      } catch (err) {
        console.error(err);
        setProgressData({ target: 0, achieved: 0, saloons: 0 });
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchLiveProgress();
  }, [selectedRepId, month, token]);

  // 📐 Math Calculations
  const progressPercentage =
    progressData.target > 0
      ? Math.min((progressData.achieved / progressData.target) * 100, 100)
      : 0;
  const deficitAmount = Math.max(
    progressData.target - progressData.achieved,
    0,
  );

  // 🤵 Customer list එක අදින function එක
  const handleShowCustomers = async () => {
    if (!selectedRepId) return;

    setIsModalOpen(true);
    setLoadingModal(true);
    try {
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      const res = await api.get(`/customers/by-rep/${selectedRepId}`, config);
      setModalCustomers(res.data.customers || []);
    } catch (err) {
      console.error("Failed to fetch customers for rep:", err);
      toast.error("Could not load customer list.");
      setIsModalOpen(false); // Close modal on error
    } finally {
      setLoadingModal(false);
    }
  };

  return (
    <div className="p-6 animate-in fade-in duration-500 max-w-5xl mx-auto w-full">
      {/* Header Panel */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-textMain transition-colors duration-300 flex items-center gap-3">
          <div className="p-2 bg-primary transition-all duration-300 rounded-lg text-textMain transition-colors duration-300">
            <TrendingUp size={24} />
          </div>
          Live Sales Performance Tracker
        </h2>
        <p className="text-textMain/50 transition-colors duration-300 text-sm mt-1 ml-12">
          {userRole === "admin" || userRole === "manager"
            ? "Monitor real-time quota metrics and territorial distribution tracking loops."
            : "Review your personal monthly quota achievements and targeted salon registers."}
        </p>
      </div>

      {/* Control Filters Layer */}
      <div className="bg-card transition-colors duration-300 border border-border transition-colors duration-300 rounded-[2rem] shadow-sm p-8 md:p-12 mb-8 flex flex-col md:flex-row gap-8 md:items-end">
        {/* Month Picker */}
        <div className="flex-1 w-full space-y-2">
          <label className="text-xs font-bold text-textMain/50 transition-colors duration-300 uppercase ml-1">
            Target Month
          </label>
          <div className="relative group">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              onClick={(e) => e.target.showPicker()}
              className="w-full bg-background border border-border text-textMain rounded-xl py-3 pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:dark:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
            />
            <Calendar
              className="absolute left-4 top-1/2 -translate-y-1/2 text-textMain/50 transition-colors duration-300 group-focus-within:text-primary transition-all duration-300 pointer-events-none"
              size={18}
            />
          </div>
        </div>

        {/* 🎯 Dropdown Filter (Visible ONLY to Admin or Manager) */}
        {(userRole === "admin" || userRole === "manager") && (
          <div className="flex-1 w-full space-y-2">
            <label className="text-xs font-bold text-textMain/50 transition-colors duration-300 uppercase ml-1">
              Select Representative
            </label>
            <div className="relative group">
              <select
                value={selectedRepId}
                onChange={(e) => setSelectedRepId(e.target.value)}
                disabled={loadingReps}
                className="w-full bg-background border border-border text-textMain rounded-xl py-3 pl-11 pr-10 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer transition-all disabled:opacity-50"
              >
                <option value="">-- Choose a Representative --</option>
                {salesReps.map((rep) => (
                  <option key={rep.user_id} value={rep.user_id}>
                    {rep.name}
                  </option>
                ))}
              </select>
              <Users
                className="absolute left-4 top-1/2 -translate-y-1/2 text-textMain/50 transition-colors duration-300 group-focus-within:text-primary transition-all duration-300 pointer-events-none"
                size={18}
              />
              <ChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-textMain/50 transition-colors duration-300 pointer-events-none transition-colors duration-300"
                size={18}
              />
            </div>
          </div>
        )}
      </div>

      {/* Analytics Gauge Display Panel */}
      {!selectedRepId ? (
        <div className="p-8 md:p-12 border border-dashed border-border transition-colors duration-300 rounded-[2rem] text-center text-textMain/40 transition-colors duration-300 font-bold uppercase text-sm tracking-widest bg-card/10">
          📢 Please choose a sales agent from the filter registry above.
        </div>
      ) : loadingMetrics ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-4 bg-card transition-colors duration-300 border border-border transition-colors duration-300 rounded-[2rem]">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-sm text-textMain/50 transition-colors duration-300 font-bold uppercase tracking-widest">
            Compiling Live Registry Metrics...
          </p>
        </div>
      ) : (
        <div className="bg-card transition-colors duration-300 border border-border transition-colors duration-300 rounded-[2rem] shadow-sm p-8 md:p-12 space-y-8 w-full overflow-hidden">
          {/* Card Metrics Grid Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[1.5rem] md:gap-[2rem] border-b border-border transition-colors duration-300 pb-[1.5rem] md:pb-[2rem]">
            {/* 1. Allocation Quota */}
            <div className="space-y-[0.25rem]">
              <p className="text-[0.625rem] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest flex items-center gap-[0.5rem] whitespace-nowrap">
                <Target
                  size={14}
                  className="text-primary transition-all duration-300 shrink-0"
                />{" "}
                Allocation Quota
              </p>
              {/* 💡 FIX: text-[1.125rem] md:text-[1.25rem] (18px - 20px) වලින් අගය ගාණට පොඩි කළා */}
              <p className="text-[1.125rem] md:text-[1.25rem] font-bold text-textMain transition-colors duration-300 break-words leading-tight">
                Rs. {progressData.target.toLocaleString()}
              </p>
            </div>

            {/* 2. Audited Sales */}
            <div className="space-y-[0.25rem]">
              <p className="text-[0.625rem] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest flex items-center gap-[0.5rem] whitespace-nowrap">
                <TrendingUp size={14} className="text-emerald-500 shrink-0" />{" "}
                Audited Sales
              </p>
              <p className="text-[1.125rem] md:text-[1.25rem] font-bold text-emerald-500 transition-colors duration-300 break-words leading-tight">
                Rs. {progressData.achieved.toLocaleString()}
              </p>
            </div>

            {/* 3. Remaining Deficit */}
            <div className="space-y-[0.25rem]">
              <p className="text-[0.625rem] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest flex items-center gap-[0.5rem] whitespace-nowrap">
                <Award
                  size={14}
                  className="text-primary transition-all duration-300 shrink-0"
                />{" "}
                Remaining Deficit
              </p>
              <p
                className={`text-[1.125rem] md:text-[1.25rem] font-bold break-words leading-tight transition-colors duration-300 ${deficitAmount === 0 ? "text-primary" : "text-textMain/50"}`}
              >
                {deficitAmount === 0
                  ? "Target Achieved!"
                  : `Rs. ${deficitAmount.toLocaleString()}`}
              </p>
            </div>
          </div>

          {/* Progress Bar Gauge */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-textMain/50 transition-colors duration-300 uppercase tracking-widest">
                  Target Progress
                </span>
                {progressData.saloons > 0 && (
                  <button
                    onClick={handleShowCustomers}
                    className="flex items-center gap-2 bg-background transition-colors duration-300 px-4 py-2 rounded-xl border border-border transition-colors duration-300 text-xs font-bold text-textMain/60 transition-colors duration-300 hover:text-primary hover:border-primary transition-all shadow-sm"
                  >
                    <Users size={14} className="shrink-0" />
                    <span>{progressData.saloons} Active Customers</span>
                  </button>
                )}
              </div>
              <span className="text-4xl md:text-5xl font-black text-primary transition-all duration-300 tracking-tighter sm:text-right leading-none">
                {progressPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-background border border-border h-4 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className="bg-gradient-to-r from-primary/70 to-primary h-full transition-all duration-700 ease-out rounded-full shadow-[0_0_10px_rgba(180,164,96,0.3)]"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Customer List Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden animate-in fade-in duration-300"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-card transition-colors duration-300 w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300 border border-border transition-colors duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 md:p-8 border-b border-border transition-colors duration-300 bg-background transition-colors duration-300 flex justify-between items-center gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="p-3 bg-primary/10 transition-all duration-300 rounded-xl text-primary shrink-0">
                  <Users size={24} />
                </div>
                <div className="truncate">
                  <h3 className="text-lg md:text-xl font-bold uppercase text-textMain transition-colors duration-300 tracking-tight truncate">
                    Active Customer Portfolio
                  </h3>
                  <p className="text-xs font-bold text-textMain/50 transition-colors duration-300 uppercase tracking-widest mt-1 truncate">
                    Rep:{" "}
                    {salesReps.find((r) => r.user_id === selectedRepId)?.name ||
                      user.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-card transition-colors duration-300 border border-border transition-colors duration-300 rounded-full text-textMain/50 transition-colors duration-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar bg-card transition-colors duration-300 flex-1">
              {loadingModal ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="animate-spin text-primary" size={40} />
                  <p className="text-sm text-textMain/50 transition-colors duration-300 font-bold uppercase tracking-widest">
                    Loading Portfolio...
                  </p>
                </div>
              ) : modalCustomers.length > 0 ? (
                <div className="space-y-4">
                  {modalCustomers.map((customer) => (
                    <div
                      key={customer.customer_id}
                      className="p-5 bg-background transition-colors duration-300 border border-border transition-colors duration-300 rounded-2xl hover:border-primary/30 transition-all duration-300"
                    >
                      <p className="font-bold text-base text-textMain transition-colors duration-300">
                        {customer.saloon_name}
                      </p>
                      <p className="text-xs text-textMain/60 transition-colors duration-300 font-bold mt-1.5 flex items-center gap-2 uppercase tracking-widest">
                        <MapPin
                          size={14}
                          className="text-primary transition-all duration-300 shrink-0"
                        />
                        {`${customer.lane1 || ""}${customer.lane2 ? `, ${customer.lane2}` : ""}, ${customer.district || ""}`}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-textMain/40 transition-colors duration-300 font-bold italic text-sm uppercase">
                  No active customers found for this representative.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentProgress;
