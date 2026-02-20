import React, { useState } from 'react';
import { UserPlus, Mail, Phone, Calendar, ShieldCheck, IdCard, MapPin, Loader2 } from 'lucide-react';
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
    nic_no: '', 
    selectedDistricts: [] 
  });

  const districts = [
    "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya", 
    "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar", 
    "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee", 
    "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", 
    "Moneragala", "Ratnapura", "Kegalle"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDistrictChange = (district) => {
    const updated = formData.selectedDistricts.includes(district)
      ? formData.selectedDistricts.filter(d => d !== district)
      : [...formData.selectedDistricts, district];
    setFormData({ ...formData, selectedDistricts: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // NIC validation
    const nicRegex = /^([0-9]{9}[xXvV]|[0-9]{12})$/;

    if (!nicRegex.test(formData.nic_no)) {
      toast.error("Invalid NIC format! Use 12 digits or 9 digits with 'V'.");
      return; 
    }

    if (formData.role === 'sales_rep' && formData.selectedDistricts.length === 0) {
      toast.error("Please select at least one district for Sales Rep.");
      return;
    }
    
    setLoading(true);

    const token = localStorage.getItem('token'); 

    try {
      const response = await axios.post(
        'http://localhost:5001/api/users/addUser', 
        formData, 
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.status === 201) {
        toast.success(`User ${formData.name} added successfully!`);
        setFormData({ 
          name: '', email: '', role: 'sales_rep', contact_no: '', 
          dob: '', nic_no: '', selectedDistricts: [] 
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-500 pb-10">
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
                className="w-full bg-gray-50 border-none rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#b4a460] transition-all"
              />
              <UserPlus className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-[#b4a460]" size={18} />
            </div>
          </div>

          {/* NIC Number */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">NIC Number</label>
            <div className="relative group">
              <input 
                type="text" 
                name="nic_no" 
                required 
                value={formData.nic_no} 
                onChange={handleChange}
                maxLength={12} 
                title="Enter 12 digits for new NIC or 9 digits followed by 'V' for old NIC" 
                placeholder="e.g. 199912345678 or 991234567V"
                className={`w-full bg-gray-50 border rounded-xl py-3 pl-11 pr-4 text-sm transition-all focus:ring-2 
                  ${formData.nic_no && !/^([0-9]{9}[xXvV]|[0-9]{12})$/.test(formData.nic_no) 
                    ? 'border-red-500 focus:ring-red-200' 
                    : 'border-transparent focus:ring-[#b4a460]'}`}
              />
              <IdCard className={`absolute left-4 top-3.5 transition-colors 
                ${formData.nic_no && !/^([0-9]{9}[xXvV]|[0-9]{12})$/.test(formData.nic_no) 
                  ? 'text-red-500' 
                  : 'text-gray-400 group-focus-within:text-[#b4a460]'}`} size={18} />
            </div>
            
            {formData.nic_no && !/^([0-9]{9}[xXvV]|[0-9]{12})$/.test(formData.nic_no) && (
              <p className="text-[10px] text-red-500 ml-1 font-medium italic">
                Please follow the NIC format (12 digits or 9 digits with V)
              </p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email Address</label>
            <div className="relative group">
              <input 
                type="email" name="email" required value={formData.email} onChange={handleChange}
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

          {/* District Selection (Only for Sales Rep) */}
          {formData.role === 'sales_rep' && (
            <div className="col-span-1 md:col-span-2 space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2">
                <MapPin className="text-[#b4a460]" size={18} />
                <label className="text-xs font-bold text-gray-500 uppercase">Assign Working Districts</label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {districts.map(dist => (
                  <label key={dist} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-black">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-[#b4a460] focus:ring-[#b4a460]"
                      checked={formData.selectedDistricts.includes(dist)}
                      onChange={() => handleDistrictChange(dist)}
                    />
                    {dist}
                  </label>
                ))}
              </div>
            </div>
          )}
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
    </div>
  );
};

export default AddUser;