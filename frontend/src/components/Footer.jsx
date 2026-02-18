import React, { useState, useEffect } from 'react';
import { Clock, Shield, Database, Globe } from 'lucide-react';

const Footer = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="w-full bg-white border-t border-gray-100 py-4 px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="flex items-center gap-2">
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
            © 2026 <span className="text-[#b4a460] font-bold">Mehera International</span>. All Rights Reserved.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Database size={14} className="text-[#b4a460]" />
            <span className="text-[10px] font-bold uppercase">PostgreSQL Connected</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Shield size={14} className="text-[#b4a460]" />
            <span className="text-[10px] font-bold uppercase">SSL Encrypted</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
            <Clock size={14} className="text-[#b4a460]" />
            <span className="text-[11px] font-bold text-gray-600 tabular-nums">
              {time.toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400 border-l pl-4 border-gray-200">
            <Globe size={14} />
            <span className="text-[10px] font-bold uppercase italic">V1.0.4 - Stable</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;