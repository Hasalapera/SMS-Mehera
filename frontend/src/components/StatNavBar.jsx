import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';


const StatNavBar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  
  const handleNavigation = (path) => {
    setIsMenuOpen(false);
    navigate(path);
    // පේජ් එක මාරු වූ පසු උඩටම ස්ක්‍රෝල් කිරීම
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { name: 'Home', action: () => handleNavigation('/') },
    { name: 'Products', action: () => handleNavigation('/#products-section') },
    { name: 'Our Brands', action: () => handleNavigation('/brands') },
    { name: 'Workshops', action: () => handleNavigation('/workshops') },
    { name: 'About US', action: () => handleNavigation('/about') }, 
    { name: 'Contact Us', action: () => navigate('/contact') },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md z-[1000] border-b border-gray-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-12 py-5">
        
        {/* Logo Area */}
        <div className="flex flex-col text-left cursor-pointer" onClick={() => handleNavigation('/')}>
          <img
            src="https://i.postimg.cc/nzwPbHWj/mehera-logo.png"
            alt="Mehera International Logo"
            className="h-8 md:h-10 w-auto object-contain"
          />
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={link.action}
              className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400 hover:text-[#b4a460] transition-colors"
            >
              {link.name}
            </button>
          ))}
          <button
            onClick={() => handleNavigation('/login')}
            className="bg-black text-white px-7 py-2.5 rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-[#b4a460] hover:text-black transition-all duration-300 shadow-lg shadow-black/10 ml-4"
          >
            Login
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden text-black p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <div className={`lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 transition-all duration-500 overflow-hidden ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="flex flex-col p-8 gap-6 text-left">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={link.action}
              className="text-xs font-black uppercase tracking-widest text-gray-500 border-b border-gray-50 pb-4"
            >
              {link.name}
            </button>
          ))}
          <button
            onClick={() => handleNavigation('/login')}
            className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase text-xs tracking-widest"
          >
            System Login
          </button>
        </div>
      </div>
    </nav>
  );
};

export default StatNavBar;