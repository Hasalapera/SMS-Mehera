import React, { useState } from "react";
import { useNavigate, NavLink } from 'react-router-dom';
import { LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../pages/context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false); // Mobile menu state

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const navLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Orders', path: '/orders' },
    { name: 'Customer', path: '/customer' },
    { name: 'History', path: '/history' },
    { name: 'Stock', path: '/stock' },
    { name: 'Support', path: '/support' }
  ];

  const currentUser = user; // useAuth() hook එකෙන් user data එක ගන්නවා

  return (
    <nav className="bg-[#141414] text-white shadow-2xl relative z-[100] border-b border-gray-900">
      {/* --- Main Navigation Bar --- */}
      <div className="max-w-full mx-auto px-10 py-4 flex justify-between items-center">
        
        {/* Brand Logo Section */}
        <div className="flex flex-col cursor-pointer group" onClick={() => navigate('/home')}>
          <span className="text-xl font-serif tracking-[0.2em] leading-none group-hover:text-[#b4a460] transition-colors">Mehera</span>
          <span className="text-[8px] text-[#b4a460] uppercase tracking-[0.3em] font-black">International</span>
        </div>

        {/* Desktop Menu (Visible only on LG screens) */}
        <div className="hidden lg:flex gap-8 text-[11px] font-bold uppercase tracking-widest">
           {navLinks.map((link) => (
             <NavLink 
               key={link.path} 
               to={link.path} 
               className={({ isActive }) => `hover:text-[#b4a460] transition-all duration-300 ${isActive ? 'text-[#b4a460] border-b border-[#b4a460] pb-1' : 'text-gray-400'}`}
             >
               {link.name}
             </NavLink>
           ))}
        </div>

        {/* Right Section: Desktop Profile & Mobile Toggle */}
        <div className="flex items-center gap-5">
          {/* Desktop Only Profile Info */}
          <div className="hidden lg:flex items-center gap-4 border-l border-gray-800 pl-6">
            <div className="text-right">
               <p className="text-[10px] font-bold tracking-tight">{currentUser?.full_name}</p>
               <p className="text-[8px] text-[#b4a460] font-black uppercase italic">
                {currentUser?.role === 'sales_rep' ? 'Sales Representative' : 'Inventory Controller'}
              </p>
            </div>
            <img 
                onClick={() => navigate('/profile')}
                src={currentUser?.picture_url || `https://ui-avatars.com/api/?name=${currentUser?.full_name || 'User'}&background=b4a460&color=fff`} 
                className="w-10 h-10 rounded-xl border border-gray-800 object-cover cursor-pointer hover:scale-105 transition-transform" 
                alt="profile" 
            />
            <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
              <LogOut size={20} />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="lg:hidden p-2 text-[#b4a460] hover:bg-white/5 rounded-xl transition-all"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* --- Mobile Dropdown Menu (Expanding downwards) --- */}
      <div className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out bg-[#1A1A1A] border-t border-gray-800 ${isOpen ? 'max-h-[100vh] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="max-w-full flex flex-col p-6 gap-6">
          
          {/* Mobile Navigation Links */}
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <NavLink 
                key={link.path} 
                to={link.path} 
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `flex items-center justify-between p-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all ${isActive ? 'bg-[#b4a460] text-black' : 'bg-white/5 text-gray-300'}`}
              >
                {link.name}
                <ChevronRight size={16} />
              </NavLink>
            ))}
          </div>

          {/* Mobile Profile & Logout Card */}
          <div className="mt-4 bg-white/5 rounded-2xl p-5 flex flex-col gap-5 border border-white/5">
            <div className="flex items-center gap-4" onClick={() => {navigate('/profile'); setIsOpen(false);}}>
               <img 
                src={currentUser?.picture_url || `https://ui-avatars.com/api/?name=${currentUser?.full_name || 'User'}&background=b4a460&color=fff`} 
                className="w-14 h-14 rounded-2xl border-2 border-[#b4a460] shadow-lg" 
                alt="profile" 
              />
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{currentUser?.full_name}</p>
                <p className="text-[10px] text-[#b4a460] font-black uppercase">{currentUser?.role?.replace('_', ' ')}</p>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 bg-red-500/10 text-red-500 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;