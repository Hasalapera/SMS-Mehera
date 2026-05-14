import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Eye, EyeOff, Lock } from 'lucide-react';

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // const [message, setMessage] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const userId = location.state?.userId || location.state?.user_id;

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return Swal.fire({
        title: 'Mismatch!',
        text: "The two passwords do not match!",
        icon: 'error',
        confirmButtonColor: '#b4a460',
        background: '#1a1a1a',
        color: '#ffffff'
      });
    }

    try {
      const response = await axios.put('http://localhost:5001/api/users/update-password', {
        user_id: userId,
        new_password: newPassword
      });
      
      if(response.status === 200) {
        Swal.fire({
          title: 'Success!',
          text: "Password changed successfully! Please log in again.",
          icon: 'success',
          confirmButtonColor: '#b4a460',
          background: '#1a1a1a',
          color: '#ffffff',
          customClass: {
            popup: 'rounded-[2rem]'
          }
        }).then(() => {
          localStorage.clear();
          navigate('/login');
        });
      }
    
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
      Swal.fire({
        title: 'Update Failed',
        text: err.response?.data?.error || "Could not update password. Try again.",
        icon: 'error',
        confirmButtonColor: '#b4a460',
        background: '#1a1a1a',
        color: '#ffffff'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background transition-all duration-300 flex items-center justify-center text-textMain transition-colors duration-300 p-4">
      <div className="bg-card transition-all duration-300 p-8 rounded-[2.5rem] border border-border transition-colors duration-300 w-full max-w-md shadow-2xl shadow-[#b4a460]/5">
        
        <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary/10 transition-all duration-300 rounded-2xl flex items-center justify-center mb-4 border border-primary/20 transition-all duration-300">
                <Lock className="text-primary transition-all duration-300" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-primary transition-all duration-300">Security Sync</h2>
            <p className="text-textMain/50 transition-colors duration-300 text-[10px] uppercase tracking-widest mt-2">Update your temporary credentials</p>
        </div>
        
        <form onSubmit={handleChangePassword} className="space-y-5">
          {/* New Password */}
          <div className="relative">
            <input 
              type={showNewPassword ? "text" : "password"} //The type changes depending on the state.
              placeholder="New Password" 
              className="w-full bg-black border border-border p-4 rounded-2xl focus:border-primary transition-all duration-300 outline-none transition-all pr-12 text-sm"
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button 
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300"
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              placeholder="Confirm New Password" 
              className="w-full bg-black border border-border p-4 rounded-2xl focus:border-primary transition-all duration-300 outline-none transition-all pr-12 text-sm"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button 
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button className="w-full bg-primary transition-all duration-300 text-textMain transition-colors duration-300 font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-[#9a8b50] transition-all transform active:scale-95 shadow-lg shadow-[#b4a460]/20">
            Update & Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;