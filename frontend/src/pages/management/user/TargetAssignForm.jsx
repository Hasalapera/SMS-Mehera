import React, { useState, useEffect } from 'react';
import { Target, Users, Calendar, DollarSign, Loader2, CheckCircle, MapPin } from 'lucide-react';
import api from '../../../api/axiosInstance'; 
import { toast } from 'react-hot-toast';
import { useNotifications } from '../../context/NotificationContext';

const TargetAssignForm = ({ token }) => {
  const { setNotificationsFromAPI } = useNotifications();
  // 📝 Form States
  const [salesReps, setSalesReps] = useState([]);
  const [selectedRep, setSelectedRep] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // Default: "2026-05"
  const [activeSaloons, setActiveSaloons] = useState(0);
  const [assignedAreas, setAssignedAreas] = useState([]); // 📍 Rep's districts
  const [adjustedTarget, setAdjustedTarget] = useState('');
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [fetchingReps, setFetchingReps] = useState(false);
  const [fetchingRepDetails, setFetchingRepDetails] = useState(false);

  // Algorithmic weights
  const companyAvgSaloons = 25;
  const baseRatePerSaloon = 4000; 
  
  const densityFactor = activeSaloons > 0 ? (activeSaloons / companyAvgSaloons).toFixed(2) : '1.00';
  const baseTargetAmount = activeSaloons > 0 ? (activeSaloons * baseRatePerSaloon) : 0;

  // 1. Fetch Sales Reps (Using '/api/users/all-users' as per your system routing)
  useEffect(() => {
    const fetchReps = async () => {
      try {
        setFetchingReps(true);
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await api.get('/users/all-users', config); 
        
        const allUsers = res.data?.users || [];
        const filteredReps = allUsers.filter(u => u.role === 'sales_rep');
        
        setSalesReps(filteredReps);
      } catch (err) {
        console.error("Failed to load sales representatives:", err);
        toast.error("Could not load Sales Representatives.");
      } finally {
        setFetchingReps(false);
      }
    };
    
    fetchReps();
  }, [token]);

  // 2. Fetch Rep Details (Saloons & Areas dynamically counted from master DB registries)
  useEffect(() => {
    const fetchRepDetails = async () => {
      if (!selectedRep) {
        setActiveSaloons(0);
        setAssignedAreas([]);
        return;
      }
      try {
        setFetchingRepDetails(true);
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await api.get(`/salesTarget/rep-details/${selectedRep}`, config);
        
        if (res.data?.success) {
          setActiveSaloons(res.data.active_customer_count || 0);
          setAssignedAreas(res.data.areas || []);
        }
      } catch (err) {
        console.error("Failed to fetch rep summary details:", err);
        toast.error("Error loading profile summary metrics.");
      } finally {
        setFetchingRepDetails(false);
      }
    };

    fetchRepDetails();
  }, [selectedRep, token]);

  // 3. Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRep || !month || !adjustedTarget) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      const payload = {
        sales_rep_id: selectedRep,
        month,
        active_customer_count: activeSaloons,
        base_target_amount: baseTargetAmount,
        adjusted_target_amount: parseFloat(adjustedTarget)
      };

      const response = await api.post('/salesTarget/assign', payload, config);

      if (response.data?.success) {
        toast.success("Sales target locked successfully!");
        setSelectedRep('');
        setAdjustedTarget('');

        const notificationRes = await api.get('/notifications', config);
        setNotificationsFromAPI(notificationRes.data.notifications || []);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to assign target.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 animate-in fade-in duration-500">
      
      {/* Header Panel (Matches AddUser style precisely) */}
      <div className="mb-8 text-left">
        <h2 className="text-2xl font-bold text-textMain transition-colors duration-300 flex items-center gap-3">
          <div className="p-2 bg-primary transition-all duration-300 rounded-lg text-textMain">
            <Target size={24} />
          </div>
          Quota & Allocation Ledger
        </h2>
        <p className="text-textMain/50 transition-colors duration-300 text-sm mt-1 ml-12">
          Establish certified monthly sales targets based on active customer registries and area density indices.
        </p>
      </div>

      {/* Main Container Form (Styled 1:1 like AddUser's layout sheet) */}
      <form onSubmit={handleSubmit} className="bg-card transition-colors duration-300 border border-border rounded-[2rem] shadow-sm p-8 md:p-12 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 1. Select Sales Representative */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-textMain/50 transition-colors duration-300 uppercase ml-1">
              Select Sales Representative <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <select
                value={selectedRep}
                onChange={(e) => setSelectedRep(e.target.value)}
                disabled={fetchingReps}
                className="w-full bg-background border border-border text-textMain rounded-xl py-3 pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none transition-all disabled:opacity-50 cursor-pointer"
              >
                <option value="">-- Choose a Representative --</option>
                {salesReps.map((rep) => (
                  <option key={rep.user_id} value={rep.user_id}>
                    {rep.name} ({rep.email})
                  </option>
                ))}
              </select>
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-textMain/50 transition-colors duration-300 group-focus-within:text-primary transition-all duration-300 pointer-events-none" size={18} />
            </div>
          </div>

          {/* 2. Target Month */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-textMain/50 transition-colors duration-300 uppercase ml-1">
              Target Month <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                onClick={(e) => e.target.showPicker()}
                className="w-full bg-background border border-border text-textMain rounded-xl py-3 pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:dark:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
              />
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-textMain/50 transition-colors duration-300 group-focus-within:text-primary transition-all duration-300 pointer-events-none" size={18} />
            </div>
          </div>

          {/* 3. Assigned Saloons Count (🔒 Read-only, automatically handled) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-textMain/50 transition-colors duration-300 uppercase ml-1">
              Assigned Saloons Loop Count
            </label>
            <div className="relative group">
              <input
                type="text"
                readOnly
                disabled
                value={fetchingRepDetails ? "Calculating live registers..." : `${activeSaloons} Active Saloons`}
                className="w-full bg-card border border-border text-textMain/50 rounded-xl py-3 pl-11 pr-4 text-sm font-bold cursor-not-allowed select-none transition-all"
              />
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-textMain/30 pointer-events-none" size={18} />
            </div>
            <p className="text-[10px] text-textMain/40 ml-1 font-medium italic">
              🔒 Automatically synced from the central customer database logs.
            </p>
          </div>

          {/* 4. Final Adjusted Target Amount */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-textMain/50 transition-colors duration-300 uppercase ml-1">
              Final Adjusted Target Amount (LKR) <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <input
                type="number"
                min="0"
                placeholder="e.g. 120000"
                value={adjustedTarget}
                onChange={(e) => setAdjustedTarget(e.target.value)}
                className="w-full bg-background border border-border text-textMain rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold"
              />
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-textMain/50 transition-colors duration-300 group-focus-within:text-primary transition-all duration-300 pointer-events-none" size={18} />
            </div>
            <p className="text-[10px] text-textMain/40 ml-1 font-medium italic">
              💡 Configured manually to account for seasonal corporate indices.
            </p>
          </div>

          {/* 📍 LIVE COVERED TERRITORIES LAYER (Styled like AddUser's Full-span block) */}
          {selectedRep && !fetchingRepDetails && assignedAreas.length > 0 && (
            <div className="col-span-1 md:col-span-2 space-y-4 bg-card transition-colors duration-300 p-6 rounded-2xl border border-border animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <MapPin className="text-primary transition-all duration-300" size={18} />
                <label className="text-xs font-bold text-textMain/50 transition-colors duration-300 uppercase">Covered Territories</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {assignedAreas.map((district, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-primary/10 text-primary font-black text-[10px] rounded-xl border border-primary/20 uppercase tracking-widest">
                    {district}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 📊 ALGORITHMIC AUTOMATED WEIGHT INSIGHTS (Full-span analytics block) */}
          {selectedRep && !fetchingRepDetails && activeSaloons > 0 && (
            <div className="col-span-1 md:col-span-2 p-6 md:p-8 bg-background transition-colors duration-300 border border-border transition-colors duration-300 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-8 animate-in fade-in duration-300">
              <div className="space-y-2">
                <p className="text-xs font-bold text-textMain/50 transition-colors duration-300 uppercase tracking-widest">Territory Capacity Weight</p>
                <p className="text-2xl font-bold text-primary transition-all duration-300 leading-tight">{densityFactor}x Performance Index</p>
                <p className="text-xs text-textMain/40 transition-colors duration-300 font-medium italic mt-1">Calculated against the baseline standard of {companyAvgSaloons} active nodes.</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-textMain/50 transition-colors duration-300 uppercase tracking-widest">Algorithmic Base Target</p>
                <p className="text-2xl font-bold text-textMain transition-colors duration-300 leading-tight">Rs. {baseTargetAmount.toLocaleString()}.00</p>
                <p className="text-xs text-textMain/40 transition-colors duration-300 font-medium italic mt-1">Standard automated quota generation value before scaling adjustment parameters.</p>
              </div>
            </div>
          )}

        </div>

        {/* Action Button Segment (1:1 with AddUser's Complete Registration alignment & effects) */}
        <div className="mt-12 flex justify-end">
          <button 
            type="submit" 
            disabled={loading || fetchingRepDetails}
            className="bg-primary transition-all duration-300 text-textMain transition-colors duration-300 px-10 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#b4a460]/20 hover:bg-[#9a8b50] hover:scale-105 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
            {loading ? 'Locking Document...' : 'Lock Target Document'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TargetAssignForm;