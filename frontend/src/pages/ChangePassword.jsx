import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  const userId = location.state?.userId; 

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setMessage("The two passwords do not match!");
    }

    try {
      await axios.put('http://localhost:5001/api/users/update-password', {
        user_id: userId,
        new_password: newPassword
      });
      
      alert("Password changed successfully! Please log in again.");
      navigate('/login');
    } catch (err) {
      setMessage("Update failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
      <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-gray-800 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-[#b4a460]">Change Temporary Password</h2>
        <p className="text-gray-400 text-sm mb-6">You must change your password the first time you log in.</p>
        
        <form onSubmit={handleChangePassword} className="space-y-4">
          <input 
            type="password" 
            placeholder="New Password" 
            className="w-full bg-black border border-gray-700 p-3 rounded-lg focus:border-[#b4a460] outline-none"
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Confirm New Password" 
            className="w-full bg-black border border-gray-700 p-3 rounded-lg focus:border-[#b4a460] outline-none"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button className="w-full bg-[#b4a460] text-black font-bold py-3 rounded-lg hover:bg-[#9a8b50]">
            Update Password
          </button>
        </form>
        {message && <p className="mt-4 text-red-500 text-sm text-center">{message}</p>}
      </div>
    </div>
  );
};

export default ChangePassword;