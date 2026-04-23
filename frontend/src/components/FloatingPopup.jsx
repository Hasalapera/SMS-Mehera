// src/components/FloatingPopup.jsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Phone, Bot, Send, Camera, Sparkles, Headphones, Globe } from 'lucide-react';
import axios from 'axios';

const FloatingPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false); // භාෂාව තෝරන මෙනු එකට
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // භාෂාව තෝරපු ගමන් චැට් එක පටන් ගන්න function එක
  const startAIChat = (lang) => {
    let welcomeText = "";
    if (lang === 'Sinhala') welcomeText = "ආයුබෝවන්! මම INGLOT විශේෂඥයා. මට ඕනෑම දෙයක් සිංහලෙන් අහන්න.";
    else if (lang === 'Tamil') welcomeText = "வணக்கம்! நான் INGLOT நிபுணர். என்னிடம் எதையும் தமிழில் கேளுங்கள்.";
    else welcomeText = "Hi! I am your INGLOT Expert. How can I help you today?";

    setMessages([{ role: 'ai', text: welcomeText }]);
    setShowLanguage(false);
    setShowChat(true);
  };

  const handleSend = async (imageBase64 = null) => {
    if (!inputText && !imageBase64) return;
    const userMsg = { role: 'user', text: inputText, image: imageBase64 };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5001/api/ask-ai', {
        prompt: inputText || "Analyze this photo",
        imageBase64: imageBase64
      });
      setMessages(prev => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Offline. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setShowChat(false);
    setShowLanguage(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[9999] pointer-events-auto">
      <div className="relative flex flex-col items-end">
        
        <AnimatePresence>
          {/* --- 1. ප්‍රධාන මෙනුව (AI, WhatsApp, Hotline) --- */}
          {isOpen && !showChat && !showLanguage && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex flex-col gap-3 mb-4 items-end">
              <div className="flex items-center gap-3">
                <span className="bg-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">ASK AI</span>
                <button onClick={() => setShowLanguage(true)} className="w-12 h-12 bg-[#b4a460] text-black rounded-full flex items-center justify-center shadow-lg"><Bot size={24} /></button>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">WHATSAPP</span>
                <a href="https://wa.me/94773104000" target="_blank" className="w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg"><MessageCircle size={24} /></a>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">HOTLINE</span>
                <a href="tel:+94773104000" className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg"><Phone size={24} /></a>
              </div>
            </motion.div>
          )}

          {/* --- 2. භාෂාව තෝරන මෙනුව (Language Selection) --- */}
          {isOpen && showLanguage && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-black p-4 rounded-3xl mb-4 flex flex-col gap-2 shadow-2xl border border-[#b4a460]">
              <p className="text-[#b4a460] text-[10px] font-black text-center mb-1">SELECT LANGUAGE</p>
              <button onClick={() => startAIChat('English')} className="bg-white text-black text-xs py-2 px-6 rounded-xl font-bold hover:bg-[#b4a460] transition">English</button>
              <button onClick={() => startAIChat('Sinhala')} className="bg-white text-black text-xs py-2 px-6 rounded-xl font-bold hover:bg-[#b4a460] transition">සිංහල</button>
              <button onClick={() => startAIChat('Tamil')} className="bg-white text-black text-xs py-2 px-6 rounded-xl font-bold hover:bg-[#b4a460] transition">தமிழ்</button>
              <button onClick={() => setShowLanguage(false)} className="text-[#b4a460] text-[10px] mt-2 underline">Back</button>
            </motion.div>
          )}

          {/* --- 3. AI චැට් එක (Chat Window) --- */}
          {isOpen && showChat && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="w-80 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden mb-4 flex flex-col max-h-[500px]">
              <div className="bg-black p-5 flex justify-between items-center text-[#b4a460]">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Mehera AI Expert</h3>
                  <p className="text-white text-[9px] opacity-70">Powered by INGLOT</p>
                </div>
                <button onClick={() => { setShowChat(false); setShowLanguage(true); }}><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 min-h-[300px]">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium shadow-sm ${m.role === 'user' ? 'bg-black text-white' : 'bg-white text-black border border-gray-100'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && <div className="text-[10px] text-gray-400 animate-pulse italic">Thinking...</div>}
              </div>
              <div className="p-3 bg-white border-t flex items-center gap-2">
                <input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type message..." className="flex-1 text-xs outline-none py-2" />
                <button onClick={() => handleSend()} className="p-2 bg-[#b4a460] text-black rounded-xl"><Send size={16} /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ප්‍රධාන Headset Button එක */}
        <button onClick={toggleMenu} className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all ${isOpen ? 'bg-white text-black border-2 border-black rotate-90' : 'bg-black text-[#b4a460] border-2 border-[#b4a460]'}`}>
          {isOpen ? <X size={32} /> : <Headphones size={32} />}
        </button>
      </div>
    </div>
  );
};

export default FloatingPopup;