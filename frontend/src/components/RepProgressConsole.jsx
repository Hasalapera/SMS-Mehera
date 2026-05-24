// 📄 src/components/RepProgressConsole.jsx
import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Award, Loader2, Users, MapPin } from 'lucide-react';
import api from '../api/axiosInstance';

const RepProgressConsole = ({ selectedRepId, selectedMonth, orders = [], token }) => {
  const [targetAmount, setTargetAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [repInfo, setRepInfo] = useState(null);

  // 🧮 1. Calculate live achieved sales volume from orders for THIS specific selected representative
  const liveAchievedSales = orders.reduce((acc, order) => {
    // සසඳන්නේ දැනට සිලෙක්ට් කරලා ඉන්න රෙප්ගේ ID එකට විතරයි
    const isCurrentRepOrder = order.sales_rep?.user_id === selectedRepId || order.created_by === selectedRepId;
    if (!isCurrentRepOrder) return acc;

    const orderTotal = Array.isArray(order.items) ? order.items.reduce((sum, item) => sum + (parseFloat(item.price || 0) * (item.quantity || 0)), 0) : 0;
    return acc + orderTotal;
  }, 0);

  // 📡 2. Fetch Live Locked Target & Area Info from Migrated Backend Tables
  useEffect(() => {
    const fetchRepRegistryDetails = async () => {
      if (!selectedRepId || !selectedMonth) {
        setTargetAmount(0);
        setRepInfo(null);
        return;
      }
      try {
        setLoading(true);
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        
        // 🔌 API 01: locked targets ඇදීම
        const targetRes = await api.get(`/salesTarget/rep-summary?sales_rep_id=${selectedRepId}&month=${selectedMonth}`, config);
        // 🔌 API 02: රෙප්ගේ දිස්ත්‍රික්ක සහ සලූන් ගණන ඇදීම
        const detailsRes = await api.get(`/salesTarget/rep-details/${selectedRepId}`, config);

        if (targetRes.data?.success && targetRes.data?.data) {
          setTargetAmount(parseFloat(targetRes.data.data.adjusted_target_amount || 0));
        } else {
          setTargetAmount(0);
        }

        if (detailsRes.data?.success) {
          setRepInfo(detailsRes.data);
        }
      } catch (err) {
        console.error("Console metrics mapping loop registry error:", err);
        setTargetAmount(0);
        setRepInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRepRegistryDetails();
  }, [selectedRepId, selectedMonth, token]);

  // 📐 Safe Percentage Progress Calculations
  const progressPercentage = targetAmount > 0 ? Math.min((liveAchievedSales / targetAmount) * 100, 100) : 0;
  const deficitAmount = Math.max(targetAmount - liveAchievedSales, 0);

  // රෙප් කෙනෙක් තෝරලා නැත්නම් පිරිසිදු හිස් ස්ක්‍රීන් එකක් පෙන්වනවා (Placeholder)
  if (!selectedRepId) {
    return (
      <div className="p-8 border border-dashed border-border rounded-[2rem] text-center text-textMain/30 font-bold uppercase text-[0.75rem] tracking-widest bg-card/10">
        📢 Select a Sales Representative from filters to audit tracking loops.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-12 text-center flex flex-col items-center justify-center gap-3 bg-card border border-border rounded-[2rem]">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-[0.6875rem] text-textMain/40 font-black uppercase tracking-widest">Auditing Rep Registry Logs...</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-[1.5rem] md:rounded-[2rem] p-5 sm:p-6 md:p-8 shadow-sm animate-in fade-in duration-300 text-left w-full overflow-hidden">
      
      {/* Upper Analytics Grid Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 border-b border-border/60 pb-5 md:pb-6 mb-5 md:mb-6">
        
        {/* Module 1: Locked Allocation Quota */}
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-black text-textMain/40 tracking-widest flex items-center gap-1">
            <Target size={12} className="text-primary shrink-0" /> Monthly Quota Allocation
          </p>
          <p className="text-xl md:text-[1.5rem] font-serif font-black text-textMain leading-tight break-all sm:break-normal">
            Rs. {targetAmount.toLocaleString()}.00
          </p>
          <p className="text-[10px] text-textMain/50 font-medium">
            🔒 Locked for period: <span className="font-bold text-primary">{selectedMonth}</span>
          </p>
        </div>

        {/* Module 2: Live System Performance (Achieved) */}
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-black text-textMain/40 tracking-widest flex items-center gap-1">
            <TrendingUp size={12} className="text-emerald-500 shrink-0" /> Live Audited Sales
          </p>
          <p className="text-xl md:text-[1.5rem] font-sans font-bold text-emerald-500 leading-tight break-all sm:break-normal">
            Rs. {liveAchievedSales.toLocaleString()}.00
          </p>
          <p className="text-[10px] text-textMain/50 font-medium">
            📈 Current accumulated transactional net volume.
          </p>
        </div>

        {/* Module 3: Deficit Tracker */}
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-black text-textMain/40 tracking-widest flex items-center gap-1">
            <Award size={12} className={`shrink-0 ${deficitAmount === 0 ? "text-primary animate-bounce" : "text-textMain/30"}`} /> Deficit / Margin Remainder
          </p>
          <p className={`text-xl md:text-[1.5rem] font-sans font-black leading-tight break-all sm:break-normal ${deficitAmount === 0 ? "text-primary" : "text-textMain/60"}`}>
            {deficitAmount === 0 ? "🎯 Target Smashed!" : `Rs. ${deficitAmount.toLocaleString()}.00`}
          </p>
          <p className="text-[10px] text-textMain/50 font-medium">
            {deficitAmount === 0 ? "Excellent volume performance loop index." : "Required volume to fulfill quota metrics."}
          </p>
        </div>

      </div>

      {/* Modern High-Fidelity Progress Gauge Gauge & Badge Loop */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
          <div>
            <h4 className="text-[0.75rem] font-black uppercase text-textMain tracking-wide">Quota Completion Index</h4>
            {repInfo && (
              <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] text-textMain/60 font-bold uppercase">
                <span className="flex items-center gap-1 bg-background px-2 py-1 rounded-md border border-border">
                  <Users size={10} /> {repInfo.active_customer_count} Saloons
                </span>
                <span className="flex items-center gap-1 bg-background px-2 py-1 rounded-md border border-border">
                  <MapPin size={10} /> {repInfo.areas?.join(', ') || 'Global Loop'}
                </span>
              </div>
            )}
          </div>
          <div className="sm:text-right shrink-0">
            <span className="text-3xl md:text-[1.75rem] font-mono font-black text-primary tracking-tighter">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Executive Custom Gauge Bar */}
        <div className="w-full bg-background border border-border h-4 rounded-full overflow-hidden p-0.5 shadow-inner">
          <div 
            className="bg-gradient-to-r from-primary/60 to-primary h-full transition-all duration-700 ease-out rounded-full shadow-[0_0_10px_rgba(180,164,96,0.3)]" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

    </div>
  );
};

export default RepProgressConsole;