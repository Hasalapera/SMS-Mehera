import React from 'react';
import { Calendar, Search } from 'lucide-react';

const ReportFilters = ({ filterType, setFilterType, dates, setDates, onFetch }) => {
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    
    // 💡 ආරක්ෂාවට: අලුත් From Date එක දැනට තියෙන To Date එකට වඩා වැඩි නම්, To Date එක clear කරනවා
    if (dates.endDate && newStartDate > dates.endDate) {
      setDates({ startDate: newStartDate, endDate: '' });
    } else {
      setDates({ ...dates, startDate: newStartDate });
    }
  };
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
          {/* ⏳ From Date Picker */}
          <div className="space-y-[0.5rem] flex-1 min-w-[12rem]">
            <label className="text-[0.75rem] font-bold text-textMain/60 uppercase tracking-[0.05em] ml-[0.25rem]">
              From Date
            </label>
            <div className="relative group">
              <input 
                type="date" 
                value={dates.startDate} 
                onChange={handleStartDateChange}
                /* ⚡ Field එක ක්ලික් කරපු ගමන් native calendar picker එක open කරනවා */
                onClick={(e) => e.target.showPicker()}
                className="w-full p-[0.75rem] pl-[2.5rem] bg-background border border-border text-textMain text-[0.875rem] font-bold rounded-[1rem] outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:dark:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
              />
              {/* Lucide Calendar Icon */}
              <Calendar 
                size={16} 
                className="absolute left-[1rem] top-[50%] -translate-y-[50%] text-textMain/40 group-focus-within:text-primary pointer-events-none transition-colors" 
              />
            </div>
          </div>

          {/* ⏳ To Date Picker */}
          <div className="space-y-[0.5rem] flex-1 min-w-[12rem]">
            <label className="text-[0.75rem] font-bold text-textMain/60 uppercase tracking-[0.05em] ml-[0.25rem]">
              To Date
            </label>
            <div className="relative group">
              <input 
                type="date" 
                value={dates.endDate} 
                onChange={(e) => setDates({...dates, endDate: e.target.value})}
                /* ⚡ Field එක ක්ලික් කරපු ගමන් native calendar picker එක open කරනවා */
                onClick={(e) => e.target.showPicker()}
                min={dates.startDate} 
                disabled={!dates.startDate}
                className="w-full p-[0.75rem] pl-[2.5rem] bg-background border border-border text-textMain text-[0.875rem] font-bold rounded-[1rem] outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:dark:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
              />
              {/* Lucide Calendar Icon */}
              <Calendar 
                size={16} 
                className="absolute left-[1rem] top-[50%] -translate-y-[50%] text-textMain/40 group-focus-within:text-primary pointer-events-none transition-colors" 
              />
            </div>
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