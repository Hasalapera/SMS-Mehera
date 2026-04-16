import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

const ThemeSettings = () => {
  // බ්‍රවුසරයේ කලින් සේව් කරපු theme එක ගන්නවා, නැත්නම් default 'light'
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  const themes = [
    { id: 'light', name: 'Light Mode', icon: Sun },
    { id: 'dark', name: 'Dark Mode', icon: Moon },
  ];

  return (
    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 transition-all duration-300">
      <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6">
        Appearance & Theme
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {themes.map((t) => {
          const Icon = t.icon;
          const isActive = theme === t.id;
          
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                isActive 
                ? 'border-[#b4a460] bg-[#b4a460]/5 text-[#b4a460]' 
                : 'border-gray-50 dark:border-gray-800 text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <Icon size={24} />
              <span className="text-[11px] font-bold uppercase tracking-wider">{t.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSettings;