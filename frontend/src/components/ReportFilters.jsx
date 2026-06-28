import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

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
    <div className="p-4 md:p-6 bg-card transition-colors duration-300 border border-border rounded-2xl flex flex-col gap-4 shadow-sm">
      
      {/* 🔘 Filter Option Buttons */}
      <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-2 md:gap-2">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`px-3 py-3 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
              filterType === f.id
                ? 'bg-black text-primary shadow-md sm:scale-105'
                : 'bg-background transition-colors duration-300 text-textMain/60 hover:bg-primary/10 hover:text-primary border border-border shadow-sm sm:hover:scale-105'
            } ${f.id === 'custom' ? 'col-span-2 sm:col-span-1' : ''}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 📅 Monthly Date Picker (Show only if 'monthly' is selected) */}
      {filterType === 'monthly' && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end pt-4 border-t border-border transition-colors duration-300 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-2 w-full sm:flex-1">
            <label className="text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest ml-1">
              Select Target Month
            </label>
            <div className="relative group w-full">
              <input 
                type="month" 
                value={dates.startDate ? dates.startDate.substring(0, 7) : ''} 
                onChange={(e) => setDates({ ...dates, startDate: e.target.value ? `${e.target.value}-01` : '' })}
                onClick={(e) => e.target.showPicker()}
                className="w-full bg-background transition-colors duration-300 border border-border rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-textMain outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer [&::-webkit-calendar-picker-indicator]:dark:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
              />
              <Calendar 
                size={18} 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-textMain/50 transition-colors duration-300 group-focus-within:text-primary pointer-events-none" 
              />
            </div>
          </div>
        </div>
      )}

      {/* 📆 Yearly Date Picker (Show only if 'yearly' is selected) */}
      {filterType === 'yearly' && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end pt-4 border-t border-border transition-colors duration-300 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-2 w-full sm:flex-1">
            <label className="text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest ml-1">
              Select Target Year
            </label>
            <div className="relative group w-full">
              <select 
                value={dates.startDate ? dates.startDate.substring(0, 4) : '2026'} 
                onChange={(e) => setDates({ ...dates, startDate: `${e.target.value}-01-01` })}
                className="w-full bg-background transition-colors duration-300 border border-border rounded-xl py-3 pl-11 pr-10 text-sm font-bold text-textMain outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer appearance-none"
              >
                {Array.from({ length: 15 }, (_, i) => 2026 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <Calendar 
                size={18} 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-textMain/50 transition-colors duration-300 group-focus-within:text-primary pointer-events-none" 
              />
              <ChevronDown 
                size={18} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-textMain/50 transition-colors duration-300 pointer-events-none" 
              />
            </div>
          </div>
        </div>
      )}

      {/* ⏳ Custom Date Ranges (Show only if 'custom' is selected) */}
      {filterType === 'custom' && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end pt-4 border-t border-border transition-colors duration-300 animate-in fade-in slide-in-from-top-2">
          {/* ⏳ From Date Picker */}
          <div className="space-y-2 w-full sm:flex-1">
            <label className="text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest ml-1">
              From Date
            </label>
            <div className="relative group w-full">
              <input 
                type="date" 
                value={dates.startDate} 
                onChange={handleStartDateChange}
                onClick={(e) => e.target.showPicker()}
                className="w-full bg-background transition-colors duration-300 border border-border rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-textMain outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer [&::-webkit-calendar-picker-indicator]:dark:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
              />
              <Calendar 
                size={18} 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-textMain/50 transition-colors duration-300 group-focus-within:text-primary pointer-events-none" 
              />
            </div>
          </div>

          {/* ⏳ To Date Picker */}
          <div className="space-y-2 w-full sm:flex-1">
            <label className="text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest ml-1">
              To Date
            </label>
            <div className="relative group w-full">
              <input 
                type="date" 
                value={dates.endDate} 
                onChange={(e) => setDates({ ...dates, endDate: e.target.value })}
                onClick={(e) => e.target.showPicker()}
                min={dates.startDate} 
                disabled={!dates.startDate}
                className="w-full bg-background transition-colors duration-300 border border-border rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-textMain outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer disabled:opacity-50 [&::-webkit-calendar-picker-indicator]:dark:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
              />
              <Calendar 
                size={18} 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-textMain/50 transition-colors duration-300 group-focus-within:text-primary pointer-events-none" 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportFilters;