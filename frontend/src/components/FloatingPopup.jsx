import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Phone, Bot, Send, Camera, Headphones, Globe } from 'lucide-react';
import axios from 'axios';

const FloatingPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // භාෂාව තෝරාගත් පසු ආරම්භක පණිවිඩය
  const startAIChat = (lang) => {
    let welcomeText = "";
    if (lang === 'Sinhala') {
      welcomeText = "ආයුබෝවන්! මම Mehera International ආයතනයේ AI සහායකයා. ඔබට ඕනෑම දෙයක් සිංහලෙන් විමසන්න පුළුවන්.";
    } else if (lang === 'Tamil') {
      welcomeText = "வணக்கம்! நான் Mehera International நிறுவனத்தின் AI உதவியாளர். நீங்கள் எதையும் தமிழில் கேட்கலாம்.";
    } else {
      welcomeText = "Hello! I am your Mehera International Specialist. How can I assist you today?";
    }

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
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I am having trouble connecting. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      handleSend(base64String);
    };
    if (file) reader.readAsDataURL(file);
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
          {/* --- 1. Main Options Menu --- */}
          {isOpen && !showChat && !showLanguage && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex flex-col gap-3 mb-4 items-end">
              <div className="flex items-center gap-3">
                <span className="bg-white text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-gray-100">ASK MEHERA AI</span>
                <button onClick={() => setShowLanguage(true)} className="w-12 h-12 bg-[#b4a460] text-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Bot size={24} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-white text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-gray-100">WHATSAPP</span>
                <a href="https://wa.me/94773104000" target="_blank" rel="noreferrer" className="w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <MessageCircle size={24} />
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-white text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-gray-100">HOTLINE</span>
                <a href="tel:+94773104000" className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Phone size={24} />
                </a>
              </div>
            </motion.div>
          )}

          {/* --- 2. Language Selection Menu --- */}
          {isOpen && showLanguage && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-black p-5 rounded-3xl mb-4 flex flex-col gap-2 shadow-2xl border border-[#b4a460] w-48">
              <p className="text-[#b4a460] text-[10px] font-black text-center mb-2 tracking-widest">SELECT LANGUAGE</p>
              <button onClick={() => startAIChat('English')} className="bg-white text-black text-xs py-2 px-6 rounded-xl font-bold hover:bg-[#b4a460] transition">English</button>
              <button onClick={() => startAIChat('Sinhala')} className="bg-white text-black text-xs py-2 px-6 rounded-xl font-bold hover:bg-[#b4a460] transition">සිංහල</button>
              <button onClick={() => startAIChat('Tamil')} className="bg-white text-black text-xs py-2 px-6 rounded-xl font-bold hover:bg-[#b4a460] transition">தமிழ்</button>
              <button onClick={() => setShowLanguage(false)} className="text-[#b4a460] text-[9px] mt-2 underline text-center">Back to Menu</button>
            </motion.div>
          )}

          {/* --- 3. AI Chat Window --- */}
          {isOpen && showChat && (
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-80 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden mb-4 flex flex-col max-h-[520px]">
              
              {/* Header */}
              <div className="bg-black p-5 flex justify-between items-center text-[#b4a460]">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Mehera AI Specialist</h3>
                  <p className="text-white text-[9px] opacity-70">Powered by Team MOPOGO</p>
                </div>
                <button onClick={() => { setShowChat(false); setShowLanguage(true); }} className="hover:text-white transition">
                  <X size={18} />
                </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 min-h-[320px]">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium shadow-sm ${m.role === 'user' ? 'bg-black text-white' : 'bg-white text-black border border-gray-100'}`}>
                      {m.text}
                      {m.image && <p className="text-[8px] mt-1 opacity-50 italic">[Image Attached]</p>}
                    </div>
                  </div>
                ))}
                {loading && <div className="text-[10px] text-gray-400 animate-pulse italic">Thinking...</div>}
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t flex items-center gap-2">
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} hidden accept="image/*" />
                <button onClick={() => fileInputRef.current.click()} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition">
                  <Camera size={18} />
                </button>
                <input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything..." className="flex-1 text-xs outline-none py-2" />
                <button onClick={() => handleSend()} className="p-2 bg-[#b4a460] text-black rounded-xl hover:bg-[#9c8b4d] transition">
                  <Send size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Floating Button */}
        <button onClick={toggleMenu} className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${isOpen ? 'bg-white text-black border-2 border-black rotate-90' : 'bg-black text-[#b4a460] border-2 border-[#b4a460]'}`}>
          {isOpen ? <X size={32} /> : <Headphones size={32} />}
        </button>
      </div>
    </div>
  );
};

export default FloatingPopup;