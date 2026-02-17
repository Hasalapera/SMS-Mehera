import React, { useState } from 'react';
import { UserPlus, Mail, Phone, Calendar, ShieldCheck, Camera, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast'; 

const AddUser = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'sales_rep',
    contact_no: '',
    dob: '',
    picture_url: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. localStorage එකෙන් token එක ලබා ගැනීම
    const token = localStorage.getItem('token'); 
    console.log("Current Token in Frontend:", token); 

    try {
      // 2. Request එකට Headers ඇතුළත් කිරීම
      const response = await axios.post(
        'http://localhost:5001/api/users/add-user', 
        formData, 
        {
          headers: {
            // 'Bearer ' සහ token එක අතර හිස්තැනක් (space) තිබීම අනිවාර්යයි
            'Authorization': `Bearer ${token}` 
          }
        }
      );
      
      if (response.status === 201) {
        toast.success(`User ${formData.name} added successfully! Email sent.`);
        setFormData({ name: '', email: '', role: 'sales_rep', contact_no: '', dob: '', picture_url: '' });
      }
    } catch (err) {
      // 3. Error message එක වඩාත් පැහැදිලිව පෙන්වීම
      toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-500">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-black flex items-center gap-3">
          <div className="p-2 bg-[#b4a460] rounded-lg text-black">
            <UserPlus size={24} />
          </div>
          Register New Employee
        </h2>
        <p className="text-gray-500 text-sm mt-1 ml-12">
          Add a new member to Mehera International. An automated password will be sent via email.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-8 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Full Name</label>
            <div className="relative group">
              <input 
                type="text" name="name" required value={formData.name} onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-gray-50 border-none rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#b4a460] transition-all"
              />
              <UserPlus className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-[#b4a460]" size={18} />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email Address</label>
            <div className="relative group">
              <input 
                type="email" name="email" required value={formData.email} onChange={handleChange}
                placeholder="john@mehera.com"
                className="w-full bg-gray-50 border-none rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#b4a460] transition-all"
              />
              <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-[#b4a460]" size={18} />
            </div>
          </div>

          {/* User Role */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">System Role</label>
            <div className="relative group">
              <select 
                name="role" value={formData.role} onChange={handleChange}
                className="w-full bg-gray-50 border-none rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#b4a460] appearance-none transition-all"
              >
                <option value="sales_rep">Sales Representative</option>
                <option value="manager">Manager</option>
                <option value="online_store_keeper">Store Keeper</option>
                <option value="admin">Administrator</option>
              </select>
              <ShieldCheck className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-[#b4a460]" size={18} />
            </div>
          </div>

          {/* Contact Number */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Contact No</label>
            <div className="relative group">
              <input 
                type="text" name="contact_no" required value={formData.contact_no} onChange={handleChange}
                placeholder="077 123 4567"
                className="w-full bg-gray-50 border-none rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#b4a460] transition-all"
              />
              <Phone className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-[#b4a460]" size={18} />
            </div>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Date of Birth</label>
            <div className="relative group">
              <input 
                type="date" name="dob" required value={formData.dob} onChange={handleChange}
                className="w-full bg-gray-50 border-none rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#b4a460] transition-all"
              />
              <Calendar className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-[#b4a460]" size={18} />
            </div>
          </div>

          {/* Profile Picture Placeholder (Cloudinary integration later) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Profile Image</label>
            <button type="button" className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl py-2 flex items-center justify-center gap-2 text-gray-400 hover:border-[#b4a460] hover:text-[#b4a460] transition-all">
              <Camera size={18} /> <span className="text-xs font-bold">Upload Photo</span>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-12 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#b4a460] text-black px-10 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#b4a460]/20 hover:bg-[#9a8b50] hover:scale-105 transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
            {loading ? 'Adding User...' : 'Complete Registration'}
          </button>
        </div>
      </form>

      {/* Info Card */}
      <div className="mt-6 p-4 bg-[#b4a460]/10 border border-[#b4a460]/20 rounded-2xl flex items-start gap-3">
        <ShieldCheck className="text-[#b4a460] mt-0.5" size={18} />
        <p className="text-[11px] text-[#8a7b42] font-medium leading-relaxed">
          Security Note: Upon clicking registration, the system will generate a secure default password based on the user's role and email it immediately. The user will be required to change it on their first login.
        </p>
      </div>
    </div>
  );
};

export default AddUser;