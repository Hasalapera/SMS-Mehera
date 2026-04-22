import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Phone, Mail, HelpCircle } from 'lucide-react';

const FloatingPopup = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        /* මෙන්න මෙතන 'fixed' දාලා තියෙන නිසා ඔයා කොච්චර Scroll කළත් 
           බටන් එක දකුණු පැත්තේ යටම කොණේ ස්ථාවරව තියෙනවා.
        */
        <div className="fixed bottom-8 right-8 z-[9999] font-sans pointer-events-none">

            {/* Container එක ඇතුළේ click වැඩ කරන්න pointer-events-auto දාන්න ඕනේ */}
            <div className="relative flex flex-col items-end pointer-events-auto">

                {/* --- Popup Menu (Animated) --- */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, y: 50, x: 20 }}
                            animate={{ opacity: 1, scale: 1, y: -20, x: 0 }}
                            exit={{ opacity: 0, scale: 0.5, y: 50, x: 20 }}
                            className="w-72 bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(180,164,96,0.3)] border border-gray-100 overflow-hidden mb-4"
                        >
                            {/* Header */}
                            <div className="bg-black p-6">
                                <h3 className="text-[#b4a460] font-black uppercase text-[10px] tracking-[0.2em]">Mehera Support</h3>
                                <p className="text-white text-[11px] font-bold opacity-70 mt-1">Registry Assistant</p>
                            </div>

                            {/* Options List */}
                            <div className="p-4 space-y-2">
                                {/* --- Hotline (Call) Option --- */}
                                <a
                                    href="tel:0755728290"
                                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-all group text-left no-underline"
                                >
                                    <div className="p-2 bg-[#b4a460]/10 text-[#b4a460] rounded-xl group-hover:bg-[#b4a460] group-hover:text-white transition-all">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-black uppercase">Hotline</p>
                                        <p className="text-[10px] text-gray-400 font-bold tracking-tight">075 572 8290</p>
                                    </div>
                                </a>

                                {/* --- WhatsApp Option --- */}
                                <a
                                    href="https://wa.me/94755728290"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-all group text-left no-underline"
                                >
                                    <div className="p-2 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-all">
                                        <MessageCircle size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-black uppercase">WhatsApp</p>
                                        <p className="text-[10px] text-gray-400 font-bold tracking-tight">Chat with us now</p>
                                    </div>
                                </a>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- Floating Button (The AssistiveTouch Style) --- */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
            w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300
            ${isOpen ? 'bg-white text-black border-2 border-black' : 'bg-black text-[#b4a460] border-2 border-[#b4a460]'}
          `}
                >
                    {isOpen ? (
                        <X size={28} strokeWidth={2.5} />
                    ) : (
                        <div className="relative">
                            <MessageCircle size={28} strokeWidth={2.5} />
                            {/* Notification Dot */}
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black flex items-center justify-center">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                            </span>
                        </div>
                    )}
                </motion.button>
            </div>
        </div>
    );
};

export default FloatingPopup;