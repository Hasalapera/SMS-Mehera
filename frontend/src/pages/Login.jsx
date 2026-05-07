import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
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
  const navigate = useNavigate();

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

      // 1. Backend එකෙන් එන දත්ත ටික Destructure කරගමු
      const { user, accessToken, refreshToken, expiresAt, mustChangePassword, user_id, role } = response.data;

      // 2. Case 01: Password වෙනස් කළ යුතු නම්
      if (mustChangePassword === true) {
          const tempUser = { 
              user_id: user_id, 
              is_first_login: 1, 
              role: role || 'user' 
          };

          // 🔴 වැදගත්: පරාමිති 4ම නියමිත පිළිවෙලට යවන්න
          login(tempUser, accessToken, refreshToken, expiresAt); 
          
          navigate('/change-password', { state: { userId: user_id } });
          return;
      }
      
      // 3. Case 02: සාමාන්‍ය Login වීම
      else {
          // 🔴 වැදගත්: මෙතනත් පරාමිති 4ම නිවැරදි පිළිවෙලට
          login(user, accessToken, refreshToken, expiresAt); 
          
          navigate(user.redirectPath || '/dashboard');
          return;
      }

    } catch (err) {
        setError(err.response?.data?.message || "Incorrect Username or Password");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-sans text-white">
      {/* ... ඉතිරි UI කොටස වෙනසක් නැත ... */}
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="mb-12">
            <div className="flex flex-col text-left cursor-pointer">
              <img
                src="https://i.postimg.cc/t4ZsLpWn/mehera-logo-white.png"
                alt="Mehera International Logo"
                className="h-8 md:h-10 w-auto object-contain"
              />
            </div>
          </div>
          <h1 className="text-4xl font-medium mb-6 leading-tight">Welcome back to <span className="text-[#b4a460]">Mehera International</span>!</h1>
          {error && <div className="bg-red-900/20 border border-red-500/50 text-red-500 text-xs p-3 rounded-lg mb-6">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-200">Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg p-3.5 focus:outline-none focus:border-[#b4a460] text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-200">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg p-3.5 focus:outline-none focus:border-[#b4a460] text-sm" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#b4a460]">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="w-full bg-[#b4a460] hover:bg-[#9a8b50] text-black font-bold py-3.5 rounded-lg transition-all shadow-lg active:scale-[0.98]">Sign in</button>
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