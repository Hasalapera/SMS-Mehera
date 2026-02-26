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
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=800"
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
    console.log("Login form submitted..."); // 🔴 test 1

    try {
      const response = await axios.post('http://localhost:5001/api/users/login', {
          email, 
          password
      });

      const data = response.data;
      console.log("Backend response received:", data); //test 2
        
      if (data.token) {
          localStorage.setItem('token', data.token);
      }

      // 🔴 Case 01: Password වෙනස් කළ යුතු නව පරිශීලකයෙකු නම්
      if (data.mustChangePassword === true) {
        console.log("Going to change password page...");
          const tempUser = { 
              user_id: data.user_id, 
              is_first_login: 1, 
              role: data.role || 'user' 
          };
          login(tempUser);
          
          // 'userId' ලෙස යවන්න (ChangePassword එකේ අල්ලන නම)
          navigate('/change-password', { state: { userId: data.user_id } });
          return;
      }
      
      // 🔴 Case 02: සාමාන්‍ය Login වීම
      else {
          login(data.user); // 🔴 Context එක හරහා user දත්ත update කිරීම
          
          // Role එක අනුව navigate කිරීම
          navigate(data.user.redirectPath || '/dashboard');
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
            <div className="flex flex-col">
              <span className="text-3xl font-serif tracking-widest text-white leading-none">Mehera</span>
              <span className="text-[10px] tracking-[0.3em] text-[#b4a460] uppercase mt-1">International (Pvt) Ltd</span>
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