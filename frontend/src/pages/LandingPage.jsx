import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag, ShieldCheck, Globe } from 'lucide-react';
import Footer from '../components/Footer';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* Navbar Section */}
      <nav className="flex justify-between items-center px-8 md:px-16 py-6 border-b border-gray-50">
        <div className="flex flex-col text-left">
          <span className="text-2xl font-serif tracking-widest leading-none text-black">Mehera</span>
          <span className="text-[10px] tracking-[0.2em] text-[#b4a460] uppercase mt-1">International (Pvt) Ltd</span>
        </div>

        {/* Login Action Button */}
        <button 
          onClick={() => navigate('/login')}
          className="bg-black text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-[#b4a460] hover:text-black transition-all duration-300 shadow-lg shadow-black/10"
        >
          Staff Login
        </button>
      </nav>

      {/* Hero Section - Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-20 md:py-32 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-8 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#b4a460]/10 rounded-full border border-[#b4a460]/20">
            <span className="text-[10px] font-bold text-[#8a7b42] uppercase tracking-widest">Premium Cosmetics</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif leading-tight">
            Elevating <span className="italic text-[#b4a460]">Beauty</span> <br /> 
            Standards Globally.
          </h1>
          
          <p className="text-gray-500 text-lg max-w-lg leading-relaxed">
            Mehera International is a leading distributor of premium cosmetic products in Sri Lanka. 
            Streamline your orders and manage your business operations efficiently through our integrated system.
          </p>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={() => navigate('/login')}
              className="bg-black text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
            >
              Get Started <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Core System Features */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          <div className="p-8 bg-gray-50 rounded-[2rem] space-y-4 hover:bg-[#b4a460]/5 transition-colors">
            <ShoppingBag className="text-[#b4a460]" size={32} />
            <h3 className="font-bold text-lg">Sales Management</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Monitor your orders and sales performance with real-time analytics.</p>
          </div>
          
          <div className="p-8 bg-black text-white rounded-[2rem] space-y-4">
            <ShieldCheck className="text-[#b4a460]" size={32} />
            <h3 className="font-bold text-lg">Secure Access</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Your data and sensitive information are protected with high-level security protocols.</p>
          </div>
        </div>
      </main>

      {/* Global Footer Component */}
      <Footer/>
    </div>
  );
};

export default LandingPage;