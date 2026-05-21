import React from 'react';
import { Calendar, Search } from 'lucide-react';

const ReportFilters = ({ filterType, setFilterType, dates, setDates, onFetch }) => {
  return (
    <div className="p-[1.5rem] bg-card border border-border rounded-[1.5rem] flex flex-wrap gap-[1rem] items-end transition-all duration-300">
      
      {/* 📅 Filter Category Selector */}
      <div className="space-y-[0.5rem] flex-1 min-w-[12rem]">
        <label className="text-[0.75rem] font-bold text-textMain/60 uppercase tracking-[0.05em]">Filter Interval</label>
        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full p-[0.75rem] bg-background border border-border text-textMain text-[0.875rem] font-bold rounded-[1rem] focus:ring-2 focus:ring-primary outline-none"
        >
          <option value="daily">Daily Report (Today)</option>
          <option value="monthly">Monthly Report (Current Month)</option>
          <option value="yearly">Yearly Deep Dive (Current Year)</option>
          <option value="custom">Custom Date Duration</option>
        </select>
      </div>

      {/* ⏳ Custom Date Ranges (Show only if 'custom' is selected) */}
      {filterType === 'custom' && (
        <>
          <div className="space-y-[0.5rem] flex-1 min-w-[12rem]">
            <label className="text-[0.75rem] font-bold text-textMain/60 uppercase tracking-[0.05em]">From Date</label>
            <input 
              type="date" 
              value={dates.startDate} 
              onChange={(e) => setDates({...dates, startDate: e.target.value})}
              className="w-full p-[0.75rem] bg-background border border-border text-textMain text-[0.875rem] font-bold rounded-[1rem] outline-none focus:ring-2 focus:ring-primary [&::-webkit-calendar-picker-indicator]:dark:invert"
            />
          </div>
          <div className="space-y-[0.5rem] flex-1 min-w-[12rem]">
            <label className="text-[0.75rem] font-bold text-textMain/60 uppercase tracking-[0.05em]">To Date</label>
            <input 
              type="date" 
              value={dates.endDate} 
              onChange={(e) => setDates({...dates, endDate: e.target.value})}
              className="w-full p-[0.75rem] bg-background border border-border text-textMain text-[0.875rem] font-bold rounded-[1rem] outline-none focus:ring-2 focus:ring-primary [&::-webkit-calendar-picker-indicator]:dark:invert"
            />
          </div>
        </>
      )}

      {/* 🚀 Fire Query Button */}
      <button 
        onClick={onFetch}
        className="px-[2rem] py-[0.75rem] bg-primary text-black hover:bg-black hover:text-white font-bold text-[0.875rem] rounded-[1rem] transition-all flex items-center gap-[0.5rem] cursor-pointer"
      >
        <Search size={16} /> Compile Report
      </button>
    </div>
  );
};

export default ReportFilters;