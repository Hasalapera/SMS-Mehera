import React from 'react';
import { Calendar } from 'lucide-react';

const ReportFilters = ({ filterType, setFilterType, dates, setDates }) => {
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    
    // 💡 ආරක්ෂාවට: අලුත් From Date එක දැනට තියෙන To Date එකට වඩා වැඩි නම්, To Date එක clear කරනවා
    if (dates.endDate && newStartDate > dates.endDate) {
      setDates({ startDate: newStartDate, endDate: '' });
    } else {
      setDates({ ...dates, startDate: newStartDate });
    }
  };

  const filters = [
    { id: 'all', label: 'All Time' },
    { id: 'daily', label: 'Daily' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'yearly', label: 'Yearly' },
    { id: 'custom', label: 'Custom Date' }
  ];

  return (
    <div className="p-[1rem] md:p-[1.25rem] bg-card border border-border rounded-[1.25rem] flex flex-col gap-[1rem] transition-all duration-300 shadow-sm">
      
      {/* 🔘 Filter Option Buttons */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-[0.5rem]">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`px-[0.5rem] py-[0.5rem] sm:px-[1rem] sm:py-[0.5rem] rounded-[0.5rem] sm:rounded-[0.75rem] text-[9px] sm:text-[0.6875rem] font-black uppercase tracking-wider sm:tracking-widest transition-all ${
              filterType === f.id
                ? 'bg-black text-primary shadow-md sm:scale-105'
                : 'bg-background text-textMain/60 hover:bg-primary/10 hover:text-primary border border-border shadow-sm sm:hover:scale-105'
            } ${f.id === 'custom' ? 'col-span-2 sm:col-span-1' : ''}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ⏳ Custom Date Ranges (Show only if 'custom' is selected) */}
      {filterType === 'custom' && (
        <div className="flex flex-wrap gap-[1rem] items-end pt-[0.5rem] border-t border-border animate-in fade-in slide-in-from-top-2">
          {/* ⏳ From Date Picker */}
          <div className="space-y-[0.5rem] flex-1 min-w-[12rem]">
            <label className="text-[0.6875rem] font-black text-textMain/60 uppercase tracking-[0.05em] ml-[0.25rem]">
              From Date
            </label>
            <div className="relative group">
              <input 
                type="date" 
                value={dates.startDate} 
                onChange={handleStartDateChange}
                /* ⚡ Field එක ක්ලික් කරපු ගමන් native calendar picker එක open කරනවා */
                onClick={(e) => e.target.showPicker()}
                className="w-full p-[0.625rem] pl-[2.5rem] bg-background border border-border text-textMain text-[0.8125rem] font-bold rounded-[0.875rem] outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:dark:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
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
            <label className="text-[0.6875rem] font-black text-textMain/60 uppercase tracking-[0.05em] ml-[0.25rem]">
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
                className="w-full p-[0.625rem] pl-[2.5rem] bg-background border border-border text-textMain text-[0.8125rem] font-bold rounded-[0.875rem] outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer disabled:opacity-50 [&::-webkit-calendar-picker-indicator]:dark:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
              />
              {/* Lucide Calendar Icon */}
              <Calendar 
                size={16} 
                className="absolute left-[1rem] top-[50%] -translate-y-[50%] text-textMain/40 group-focus-within:text-primary pointer-events-none transition-colors" 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportFilters;