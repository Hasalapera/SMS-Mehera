// src/components/FloatingPopup.jsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Phone, Bot, Send, Camera, Sparkles, User } from 'lucide-react';
import axios from 'axios';

const FloatingPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([{ role: 'ai', text: 'Hi! I am your INGLOT Expert. Upload a photo or ask me about products!' }]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSend = async (imageBase64 = null) => {
    if (!inputText && !imageBase64) return;

    const userMsg = { role: 'user', text: inputText, image: imageBase64 };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
        // render ekata dammama eke live url ek danna ona
      const res = await axios.post('http://localhost:5001/api/ask-ai', {
        prompt: inputText || "What do you see in this photo?",
        imageBase64: imageBase64
      });
      setMessages(prev => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, my sensors are offline.' }]);
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

  return (
    <div className="fixed bottom-8 right-8 z-[9999] pointer-events-none">
      <div className="relative flex flex-col items-end pointer-events-auto">
        
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="w-80 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden mb-4 flex flex-col max-h-[500px]">
              
              {/* Header */}
              <div className="bg-black p-5 flex justify-between items-center text-[#b4a460]">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Mehera AI Expert</h3>
                  <p className="text-white text-[9px] opacity-70">Powered by INGLOT</p>
                </div>
                <Bot size={20} />
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 min-h-[300px]">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium shadow-sm ${m.role === 'user' ? 'bg-black text-white' : 'bg-white text-black border border-gray-100'}`}>
                      {m.text}
                      {m.image && <p className="text-[8px] mt-1 opacity-50 italic">[Image Attached]</p>}
                    </div>
                  </div>
                ))}
                {loading && <div className="text-[10px] text-gray-400 animate-pulse">AI is thinking...</div>}
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t flex items-center gap-2">
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} hidden accept="image/*" />
                <button onClick={() => fileInputRef.current.click()} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                  <Camera size={18} />
                </button>
                <input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Mehera AI..." className="flex-1 text-xs outline-none py-2" />
                <button onClick={() => handleSend()} className="p-2 bg-[#b4a460] text-black rounded-xl">
                  <Send size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Button */}
        <button onClick={() => setIsOpen(!isOpen)} className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all ${isOpen ? 'bg-white text-black border-2 border-black' : 'bg-black text-[#b4a460] border-2 border-[#b4a460]'}`}>
          {isOpen ? <X size={28} /> : <Sparkles size={28} />}
        </button>
      </div>
    </div>
  );
};

export default FloatingPopup;