import React, { useState, useEffect } from 'react';
import { useAuth } from '../pages/context/AuthContext';
import { 
  Settings, Moon, Sun, Globe, Upload, Save, 
  Image as ImageIcon, ShieldCheck, Palette, Edit3
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // --- States ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'en');
  const [loading, setLoading] = useState(false);

  // Branding States (For Admin Only)
  const [lightLogo, setLightLogo] = useState('');
  const [darkLogo, setDarkLogo] = useState('');

  // 1. කලින් සේව් කරපු Settings ලෝඩ් කිරීම (Backend API එකෙන්)
  useEffect(() => {
    const fetchSystemSettings = async () => {
        try {
            const token = localStorage.getItem('accessToken'); 
            
            // 💡 res එක try එක ඇතුළෙම declare කරලා පාවිච්චි කරන්න
            const res = await axios.get('http://localhost:5001/api/settings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data) {
                setLightLogo(res.data.light_logo_url);
                setDarkLogo(res.data.dark_logo_url);
            }
        } catch (err) {
            console.error("Failed to load branding:", err);
            if (err.response?.status === 401) {
                toast.error("Session expired. Please login again.");
            }
        }
    };
        fetchSystemSettings();
    }, []);

  // 2. Logo Upload Logic (Cloudinary)
  const handleLogoUpload = async (e, type) => {
    if (!isAdmin) return;
    
    const file = e.target.files[0];
    if (!file) return;

    // 1. Token එක accessToken කියන නමින් ගන්නවා
    const token = localStorage.getItem('accessToken'); 

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      // 2. මෙන්න මෙතනට Headers ටික අනිවාර්යයෙන්ම ඕනේ
      const res = await axios.post('http://localhost:5001/api/settings/upload-logo', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' // File upload එකක් නිසා මේක වැදගත්
        }
      });
      
      if (type === 'light') setLightLogo(res.data.url);
      else setDarkLogo(res.data.url);
      
      toast.success(`${type.toUpperCase()} logo uploaded! Click Save to apply.`);
    } catch (err) {
      console.error("Upload Error:", err);
      toast.error("Upload failed! Make sure you are an Admin.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Save Settings
  const saveAllSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken'); // 👈 Token එක ගන්නවා
      
      localStorage.setItem('theme', theme);
      localStorage.setItem('lang', language);

      if (isAdmin) {
        // 💡 මෙතන ඔයාගේ Backend එකේ route එක PUT ද POST ද කියලා බලන්න. 
        // සාමාන්‍යයෙන් update එකකට PUT තමයි පාවිච්චි කරන්නේ.
        await axios.put('http://localhost:5001/api/settings', { 
          light_logo_url: lightLogo,
          dark_logo_url: darkLogo,
          default_language: language
        }, {
          headers: { 'Authorization': `Bearer ${token}` } // 👈 Admin check එක pass වෙන්න මේක ඕනේ
        });
      }

      toast.success("Settings updated successfully!");
      // සයිඩ් බාර් එකේ ලෝගෝ එක අප්ඩේට් වෙන්න තත්පරයකින් රීලෝඩ් කරමු
      setTimeout(() => window.location.reload(), 1000);
      
    } catch (err) {
      console.error("Save Error:", err);
      toast.error("Failed to save. Check if you are an Admin.");
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (newTheme) => {
    setTheme(newTheme); //update the state
    
    if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    
    //page eka reload nokarapata maru wenna
    localStorage.setItem('theme', newTheme);

    //anit components inform karanna side bar, navbar
    window.dispatchEvent(new Event('themeChange'));
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto animate-in fade-in duration-500 transition-all duration-500 ease-in-out text-left">
      
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-10">
        <div className="p-3 bg-primary/10 transition-all duration-500 ease-in-out rounded-2xl">
          <Settings className="text-primary transition-all duration-500" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-textMain transition-colors duration-500 tracking-tight">System Settings</h2>
          <p className="text-textMain/50 transition-colors duration-500 text-sm font-medium">Customize Mehera International interface & branding.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* User Preferences Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card transition-all duration-500 ease-in-out p-8 rounded-[2.5rem] border border-border shadow-sm">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-textMain/50 transition-colors duration-500 mb-6 flex items-center gap-2">
              <Palette size={14} className="text-primary transition-all duration-500" /> Visual Theme
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => applyTheme('light')} className={`p-6 rounded-3xl border-2 transition-all duration-500 ease-in-out flex flex-col items-center gap-4 ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border bg-card/50 hover:border-border'}`}>
                <Sun size={32} className={theme === 'light' ? 'text-primary' : 'text-textMain/50'} />
                <span className="text-[10px] font-black uppercase tracking-widest text-textMain/50 transition-colors duration-500">Light Mode</span>
              </button>
              <button onClick={() => applyTheme('dark')} className={`p-6 rounded-3xl border-2 transition-all duration-500 ease-in-out flex flex-col items-center gap-4 ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border bg-card/50 hover:border-border'}`}>
                <Moon size={32} className={theme === 'dark' ? 'text-primary' : 'text-textMain/50'} />
                <span className="text-[10px] font-black uppercase tracking-widest text-textMain/50 transition-colors duration-500">Dark Mode</span>
              </button>
            </div>
          </div>

          <div className="bg-card transition-colors duration-300 p-8 rounded-[2.5rem] border border-border transition-colors duration-300 shadow-sm">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-textMain/50 transition-colors duration-300 mb-6 flex items-center gap-2">
              <Globe size={14} className="text-primary transition-all duration-300" /> Language Settings
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {['en', 'si', 'ta'].map(l => (
                <button key={l} onClick={() => setLanguage(l)} className={`py-3 rounded-xl border text-xs font-bold transition-all ${language === l ? 'bg-black text-white border-black' : 'bg-card transition-colors duration-300 text-textMain/50 transition-colors duration-300 border-border transition-colors duration-300 hover:border-border transition-colors duration-300'}`}>
                  {l === 'en' ? 'English' : l === 'si' ? 'සිංහල' : 'தமிழ்'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Branding Section (Admin Exclusive) */}
        <div className="space-y-6">
          {isAdmin ? (
            <div className="bg-card transition-colors duration-300 p-8 rounded-[2.5rem] border border-border transition-colors duration-300 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary transition-all duration-300">Branding</h3>
                <ShieldCheck size={16} className="text-green-500" />
              </div>

              {/* Light Logo Box */}
              <div className="mb-8">
                <p className="text-[9px] font-black uppercase text-textMain/50 transition-colors duration-300 mb-3 ml-1">Sidebar Logo (Light)</p>
                <div className="relative group aspect-[16/7] bg-card transition-colors duration-300 rounded-2xl overflow-hidden border border-border transition-colors duration-300 flex items-center justify-center p-4">
                  {lightLogo ? (
                    <img src={lightLogo} alt="Light Preview" className="max-h-full object-contain" />
                  ) : (
                    <ImageIcon className="text-gray-200" size={30} />
                  )}
                  {/* Click to Replace Overlay */}
                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer text-white backdrop-blur-[2px]">
                    <Edit3 size={20} className="mb-1" />
                    <span className="text-[10px] font-bold">Replace Light Logo</span>
                    <input type="file" className="hidden" onChange={(e) => handleLogoUpload(e, 'light')} />
                  </label>
                </div>
              </div>

              {/* Dark Logo Box */}
              <div>
                <p className="text-[9px] font-black uppercase text-textMain/50 transition-colors duration-300 mb-3 ml-1">Sidebar Logo (Dark)</p>
                <div className="relative group aspect-[16/7] bg-card transition-colors duration-300 rounded-2xl overflow-hidden border border-border transition-colors duration-300 flex items-center justify-center p-4">
                  {darkLogo ? (
                    <img src={darkLogo} alt="Dark Preview" className="max-h-full object-contain" />
                  ) : (
                    <ImageIcon className="text-textMain/70 transition-colors duration-300" size={30} />
                  )}
                  <label className="absolute inset-0 bg-card/10 transition-colors duration-300 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer text-white backdrop-blur-[2px]">
                    <Edit3 size={20} className="mb-1 text-primary transition-all duration-300" />
                    <span className="text-[10px] font-bold">Replace Dark Logo</span>
                    <input type="file" className="hidden" onChange={(e) => handleLogoUpload(e, 'dark')} />
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card/50 transition-colors duration-300 p-8 rounded-[2.5rem] border border-dashed border-border transition-colors duration-300 text-center py-20 opacity-60">
              <ShieldCheck size={40} className="text-textMain/50 transition-colors duration-300 mx-auto mb-4" />
              <p className="text-[10px] font-bold text-textMain/50 transition-colors duration-300 uppercase tracking-widest">Administrator Branding Access Only</p>
            </div>
          )}

          <button 
            disabled={loading}
            onClick={saveAllSettings}
            className="w-full bg-primary transition-all duration-300 text-white p-5 rounded-[2rem] font-bold flex items-center justify-center gap-3 shadow-xl shadow-[#b4a460]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Processing..." : <><Save size={18} /> Update All Settings</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;