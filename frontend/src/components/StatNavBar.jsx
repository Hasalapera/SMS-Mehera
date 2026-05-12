import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import axios from 'axios';

const StatNavBar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [systemSettings, setSystemSettings] = useState(null);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/settings/public');
        setSystemSettings(res.data);
      } catch (err) {
        console.error("StatNavBar branding fetch failed:", err);
      }
    };
    fetchBranding();

    const handleThemeChange = () => setIsDark(document.documentElement.classList.contains('dark'));
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
    setIsDark(newTheme === 'dark');
    window.dispatchEvent(new Event('themeChange'));
  };


  
  const handleNavigation = (path) => {
    setIsMenuOpen(false);
    navigate(path);
    // පේජ් එක මාරු වූ පසු උඩටම ස්ක්‍රෝල් කිරීම
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { name: 'Home', action: () => handleNavigation('/') },
    { name: 'Products', action: () => navigate('/products') },
    { name: 'Our Brands', action: () => handleNavigation('/brands') },
    { name: 'Workshops', action: () => handleNavigation('/workshops') },
    { name: 'About US', action: () => handleNavigation('/about') }, 
    { name: 'Contact Us', action: () => navigate('/contact') },
  ];

  const getDynamicLogo = () => {
    const dbLogo = isDark ? systemSettings?.dark_logo_url : systemSettings?.light_logo_url;
    return dbLogo || (isDark ? "https://i.postimg.cc/t4ZsLpWn/mehera-logo-white.png" : "https://i.postimg.cc/nzwPbHWj/mehera-logo.png");
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-card/80 backdrop-blur-md z-[1000] border-b border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-12 py-5">
        
        {/* Logo Area */}
        <div className="flex flex-col text-left cursor-pointer" onClick={() => handleNavigation('/')}>
          <img
            src={getDynamicLogo()}
            alt="Mehera International Logo"
            className="h-8 md:h-10 w-auto object-contain transition-opacity duration-500 ease-in-out will-change-opacity"
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
            onClick={toggleTheme} 
            className="p-2.5 rounded-lg text-textMain/60 hover:text-primary hover:bg-primary/10 transition-all duration-300 ml-4"
          >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => handleNavigation('/login')}
            className="bg-black text-white px-7 py-2.5 rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-[#b4a460] hover:text-black transition-all duration-300 shadow-lg shadow-black/10"
          >
            Login
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden flex items-center gap-3">
            <button onClick={toggleTheme} className="text-textMain/80 hover:text-primary transition-all duration-300 p-2">
                {isDark ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            <button className="text-textMain p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div className={`lg:hidden absolute top-full left-0 w-full bg-card border-b border-border transition-all duration-500 overflow-hidden ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="flex flex-col p-8 gap-6 text-left">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={link.action}
              className="text-xs font-black uppercase tracking-widest text-textMain/60 hover:text-primary border-b border-border pb-4 transition-colors"
            >
              {link.name}
            </button>
          ))}
          <button
            onClick={() => handleNavigation('/login')}
            className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase text-xs tracking-widest"
          >
            Login
          </button>
        </div>
      </div>
    </nav>
  );
};

export default StatNavBar;