// src/components/Footer.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import {
  Instagram, Facebook, Mail, MapPin,
  Phone, Heart, Leaf, Star, Sparkles
} from 'lucide-react';
import localDarkLogo from '../assets/logo/main-dark.png';
import localLightLogo from '../assets/logo/main-light.png';

const Footer = () => {
  const navigate = useNavigate();
  const [systemSettings, setSystemSettings] = useState(null);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await api.get('/settings/public');
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
    return dbLogo || (isDark ? localDarkLogo : localLightLogo);
  };

  return (
    <footer className="w-full bg-background transition-all duration-300 border-t border-border pt-10 md:pt-16 pb-6 md:pb-8 px-4 md:px-8 mt-auto">
      <div className="max-w-7xl mx-auto">
 
        {/* Upper Section: Brand Promises - Fluid Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 mb-10 md:mb-16 pb-8 md:pb-12 border-b border-border">
          <div className="flex flex-col items-center text-center gap-2 md:gap-3">
            <div className="p-2.5 md:p-3 bg-black/5 text-primary rounded-full transition-all duration-300"><Leaf size={18} className="md:w-5 md:h-5" /></div>
            <h4 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-textMain">100% Organic</h4>
            <p className="text-[8px] md:text-[10px] text-textMain/50 font-bold uppercase tracking-wide">Natural Ingredients</p>
          </div>
          <div className="flex flex-col items-center text-center gap-2 md:gap-3">
            <div className="p-2.5 md:p-3 bg-black/5 text-primary rounded-full transition-all duration-300"><Heart size={18} className="md:w-5 md:h-5" /></div>
            <h4 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-textMain">Cruelty Free</h4>
            <p className="text-[8px] md:text-[10px] text-textMain/50 font-bold uppercase tracking-wide">Never tested on animals</p>
          </div>
          <div className="flex flex-col items-center text-center gap-2 md:gap-3">
            <div className="p-2.5 md:p-3 bg-black/5 text-primary rounded-full transition-all duration-300"><Star size={18} className="md:w-5 md:h-5" /></div>
            <h4 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-textMain">Premium Quality</h4>
            <p className="text-[8px] md:text-[10px] text-textMain/50 font-bold uppercase tracking-wide">Dermatologist Tested</p>
          </div>
          <div className="flex flex-col items-center text-center gap-2 md:gap-3">
            <div className="p-2.5 md:p-3 bg-black/5 text-primary rounded-full transition-all duration-300"><Sparkles size={18} className="md:w-5 h-5" /></div>
            <h4 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-textMain">Luxe Finish</h4>
            <p className="text-[8px] md:text-[10px] text-textMain/50 font-bold uppercase tracking-wide">High-end makeup base</p>
          </div>
        </div>

        {/* 🎯 Middle Section: Adaptive Layout Link & Action Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-8 lg:gap-12 mb-10 md:mb-16 text-center lg:text-left">

          {/* 1. Brand Story */}
          <div className="space-y-4 md:space-y-6 flex flex-col items-center lg:items-start">
            <div
              className="flex flex-col items-center lg:items-start cursor-pointer"
              onClick={() => handleNavigation('/')}
            >
              <img
                src={getDynamicLogo()}
                alt="Mehera International Logo"
                className="h-8 md:h-10 w-auto object-contain transition-opacity duration-500 ease-in-out will-change-opacity"
              />
            </div>
            <p className="text-textMain/50 text-xs md:text-sm leading-relaxed font-medium max-w-sm lg:max-w-none">
              Bringing premium international cosmetics to Sri Lanka. Experience the art of beauty with our curated collection of luxury brands.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3 pt-1 md:pt-2">
              <a href="#" className="p-2.5 bg-card border border-border text-textMain/50 hover:text-primary hover:border-primary/30 rounded-full transition-all duration-300 shadow-sm">
                <Instagram size={16} />
              </a>
              <a href="https://www.facebook.com/share/1DiVXugd9a/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="p-2.5 bg-card border border-border text-textMain/50 hover:text-primary hover:border-primary/30 rounded-full transition-all duration-300 shadow-sm">
                <Facebook size={16} />
              </a>
            </div>
          </div>

          {/* 2. Customer Care */}
          <div className="space-y-4 md:space-y-6 lg:pl-8">
            <h4 className="text-xs font-black uppercase tracking-widest text-textMain">Customer Care</h4>
            <ul className="space-y-2.5 md:space-y-3 text-[11px] md:text-xs font-bold text-textMain/50 uppercase tracking-wider">
              <li onClick={() => handleNavigation('/verify-order?tab=status')} className="hover:text-primary transition-all duration-300 cursor-pointer">Track Order</li>
              <li onClick={() => handleNavigation('/verify-order?tab=verify')} className="hover:text-primary transition-all duration-300 cursor-pointer">Verify Order</li>
              <li onClick={() => handleNavigation('/return-policy')} className="hover:text-primary transition-all duration-300 cursor-pointer">Return Policy</li>
              <li onClick={() => handleNavigation('/shipping-info')} className="hover:text-primary transition-all duration-300 cursor-pointer">Shipping Info</li>
              <li onClick={() => handleNavigation('/faqs')} className="hover:text-primary transition-all duration-300 cursor-pointer">FAQs</li>
            </ul>
          </div>

          {/* 3. Operational Quick Links */}
          <div className="space-y-4 md:space-y-6 lg:pl-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-textMain">Quick Links</h4>
            <ul className="space-y-2.5 md:space-y-3 text-[11px] md:text-xs font-bold text-textMain/50 uppercase tracking-wider">
              <li onClick={() => handleNavigation('/')} className="hover:text-primary transition-all duration-300 cursor-pointer">Home</li>
              <li onClick={() => handleNavigation('/products')} className="hover:text-primary transition-all duration-300 cursor-pointer">Catalog</li>
              <li onClick={() => handleNavigation('/workshops')} className="hover:text-primary transition-all duration-300 cursor-pointer">Workshops</li>
              <li onClick={() => handleNavigation('/login')} className="hover:text-primary transition-all duration-300 cursor-pointer">Portal Login</li>
            </ul>
          </div>

          {/* 4. Contact Info */}
          <div className="space-y-4 md:space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-textMain">Visit Us</h4>
            <div className="space-y-3 md:space-y-4 flex flex-col items-center lg:items-start">
              
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-2 lg:gap-3 text-textMain/50 max-w-xs lg:max-w-none">
                <MapPin size={16} className="text-primary shrink-0 lg:mt-0.5" />
                <span className="text-[11px] md:text-xs font-medium leading-relaxed">No.459/C, Galle Road, Pothupitiya South, Wadduwa</span>
              </div>
              
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-2 lg:gap-3 text-textMain/50">
                <Phone size={16} className="text-primary shrink-0" />
                <span className="text-[11px] md:text-xs font-medium">+94 382 286 288</span>
              </div>
              
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-2 lg:gap-3 text-textMain/50">
                <Mail size={16} className="text-primary shrink-0" />
                <span className="text-[11px] md:text-xs font-medium">info@mehera.lk</span>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Copyright Component Row */}
        <div className="pt-6 md:pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-3 text-center md:text-left">
          <p className="text-[9px] md:text-[10px] font-black text-textMain/50 uppercase tracking-[0.15em] md:tracking-[0.2em]">
            © 2026 MEHERA INTERNATIONAL. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-[9px] md:text-[10px] font-black text-textMain/50 uppercase tracking-widest">
            Design by <span className="text-textMain ml-1 font-bold">Team Mapogo</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;