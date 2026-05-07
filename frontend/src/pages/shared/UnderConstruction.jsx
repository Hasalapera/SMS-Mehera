import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Construction, ArrowLeft, Coffee } from 'lucide-react';

const UnderConstruction = ({ featureName = "This module" }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
      
      {/* 🎨 Background Glow Decorations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#b4a460]/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* 🏗️ Icon Section */}
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-black rounded-3xl flex items-center justify-center shadow-2xl border border-[#b4a460]/20 relative z-10">
          <Construction size={48} className="text-[#b4a460] animate-bounce" />
        </div>
        {/* Animated Spanner behind the main icon */}
        <Settings 
          size={32} 
          className="text-[#b4a460]/40 absolute -top-4 -right-4 animate-spin-slow" 
          style={{ animationDuration: '8s' }}
        />
      </div>

      {/* 📝 Text Section */}
      <h1 className="text-3xl md:text-4xl font-serif text-black mb-4 tracking-tight">
        Brewing Something Great...
      </h1>
      
      <p className="text-gray-500 max-w-md mx-auto mb-10 leading-relaxed text-sm md:text-base">
        The <span className="font-bold text-black italic">{featureName}</span> is currently under intense development to match our <span className="text-[#b4a460] font-bold underline decoration-[#b4a460]/30 underline-offset-4 text-xs tracking-widest uppercase">Mehera International</span> standards. 
        We’ll have it ready for you very soon!
      </p>

      {/* 🔘 Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 relative z-20">
        <button 
          onClick={() => navigate(-1)} // කලින් හිටපු පේජ් එකට යන්න
          className="flex items-center justify-center gap-2 px-8 py-3 bg-black text-white rounded-2xl font-bold text-sm hover:bg-[#b4a460] hover:text-black transition-all shadow-xl active:scale-95"
        >
          <ArrowLeft size={18} /> Go Back
        </button>

        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-white border-2 border-black text-black rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm active:scale-95"
        >
          Dashboard
        </button>
      </div>

      {/* 🍵 Footer Note */}
      <div className="mt-16 flex items-center gap-2 text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em]">
        <Coffee size={14} className="text-[#b4a460]" /> T360 Smart Tea-Ops Engine
      </div>
    </div>
  );
};

export default UnderConstruction;