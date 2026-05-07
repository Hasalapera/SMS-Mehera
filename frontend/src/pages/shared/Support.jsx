import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageCircle, Paperclip, Send, HelpCircle, ShieldCheck, Mail, Loader2, X } from 'lucide-react';
import { useAuth } from '../../pages/context/AuthContext'; // Path preserved from your snippet logic
import Swal from 'sweetalert2';

const Support = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ subject: '', message: '' });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adminWhatsApp, setAdminWhatsApp] = useState([]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchAdminContacts = async () => {
      if (user?.role?.toLowerCase() !== 'admin') {
        try {
          const token = localStorage.getItem('accessToken');
          const response = await axios.get('http://localhost:5001/api/support/getAdminContacts', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // නම්බර්ස් ටික විතරක් Array එකකට වෙන් කරගන්නවා
          const numbers = response.data.admins
            .map(a => a.contact_no)
            .filter(n => n); // empty numbers අයින් කරනවා
          
          setAdminWhatsApp(numbers);
        } catch (err) {
          console.error("Admin contacts fetch error:", err);
        }
      }
    };
    fetchAdminContacts();
  }, [user]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    // තෝරපු ෆයිල් එක image එකක් නම් විතරක් preview එකක් හදනවා
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Memory leak එකක් නොවෙන්න පරණ URL එක අයින් කරනවා
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null); // Image එකක් නෙවෙයි නම් preview එකක් පෙන්වන්නේ නැහැ
    }
  }, [file]);

  // Logic preserved exactly as provided in your previous version
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('subject', formData.subject);
    data.append('message', formData.message);
    data.append('senderEmail', user.email);
    data.append('senderName', user.name);

    if (file) data.append('supportFile', file);
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.post(
        'http://localhost:5001/api/support/send-email', data, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      
        Swal.fire({
          title: 'Transmission Successful!',
          text: 'Your support ticket has been routed to the administration.',
          icon: 'success',
          confirmButtonColor: '#b4a460',
          background: '#ffffff',
          customClass: {
            popup: 'rounded-[2rem]',
            confirmButton: 'rounded-xl px-10 py-3'
          }
        });

        // ✅ Form එක සම්පූර්ණයෙන්ම Clear කිරීම
        setFormData({ subject: '', message: '' });
        setFile(null); 
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      
    } catch (err) {
      console.error("Email Error:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.error || "cannot send email";
      Swal.fire({
        title: 'Transmission Failed',
        text: errorMsg,
        icon: 'error',
        confirmButtonColor: '#000000',
        background: '#ffffff',
        customClass: {
          popup: 'rounded-[2rem]',
          confirmButton: 'rounded-xl px-10 py-3'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = () => {
    let rawNumber = "";

    if (user?.role?.toLowerCase() === 'admin') {
      rawNumber = import.meta.env.VITE_DEV_TEAM_WHATSAPP || "94755728290"; 
    } else {
      rawNumber = adminWhatsApp.length > 0 ? adminWhatsApp[0] : "94765747129";
    }

    // 1. මුලින්ම ඉලක්කම් නොවන සේරම අයින් කරනවා (+, spaces, dashes)
    let cleanNumber = rawNumber.toString().replace(/\D/g, '');

    // 2. නම්බර් එක '0' කෑල්ලෙන් පටන් ගන්නවා නම්, ඒක අයින් කරලා '94' ඇඩ් කරනවා
    if (cleanNumber.startsWith('0')) {
      cleanNumber = '94' + cleanNumber.substring(1);
    }
    
    // 3. යම් හෙයකින් නම්බර් එක 7... විදිහට පටන් ගත්තොත් (94 හෝ 0 නැතුව)
    // ඒකටත් 94 ඇඩ් කරන එක ආරක්ෂිතයි
    else if (cleanNumber.length === 9 && cleanNumber.startsWith('7')) {
      cleanNumber = '94' + cleanNumber;
    }

    if (!cleanNumber) {
      Swal.fire({ title: 'Error', text: 'Invalid Contact Number', icon: 'error' });
      return;
    }

    const text = window.encodeURIComponent(
      `*Support Request [${user?.role?.toUpperCase()}]*\n` +
      `*Subject:* ${formData.subject}\n` +
      `*From:* ${user.name}\n` +
      `*Message:* ${formData.message}`
    );
    
    // දැන් ලින්ක් එක හරියටම ජෙනරේට් වෙනවා
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-500 pb-10">
      
      {/* Header - Matches AddUser structure */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-black flex items-center gap-3">
          <div className="p-2 bg-[#b4a460] rounded-lg text-black">
            <HelpCircle size={24} />
          </div>
          Help & Support Center
        </h2>
        <p className="text-gray-500 text-sm mt-1 ml-12">
          Contact the administration for technical issues or system inquiries.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-8 md:p-12">
        <div className="grid grid-cols-1 gap-8">
          
          {/* Subject Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Inquiry Subject</label>
            <div className="relative group">
              <input 
                type="text" 
                placeholder="What is this regarding?" 
                required 
                value={formData.subject} 
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#b4a460] transition-all outline-none"
              />
              <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-[#b4a460]" size={18} />
            </div>
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Message Detail</label>
            <div className="relative group">
              <textarea 
                placeholder="Describe your requirement or technical issue..." 
                rows="5" 
                required 
                value={formData.message} 
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#b4a460] transition-all outline-none resize-none"
              ></textarea>
            </div>
          </div>

          {/* Attachment Section - Styled like District Selection box */}
          <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
             <div className="flex items-center gap-2">
                <Paperclip className="text-[#b4a460]" size={18} />
                <label className="text-xs font-bold text-gray-500 uppercase">Attach Screenshots</label>
             </div>
             
             <div className="relative">
               <input 
                  type="file" accept="image/*" ref={fileInputRef}
                  onChange={(e) => setFile(e.target.files[0])}
                  className="text-xs text-gray-600 file:mr-4 file:py-2 file:px-6 file:rounded-xl file:border-0 file:bg-[#b4a460] file:text-black file:font-bold hover:file:bg-[#9a8b50] cursor-pointer"
               />
               
               {/* 🔴 Image Preview UI */}
               {previewUrl && (
                 <div className="mt-4 relative inline-block">
                   <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="h-32 w-auto rounded-xl border-2 border-white shadow-md object-cover" 
                   />
                   <button 
                    type="button" 
                    onClick={() => setFile(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                   >
                     <X size={14} />
                   </button>
                   <p className="text-[10px] text-gray-400 mt-1 italic font-medium tracking-tight">Image ready for transmission</p>
                 </div>
               )}
             </div>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <ShieldCheck size={18} className="text-blue-500 mt-0.5" />
            <p className="text-[11px] text-gray-600 leading-relaxed italic">
              All support tickets are logged and routed directly to Mehera International administrators. Technical support for the system is provided by the development team.
            </p>
          </div>
        </div>

        {/* Action Buttons - Matches Submit style */}
        <div className="mt-12 flex flex-col sm:flex-row justify-end gap-4">
          <button 
            type="button" 
            onClick={openWhatsApp}
            className="border-2 border-green-500 text-green-600 px-8 py-3 rounded-xl font-bold text-sm hover:bg-green-50 transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle size={18} />
            Chat via WhatsApp
          </button>

          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#b4a460] text-black px-10 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#b4a460]/20 hover:bg-[#9a8b50] hover:scale-105 transition-all flex items-center justify-center gap-2 min-w-[200px]"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            {loading ? 'Transmitting...' : 'Send Support Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Support;

