import React from 'react';
import {
  Instagram, Facebook, Twitter, Mail, MapPin,
  Phone, Heart, Leaf, Star, Sparkles
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-[#fdfdfb] border-t border-gray-100 pt-16 pb-8 px-10 mt-auto">
      <div className="max-w-7xl mx-auto">

        {/* Upper Section: Brand Promises */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 pb-12 border-b border-gray-50">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-pink-50 rounded-full text-[#b4a460]"><Leaf size={20} /></div>
            <h4 className="text-[10px] font-black uppercase tracking-widest">100% Organic</h4>
            <p className="text-[9px] text-gray-400 font-bold uppercase">Natural Ingredients</p>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-pink-50 rounded-full text-[#b4a460]"><Heart size={20} /></div>
            <h4 className="text-[10px] font-black uppercase tracking-widest">Cruelty Free</h4>
            <p className="text-[9px] text-gray-400 font-bold uppercase">Never tested on animals</p>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-pink-50 rounded-full text-[#b4a460]"><Star size={20} /></div>
            <h4 className="text-[10px] font-black uppercase tracking-widest">Premium Quality</h4>
            <p className="text-[9px] text-gray-400 font-bold uppercase">Dermatologist Tested</p>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-pink-50 rounded-full text-[#b4a460]"><Sparkles size={20} /></div>
            <h4 className="text-[10px] font-black uppercase tracking-widest">Luxe Finish</h4>
            <p className="text-[9px] text-gray-400 font-bold uppercase">High-end makeup base</p>
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
                src="https://i.postimg.cc/nzwPbHWj/mehera-logo.png"
                alt="Mehera International Logo"
                className="h-8 md:h-10 w-auto object-contain"
              />
            </div>
            <p className="text-gray-500 text-xs leading-relaxed font-medium">
              Bringing premium international cosmetics to Sri Lanka. Experience the art of beauty with our curated collection of luxury brands.
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/share/1DiVXugd9a/?mibextid=wwXIfr" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-[#b4a460] transition-colors"><Instagram size={18} /></a>
              <a href="https://www.facebook.com/share/1DiVXugd9a/?mibextid=wwXIfr" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-[#b4a460] transition-colors"><Facebook size={18} /></a>
             
            </div>
          </div>

          {/* Customer Care */}
          <div className="space-y-6 text-left">
            <h4 className="text-xs font-black uppercase tracking-widest text-black">Customer Care</h4>
            <ul className="space-y-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <li className="hover:text-[#b4a460] cursor-pointer transition-colors">Track Order</li>
              <li className="hover:text-[#b4a460] cursor-pointer transition-colors">Return Policy</li>
              <li className="hover:text-[#b4a460] cursor-pointer transition-colors">Shipping Info</li>
              <li className="hover:text-[#b4a460] cursor-pointer transition-colors">FAQs</li>
            </ul>
          </div>

          {/* Shop Collections */}
          <div className="space-y-6 text-left">
            <h4 className="text-xs font-black uppercase tracking-widest text-black">Collections</h4>
            <ul className="space-y-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <li className="hover:text-[#b4a460] cursor-pointer transition-colors">Face & Base</li>
              <li className="hover:text-[#b4a460] cursor-pointer transition-colors">Lip Care</li>
              <li className="hover:text-[#b4a460] cursor-pointer transition-colors">Eye Makeup</li>
              <li className="hover:text-[#b4a460] cursor-pointer transition-colors">New Arrivals</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6 text-left">
            <h4 className="text-xs font-black uppercase tracking-widest text-black">Visit Us</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-gray-500">
                <MapPin size={16} className="text-[#b4a460] shrink-0" />
                <span className="text-[11px] font-medium">No 123, Ward Place, Panadura, Sri Lanka.</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500">
                <Phone size={16} className="text-[#b4a460] shrink-0" />
                <span className="text-[11px] font-medium">+94 11 234 5678</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500">
                <Mail size={16} className="text-[#b4a460] shrink-0" />
                <span className="text-[11px] font-medium">hello@mehera.lk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
            © 2026 MEHERA INTERNATIONAL. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-[9px] font-black text-gray-400 uppercase tracking-widest">
            Design by <span className="text-black ml-1">Team Mapogo</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;