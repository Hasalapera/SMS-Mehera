import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Phone, Bot, Send, Camera, Headphones, Trash2, Tag, Palette, Info, ShieldAlert, CheckCircle } from 'lucide-react';
import axios from 'axios';

const FloatingPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  
  // --- අලුතින් එක් කළ Disclaimer State ---
  const [hasAgreed, setHasAgreed] = useState(false); 

  const [selectedLang, setSelectedLang] = useState('English');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const fileInputRef = useRef(null);

  // Suggestions logic (පවතින පරිදි)
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
    setShowLanguage(false);
    setShowChat(true);
    setHasAgreed(false); // භාෂාව තේරූ පසු Disclaimer එක පෙන්වීමට reset කරයි
  };

  // Disclaimer එක පිළිගැනීම සහ සාදරයෙන් පිළිගැනීමේ පණිවිඩය පෙන්වීම
  const handleAcceptTerms = () => {
    setHasAgreed(true);
    let welcomeText = selectedLang === 'Sinhala' 
      ? "ආයුබෝවන්! මම Mehera International AI සහායකයා. ඔබට අවශ්‍ය දේ පහතින් තෝරන්න හෝ විමසන්න."
      : selectedLang === 'Tamil' 
      ? "வணக்கம்! நான் Mehera AI உதவியாளர். உங்களுக்குத் தேவையானதைத் தேர்ந்தெடுக்கவும் அல்லது கேட்கவும்."
      : "Hello! I am your Mehera International Specialist. Pick a topic below or ask me anything!";
    
    setMessages([{ role: 'ai', text: welcomeText }]);
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
    setHasAgreed(false); // Popup වහද්දී හැමවිටම agreement එක reset වේ
  };

  return (
    <div className="fixed bottom-8 right-8 z-[9999] pointer-events-auto font-sans">
      <div className="relative flex flex-col items-end">
        
        <AnimatePresence>
          {/* Main Options Menu (පවතින පරිදි) */}
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

          {/* Language Selection (පවතින පරිදි) */}
          {isOpen && showLanguage && (
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-black p-5 rounded-3xl mb-4 flex flex-col gap-2 shadow-2xl border border-[#b4a460] w-48">
                <p className="text-[#b4a460] text-[10px] font-black text-center mb-2 tracking-widest uppercase">Select Language</p>
                <button onClick={() => startAIChat('English')} className="bg-white text-black text-xs py-2 px-6 rounded-xl font-bold hover:bg-[#b4a460] transition">English</button>
                <button onClick={() => startAIChat('Sinhala')} className="bg-white text-black text-xs py-2 px-6 rounded-xl font-bold hover:bg-[#b4a460] transition">සිංහල</button>
                <button onClick={() => startAIChat('Tamil')} className="bg-white text-black text-xs py-2 px-6 rounded-xl font-bold hover:bg-[#b4a460] transition">தமிழ்</button>
             </motion.div>
          )}

          {/* AI Chat Window with Disclaimer */}
          {isOpen && showChat && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="w-80 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden mb-4 flex flex-col max-h-[550px]">
              
              <div className="bg-black p-5 flex justify-between items-center text-[#b4a460]">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Mehera AI Specialist</h3>
                  <p className="text-white text-[9px] opacity-70 italic">{hasAgreed ? 'Active Session' : 'Pending Verification'}</p>
                </div>
                <button onClick={() => setShowChat(false)}><X size={18} /></button>
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-[350px]">
                {!hasAgreed ? (
                  /* --- MANDATORY DISCLAIMER VIEW --- */
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in zoom-in-95">
                    <div className="bg-[#fcfaf2] p-4 rounded-full border border-[#b4a460]/20">
                      <ShieldAlert size={32} className="text-[#b4a460]" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-black uppercase tracking-tight">Usage Policy</h4>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Action Required</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 text-[10px] text-gray-500 leading-relaxed text-left space-y-2 shadow-sm">
                      <p>• <b>Privacy:</b> AI uses Google Gemini API. <span className="text-red-500 font-bold">Do not</span> upload private IDs or sensitive info.</p>
                      <p>• <b>Guidance:</b> Information provided is for support only and not a substitute for professional advice.</p>
                    </div>
                    <button 
                      onClick={handleAcceptTerms}
                      className="w-full py-4 bg-black text-[#b4a460] rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                      I Agree & Continue <CheckCircle size={14} />
                    </button>
                  </div>
                ) : (
                  /* --- ACTUAL CHAT MESSAGES --- */
                  <div className="space-y-3">
                    {messages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium shadow-sm leading-relaxed ${m.role === 'user' ? 'bg-black text-white rounded-tr-none' : 'bg-white text-black border border-gray-100 rounded-tl-none italic'}`}>
                          {m.image && <img src={`data:image/jpeg;base64,${m.image}`} className="w-full rounded-lg mb-2 shadow-inner" alt="upload" />}
                          {m.text}
                        </div>
                      </div>
                    ))}
                    
                    {!loading && messages.length === 1 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {suggestions[selectedLang].map((s, idx) => (
                          <button key={idx} onClick={() => handleSend(s.text)} className="flex items-center gap-1 bg-white border border-[#b4a460]/30 text-black text-[9px] py-1.5 px-3 rounded-full hover:bg-[#b4a460] hover:text-white transition-all shadow-sm font-bold uppercase tracking-tighter">
                            {s.icon} {s.label}
                          </button>
                        ))}
                      </div>
                    )}
                    {loading && <div className="flex items-center gap-2 text-[10px] text-gray-300 italic animate-pulse ml-1">Analyzing inquiry...</div>}
                  </div>
                )}
              </div>

              {/* Input Area (පේන්නේ Agree වුණාම විතරයි) */}
              {hasAgreed && (
                <>
                  {tempImage && (
                    <div className="px-4 py-2 bg-gray-100 flex items-center justify-between border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <img src={`data:image/jpeg;base64,${tempImage}`} className="w-10 h-10 object-cover rounded-md border-2 border-[#b4a460]" alt="preview" />
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Attached</span>
                      </div>
                      <button onClick={() => setTempImage(null)} className="text-red-500 hover:scale-110 transition"><Trash2 size={16} /></button>
                    </div>
                  )}
                  <div className="p-3 bg-white border-t flex items-center gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleImageSelect} hidden accept="image/*" />
                    <button onClick={() => fileInputRef.current.click()} className={`p-2 rounded-full transition ${tempImage ? 'text-[#b4a460]' : 'text-gray-300 hover:bg-gray-50'}`}>
                      <Camera size={20} />
                    </button>
                    <input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Type your question..." className="flex-1 text-xs outline-none py-2 italic" />
                    <button onClick={() => handleSend()} className="p-2.5 bg-black text-[#b4a460] rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"><Send size={16} /></button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <button onClick={toggleMenu} className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-all duration-500 ${isOpen ? 'bg-white text-black border-2 border-black rotate-90 scale-90' : 'bg-black text-[#b4a460] border-2 border-[#b4a460]'}`}>
          {isOpen ? <X size={32} /> : <Headphones size={32} />}
        </button>
      </div>
    </div>
  );
};

export default FloatingPopup;