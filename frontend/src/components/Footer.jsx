import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Instagram, Facebook, Twitter, Mail, MapPin,
  Phone, Heart, Leaf, Star, Sparkles
} from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();
  const [systemSettings, setSystemSettings] = useState(null);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/settings/public');
        setSystemSettings(res.data);
      } catch (err) {
        console.error("Footer branding fetch failed:", err);
      }
    };
    fetchBranding();

    const handleThemeChange = () => setIsDark(document.documentElement.classList.contains('dark'));
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDynamicLogo = () => {
    const dbLogo = isDark ? systemSettings?.dark_logo_url : systemSettings?.light_logo_url;
    return dbLogo || (isDark ? "https://i.postimg.cc/t4ZsLpWn/mehera-logo-white.png" : "https://i.postimg.cc/nzwPbHWj/mehera-logo.png");
  };

  return (
    <footer className="w-full bg-background transition-all duration-300 border-t border-border transition-colors duration-300 pt-16 pb-8 px-10 mt-auto">
      <div className="max-w-7xl mx-auto">

        {/* Upper Section: Brand Promises */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 pb-12 border-b border-border">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-pink-50 rounded-full text-primary transition-all duration-300"><Leaf size={20} /></div>
            <h4 className="text-[10px] font-black uppercase tracking-widest">100% Organic</h4>
            <p className="text-[9px] text-textMain/50 transition-colors duration-300 font-bold uppercase">Natural Ingredients</p>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-pink-50 rounded-full text-primary transition-all duration-300"><Heart size={20} /></div>
            <h4 className="text-[10px] font-black uppercase tracking-widest">Cruelty Free</h4>
            <p className="text-[9px] text-textMain/50 transition-colors duration-300 font-bold uppercase">Never tested on animals</p>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-pink-50 rounded-full text-primary transition-all duration-300"><Star size={20} /></div>
            <h4 className="text-[10px] font-black uppercase tracking-widest">Premium Quality</h4>
            <p className="text-[9px] text-textMain/50 transition-colors duration-300 font-bold uppercase">Dermatologist Tested</p>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-pink-50 rounded-full text-primary transition-all duration-300"><Sparkles size={20} /></div>
            <h4 className="text-[10px] font-black uppercase tracking-widest">Luxe Finish</h4>
            <p className="text-[9px] text-textMain/50 transition-colors duration-300 font-bold uppercase">High-end makeup base</p>
          </div>
        </div>

        {/* Middle Section: Links & Contact */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

          {/* Brand Story */}
          <div className="space-y-6">
            <div
              className="flex flex-col items-start text-left cursor-pointer"
              onClick={() => handleNavigation('/')}
            >
              <img
                src={getDynamicLogo()}
                alt="Mehera International Logo"
                className="h-8 md:h-10 w-auto object-contain transition-opacity duration-500 ease-in-out will-change-opacity"
              />
            </div>
            <p className="text-textMain/50 transition-colors duration-300 text-xs leading-relaxed font-medium">
              Bringing premium international cosmetics to Sri Lanka. Experience the art of beauty with our curated collection of luxury brands.
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/share/1DiVXugd9a/?mibextid=wwXIfr" className="p-2 bg-card transition-colors duration-300 rounded-full text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300"><Instagram size={18} /></a>
              <a href="https://www.facebook.com/share/1DiVXugd9a/?mibextid=wwXIfr" className="p-2 bg-card transition-colors duration-300 rounded-full text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300"><Facebook size={18} /></a>
             
            </div>
          </div>

          {/* Customer Care */}
          <div className="space-y-6 text-left">
            <h4 className="text-xs font-black uppercase tracking-widest text-textMain transition-colors duration-300">Customer Care</h4>
            <ul className="space-y-3 text-[11px] font-bold text-textMain/50 transition-colors duration-300 uppercase tracking-wider">
              <li className="hover:text-primary transition-all duration-300 cursor-pointer transition-colors">Track Order</li>
              <li className="hover:text-primary transition-all duration-300 cursor-pointer transition-colors">Return Policy</li>
              <li className="hover:text-primary transition-all duration-300 cursor-pointer transition-colors">Shipping Info</li>
              <li className="hover:text-primary transition-all duration-300 cursor-pointer transition-colors">FAQs</li>
            </ul>
          </div>

          {/* Shop Collections */}
          <div className="space-y-6 text-left">
            <h4 className="text-xs font-black uppercase tracking-widest text-textMain transition-colors duration-300">Collections</h4>
            <ul className="space-y-3 text-[11px] font-bold text-textMain/50 transition-colors duration-300 uppercase tracking-wider">
              <li className="hover:text-primary transition-all duration-300 cursor-pointer transition-colors">Face & Base</li>
              <li className="hover:text-primary transition-all duration-300 cursor-pointer transition-colors">Lip Care</li>
              <li className="hover:text-primary transition-all duration-300 cursor-pointer transition-colors">Eye Makeup</li>
              <li className="hover:text-primary transition-all duration-300 cursor-pointer transition-colors">New Arrivals</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6 text-left">
            <h4 className="text-xs font-black uppercase tracking-widest text-textMain transition-colors duration-300">Visit Us</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-textMain/50 transition-colors duration-300">
                <MapPin size={16} className="text-primary transition-all duration-300 shrink-0" />
                <span className="text-[11px] font-medium">No 123, Ward Place, Panadura, Sri Lanka.</span>
              </div>
              <div className="flex items-center gap-3 text-textMain/50 transition-colors duration-300">
                <Phone size={16} className="text-primary transition-all duration-300 shrink-0" />
                <span className="text-[11px] font-medium">+94 11 234 5678</span>
              </div>
              <div className="flex items-center gap-3 text-textMain/50 transition-colors duration-300">
                <Mail size={16} className="text-primary transition-all duration-300 shrink-0" />
                <span className="text-[11px] font-medium">hello@mehera.lk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[9px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-[0.2em]">
            © 2026 MEHERA INTERNATIONAL. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-[9px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest">
            Design by <span className="text-textMain transition-colors duration-300 ml-1">Team Mapogo</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;