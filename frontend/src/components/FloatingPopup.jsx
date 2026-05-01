import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Phone, Bot, Send, Camera, Headphones, Trash2, Tag, Palette, Info } from 'lucide-react';
import axios from 'axios';

const FloatingPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const fileInputRef = useRef(null);

  // භාෂාව අනුව suggestions වෙනස් කිරීම
  const suggestions = {
    English: [
      { label: 'Product Prices', text: 'What are the prices of your latest products?', icon: <Tag size={14} /> },
      { label: 'Colors/Variations', text: 'Can you show me available colors and variations?', icon: <Palette size={14} /> },
      { label: 'How to buy?', text: 'How can I place an order?', icon: <Info size={14} /> }
    ],
    Sinhala: [
      { label: 'මිල ගණන්', text: 'නිෂ්පාදන වල මිල ගණන් පවසන්න.', icon: <Tag size={14} /> },
      { label: 'වර්ණ/වර්ග', text: 'ලබාගත හැකි වර්ණ සහ වර්ග මොනවාද?', icon: <Palette size={14} /> },
      { label: 'මිලදී ගන්නේ කෙසේද?', text: 'ඇණවුමක් කරන්නේ කොහොමද?', icon: <Info size={14} /> }
    ],
    Tamil: [
      { label: 'விலை விபரங்கள்', text: 'தயாரிப்புகளின் விலை என்ன?', icon: <Tag size={14} /> },
      { label: 'நிறங்கள்', text: 'என்ன நிறங்கள் கிடைக்கின்றன?', icon: <Palette size={14} /> },
      { label: 'எப்படி வாங்குவது?', text: 'நான் எப்படி ஆர்டர் செய்வது?', icon: <Info size={14} /> }
    ]
  };

  const startAIChat = (lang) => {
    setSelectedLang(lang);
    let welcomeText = lang === 'Sinhala' 
      ? "ආයුබෝවන්! මම Mehera International AI සහායකයා. ඔබට අවශ්‍ය දේ පහතින් තෝරන්න හෝ විමසන්න."
      : lang === 'Tamil' 
      ? "வணக்கம்! நான் Mehera AI உதவியாளர். உங்களுக்குத் தேவையானதைத் தேர்ந்தெடுக்கவும் හෝ கேட்கவும்."
      : "Hello! I am your Mehera International Specialist. Pick a topic below or ask me anything!";

    setMessages([{ role: 'ai', text: welcomeText }]);
    setShowLanguage(false);
    setShowChat(true);
  };

  const handleSend = async (overrideText = null) => {
    const textToSend = overrideText || inputText;
    if (!textToSend && !tempImage) return;

    const userMsg = { role: 'user', text: textToSend, image: tempImage };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setTempImage(null);
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5001/api/ask-ai', {
        prompt: textToSend || "Analyze this photo",
        imageBase64: tempImage
      });
      setMessages(prev => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTempImage(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setShowChat(false);
    setShowLanguage(false);
    setTempImage(null);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[9999] pointer-events-auto">
      <div className="relative flex flex-col items-end">
        
        <AnimatePresence>
          {/* Main Options Menu */}
          {isOpen && !showChat && !showLanguage && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 mb-4 items-end">
              <div className="flex items-center gap-3">
                <span className="bg-white text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-gray-100 uppercase tracking-tighter">Ask Mehera AI</span>
                <button onClick={() => setShowLanguage(true)} className="w-12 h-12 bg-[#b4a460] text-black rounded-full flex items-center justify-center shadow-lg"><Bot size={24} /></button>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-white text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-gray-100 uppercase tracking-tighter">WhatsApp</span>
                <a href="https://wa.me/94755728290" target="_blank" className="w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg"><MessageCircle size={24} /></a>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-white text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-gray-100 uppercase tracking-tighter">Hotline</span>
                <a href="tel:+94755728290" className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg"><Phone size={24} /></a>
              </div>
            </motion.div>
          )}

          {/* Language Selection */}
          {isOpen && showLanguage && (
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-black p-5 rounded-3xl mb-4 flex flex-col gap-2 shadow-2xl border border-[#b4a460] w-48">
                <p className="text-[#b4a460] text-[10px] font-black text-center mb-2 tracking-widest">SELECT LANGUAGE</p>
                <button onClick={() => startAIChat('English')} className="bg-white text-black text-xs py-2 px-6 rounded-xl font-bold hover:bg-[#b4a460] transition">English</button>
                <button onClick={() => startAIChat('Sinhala')} className="bg-white text-black text-xs py-2 px-6 rounded-xl font-bold hover:bg-[#b4a460] transition">සිංහල</button>
                <button onClick={() => startAIChat('Tamil')} className="bg-white text-black text-xs py-2 px-6 rounded-xl font-bold hover:bg-[#b4a460] transition">தமிழ்</button>
             </motion.div>
          )}

          {/* AI Chat Window */}
          {isOpen && showChat && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="w-80 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden mb-4 flex flex-col max-h-[550px]">
              
              <div className="bg-black p-5 flex justify-between items-center text-[#b4a460]">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Mehera AI Specialist</h3>
                  <p className="text-white text-[9px] opacity-70">Powered by Team MOPOGO</p>
                </div>
                <button onClick={() => setShowChat(false)}><X size={18} /></button>
              </div>

              {/* Chat Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 min-h-[300px]">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium shadow-sm ${m.role === 'user' ? 'bg-black text-white' : 'bg-white text-black border border-gray-100'}`}>
                      {m.image && <img src={`data:image/jpeg;base64,${m.image}`} className="w-full rounded-lg mb-2" alt="upload" />}
                      {m.text}
                    </div>
                  </div>
                ))}
                
                {/* --- Quick Suggestions (පෙන්වන්නේ AI එකෙන් පිළිතුරක් බලාපොරොත්තු නොවන වෙලාවට විතරයි) --- */}
                {!loading && messages.length === 1 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {suggestions[selectedLang].map((s, idx) => (
                      <button key={idx} onClick={() => handleSend(s.text)} className="flex items-center gap-1 bg-white border border-[#b4a460] text-black text-[10px] py-1.5 px-3 rounded-full hover:bg-[#b4a460] hover:text-white transition-all shadow-sm font-semibold">
                        {s.icon} {s.label}
                      </button>
                    ))}
                  </div>
                )}
                {loading && <div className="text-[10px] text-gray-400 animate-pulse italic">Thinking...</div>}
              </div>

              {/* Image Preview Area */}
              {tempImage && (
                <div className="px-4 py-2 bg-gray-100 flex items-center justify-between border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <img src={`data:image/jpeg;base64,${tempImage}`} className="w-10 h-10 object-cover rounded-md border-2 border-[#b4a460]" alt="preview" />
                    <span className="text-[9px] text-gray-500 font-bold">Image Attached</span>
                  </div>
                  <button onClick={() => setTempImage(null)} className="text-red-500"><Trash2 size={16} /></button>
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 bg-white border-t flex items-center gap-2">
                <input type="file" ref={fileInputRef} onChange={handleImageSelect} hidden accept="image/*" />
                <button onClick={() => fileInputRef.current.click()} className={`p-2 rounded-full transition ${tempImage ? 'text-[#b4a460]' : 'text-gray-400 hover:bg-gray-100'}`}>
                  <Camera size={18} />
                </button>
                <input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..." className="flex-1 text-xs outline-none py-2" />
                <button onClick={() => handleSend()} className="p-2 bg-[#b4a460] text-black rounded-xl shadow-md"><Send size={16} /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={toggleMenu} className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all ${isOpen ? 'bg-white text-black border-2 border-black rotate-90' : 'bg-black text-[#b4a460] border-2 border-[#b4a460]'}`}>
          {isOpen ? <X size={32} /> : <Headphones size={32} />}
        </button>
      </div>
    </div>
  );
};

export default FloatingPopup;