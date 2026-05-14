import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../pages/context/AuthContext'; 

const Login = () => {
  const { login } = useAuth(); 
  const [showPassword, setShowPassword] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [systemSettings, setSystemSettings] = useState(null);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const navigate = useNavigate();

  useEffect(() => {
    const handleThemeChange = () => setIsDark(document.documentElement.classList.contains('dark'));
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/settings/public');
        setSystemSettings(res.data);
      } catch (err) {
        console.error("Login branding fetch failed:", err);
      }
    };
    fetchBranding();
  }, []);

  const images = [
    "https://i.postimg.cc/gj1x07Pm/Beauty-Routines-vol-2-Model-3b-768x960.webp",
    "https://i.postimg.cc/pTJQpzWC/5901905015067-CREACH-PEACH-EYE-SHADOW-PALETTE-05-550x-(1).webp",
    "https://i.postimg.cc/0rgHC8q3/Gemini-Generated-Image-i8xelui8xelui8xe.webp",
    "https://i.postimg.cc/0yCJGPRj/Gemini-Generated-Image-doi3gvdoi3gvdoi3-copy.webp",
    "https://i.postimg.cc/9ffwJZ1Z/INGLOT-X-MAURA-BRUSH-SET-1.webp"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:5001/api/users/login', {
          email, 
          password
      });

      // 1. destructure the data coming from the backend.
      const { user, accessToken, refreshToken, expiresAt, mustChangePassword, user_id, role } = response.data;

      // 2. Case 01: Password eka wenas karanna oninam
      if (mustChangePassword === true) {
          const tempUser = { 
              user_id: user_id, 
              is_first_login: 1, 
              role: role || 'user' 
          };

          //parameters 4ma hari piliwelata yawanawa
          login(tempUser, accessToken, refreshToken, expiresAt); 
          
          navigate('/change-password', { state: { userId: user_id } });
          return;
      }
      
      // 3. Case 02: normal login
      else {
          //4 parameters hari piliwelata
          login(user, accessToken, refreshToken, expiresAt); 
          
          navigate(user.redirectPath || '/dashboard');
          return;
      }

    } catch (err) {
        setError(err.response?.data?.message || "Incorrect Username or Password");
    }
  };

  const getDynamicLogo = () => {
    const dbLogo = isDark ? systemSettings?.dark_logo_url : systemSettings?.light_logo_url;
    return dbLogo || (isDark ? "https://i.postimg.cc/t4ZsLpWn/mehera-logo-white.png" : "https://i.postimg.cc/nzwPbHWj/mehera-logo.png");
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 flex items-center justify-center p-6 font-sans text-textMain transition-colors duration-300">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="mb-12 flex items-center justify-between">
            <div className="cursor-pointer" onClick={() => navigate('/')}>
              <img
                src={getDynamicLogo()}
                alt="Mehera International Logo"
                className="h-8 md:h-10 w-auto object-contain transition-opacity duration-500 ease-in-out will-change-opacity"
                onError={(e) => { e.target.src = isDark ? "https://i.postimg.cc/t4ZsLpWn/mehera-logo-white.png" : "https://i.postimg.cc/nzwPbHWj/mehera-logo.png" }}
              />
            </div>
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-textMain/50 hover:text-primary transition-all duration-300 font-bold text-[10px] uppercase tracking-widest group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </button>
          </div>
          <h1 className="text-4xl font-medium mb-6 leading-tight">Welcome back to <span className="text-primary transition-all duration-300 uppercase font-black">Mehera International</span>!</h1>
          {error && <div className="bg-red-900/20 border border-red-500/50 text-red-500 text-xs p-3 rounded-lg mb-6">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-textMain/50">Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-card border border-border transition-colors duration-300 rounded-lg p-3.5 focus:outline-none focus:border-primary transition-all duration-300 text-sm text-textMain" required />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-textMain/50">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-card border border-border transition-colors duration-300 rounded-lg p-3.5 focus:outline-none focus:border-primary transition-all duration-300 text-sm text-textMain" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="w-full bg-primary transition-all duration-300 hover:bg-[#9a8b50] text-textMain transition-colors duration-300 font-bold py-3.5 rounded-lg transition-all shadow-lg active:scale-[0.98]">Sign in</button>
          </form>
        </div>
        <div className="hidden lg:block">
          <div className="rounded-[2rem] p-4 pb-20 aspect-[4/5] relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #EFE185, #9C9355)' }}>
            <div className="w-full h-full bg-[#1a1a1a] rounded-[1.5rem] overflow-hidden shadow-2xl relative">
              <img src={images[currentIndex]} alt="Mehera Staff" className="w-full h-full object-cover grayscale-[10%] transition-opacity duration-700 ease-in-out" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;