import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

const ThemeSettings = () => {
  // The browser will take the previously saved theme, or the default 'light'.
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
    <div className="bg-card transition-colors duration-300 dark:bg-card transition-colors duration-300 p-6 rounded-[2rem] border border-border transition-colors duration-300 dark:border-border transition-all duration-300">
      <h3 className="text-xs font-black text-textMain/50 transition-colors duration-300 dark:text-textMain/50 transition-colors duration-300 uppercase tracking-[0.2em] mb-6">
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
                ? 'border-primary transition-all duration-300 bg-primary/5 transition-all duration-300 text-primary transition-all duration-300' 
                : 'border-border dark:border-border transition-colors duration-300 text-textMain/50 transition-colors duration-300 hover:bg-card transition-colors duration-300 dark:hover:bg-card/5 transition-colors duration-300'
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