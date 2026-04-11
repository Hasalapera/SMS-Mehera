import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, Phone, MapPin, Building2, UserCircle, 
  Loader2, ArrowLeft, RefreshCcw, CheckCircle2, Info
} from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const AddCustomer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customerCount, setCustomerCount] = useState(0);
  const [errors, setErrors] = useState({}); // වැරදි හඳුනාගැනීමට state එකක්

  const initialFormState = {
    type: 'Saloon',
    saloon_name: '',
    owner_name: '',
    phone1: '',
    phone2: '',
    lane1: '',
    lane2: '',
    district: '',
    additional_note: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    const fetchCustomerCount = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/customers/count');
        setCustomerCount(res.data.count || 0);
      } catch (err) { console.error(err); }
    };
    fetchCustomerCount();
  }, []);

  const nextCustomerId = `CUS-${String(customerCount + 1).padStart(4, '0')}`;
  const districts = ["Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya", "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee", "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", "Moneragala", "Ratnapura", "Kegalle"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // අකුරක් ටයිප් කරන විට රතු පාට ඉවත් කිරීමට:
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: false });
    }
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to reset the form?")) {
      setFormData(initialFormState);
      setErrors({});
      toast.success("Form reset successfully");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation Part
    const newErrors = {};
    if (!formData.saloon_name.trim()) newErrors.saloon_name = true;
    if (!formData.owner_name.trim()) newErrors.owner_name = true;
    if (!formData.phone1.trim()) newErrors.phone1 = true;
    if (!formData.lane1.trim()) newErrors.lane1 = true;
    if (!formData.district) newErrors.district = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill all required fields highlighted in red");
      return;
    }

    setLoading(true);
    try {
      const submissionData = { ...formData, customer_display_id: nextCustomerId, address: `${formData.lane1}, ${formData.lane2}` };
      await axios.post('http://localhost:5001/api/customers/add', submissionData);
      toast.success("Customer Registered Successfully!");
      setTimeout(() => navigate('/home'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] py-10 px-4 md:px-8 font-sans">
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          
          {/* Header */}
          <div className="bg-[#f8f8f8] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-100">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-[#b4a460] rounded-2xl text-black">
                <UserPlus size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-black tracking-tight uppercase">Register New Customer</h1>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Mehera International</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="bg-white px-5 py-2.5 rounded-2xl border border-gray-100 flex items-center gap-3">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID Reference</span>
                  <span className="text-lg font-black text-[#b4a460]">{nextCustomerId}</span>
               </div>
               <button onClick={() => navigate('/home')} className="p-3 bg-white hover:bg-gray-50 text-gray-500 hover:text-black rounded-xl transition-all border border-gray-100">
                <ArrowLeft size={20} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 lg:grid-cols-2">
              
              {/* Left Side */}
              <div className="p-8 md:p-12 pb-6 lg:pb-12">
                <div className="mb-10">
                  <h2 className="text-sm font-black text-[#b4a460] uppercase tracking-[0.2em]">Basic Profile</h2>
                </div>

                <div className="space-y-7">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 block ml-1">Customer Type</label>
                    <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-gray-50/50 border border-gray-100 focus:border-[#b4a460] focus:bg-white rounded-2xl py-4 px-5 text-sm transition-all outline-none">
                      <option value="Saloon">Saloon</option>
                      <option value="Wholesale">Wholesale</option>
                      <option value="Retail">Retail</option>
                    </select>
                  </div>

                  <div>
                    <label className={`text-[10px] font-black uppercase tracking-widest mb-2.5 block ml-1 ${errors.saloon_name ? 'text-red-500' : 'text-gray-400'}`}>Business Name *</label>
                    <div className="relative group">
                      <Building2 className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${errors.saloon_name ? 'text-red-400' : 'text-gray-300 group-focus-within:text-[#b4a460]'}`} size={18} />
                      <input type="text" name="saloon_name" value={formData.saloon_name} onChange={handleChange} placeholder="e.g. Elegance Hair Studio" 
                        className={`w-full bg-gray-50/50 border rounded-2xl py-4 pl-13 pr-5 text-sm transition-all outline-none ${errors.saloon_name ? 'border-red-500 focus:border-red-600 bg-red-50/30' : 'border-gray-100 focus:border-[#b4a460] focus:bg-white'}`} />
                    </div>
                  </div>

                  <div>
                    <label className={`text-[10px] font-black uppercase tracking-widest mb-2.5 block ml-1 ${errors.owner_name ? 'text-red-500' : 'text-gray-400'}`}>Owner Full Name *</label>
                    <div className="relative group">
                      <UserCircle className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${errors.owner_name ? 'text-red-400' : 'text-gray-300 group-focus-within:text-[#b4a460]'}`} size={18} />
                      <input type="text" name="owner_name" value={formData.owner_name} onChange={handleChange} placeholder="Mr/Ms. Owner Name" 
                        className={`w-full bg-gray-50/50 border rounded-2xl py-4 pl-13 pr-5 text-sm transition-all outline-none ${errors.owner_name ? 'border-red-500 focus:border-red-600 bg-red-50/30' : 'border-gray-100 focus:border-[#b4a460] focus:bg-white'}`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className={`text-[10px] font-black uppercase tracking-widest mb-2.5 block ml-1 ${errors.phone1 ? 'text-red-500' : 'text-gray-400'}`}>Primary Phone *</label>
                      <div className="relative group">
                        <Phone className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${errors.phone1 ? 'text-red-400' : 'text-gray-300 group-focus-within:text-[#b4a460]'}`} size={16} />
                        <input type="text" name="phone1" value={formData.phone1} onChange={handleChange} placeholder="07x..." 
                          className={`w-full bg-gray-50/50 border rounded-2xl py-4 pl-12 pr-4 text-sm transition-all outline-none ${errors.phone1 ? 'border-red-500 focus:border-red-600 bg-red-50/30' : 'border-gray-100 focus:border-[#b4a460] focus:bg-white'}`} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 block ml-1">Secondary Phone</label>
                      <input type="text" name="phone2" value={formData.phone2} onChange={handleChange} placeholder="Optional" className="w-full bg-gray-50/50 border border-gray-100 focus:border-[#b4a460] focus:bg-white rounded-2xl py-4 px-5 text-sm transition-all outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side */}
              <div className="p-8 md:p-12">
                <div className="mb-10">
                  <h2 className="text-sm font-black text-[#b4a460] uppercase tracking-[0.2em]">Location & Area</h2>
                </div>

                <div className="space-y-7">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className={`text-[10px] font-black uppercase tracking-widest mb-2.5 block ml-1 ${errors.lane1 ? 'text-red-500' : 'text-gray-400'}`}>Address Lane 01 *</label>
                      <input type="text" name="lane1" value={formData.lane1} onChange={handleChange} placeholder="No / Street" 
                        className={`w-full bg-gray-50/50 border rounded-2xl py-4 px-5 text-sm transition-all outline-none ${errors.lane1 ? 'border-red-500 focus:border-red-600 bg-red-50/30' : 'border-gray-100 focus:border-[#b4a460] focus:bg-white'}`} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 block ml-1">Address Lane 02</label>
                      <input type="text" name="lane2" value={formData.lane2} onChange={handleChange} placeholder="City / Area" className="w-full bg-gray-50/50 border border-gray-100 focus:border-[#b4a460] focus:bg-white rounded-2xl py-4 px-5 text-sm transition-all outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className={`text-[10px] font-black uppercase tracking-widest mb-2.5 block ml-1 ${errors.district ? 'text-red-500' : 'text-gray-400'}`}>Operational District *</label>
                    <div className="relative group">
                      <MapPin className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${errors.district ? 'text-red-400' : 'text-gray-300 group-focus-within:text-[#b4a460]'}`} size={18} />
                      <select name="district" value={formData.district} onChange={handleChange} 
                        className={`w-full bg-gray-50/50 border rounded-2xl py-4 pl-13 pr-5 text-sm transition-all outline-none appearance-none cursor-pointer ${errors.district ? 'border-red-500 focus:border-red-600 bg-red-50/30' : 'border-gray-100 focus:border-[#b4a460] focus:bg-white'}`}>
                        <option value="">Select District</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 block ml-1 flex items-center gap-2">
                      <Info size={14} className="text-[#b4a460]" /> Additional Notes
                    </label>
                    <textarea name="additional_note" value={formData.additional_note} onChange={handleChange} rows="3" placeholder="Special instructions..." className="w-full bg-gray-50/50 border border-gray-100 focus:border-[#b4a460] focus:bg-white rounded-2xl py-4 px-5 text-sm transition-all outline-none resize-none"></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 md:px-12 md:pb-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-50 mt-4">
              <button type="button" onClick={handleClear} className="group flex items-center gap-3 bg-gray-100/80 hover:bg-red-50 text-gray-500 hover:text-red-600 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                <RefreshCcw size={16} className="group-hover:rotate-180 transition-all duration-500" />
                Reset Form
              </button>

              <button type="submit" disabled={loading} className="w-full sm:w-auto bg-black text-white hover:bg-[#b4a460] hover:text-black px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                {loading ? 'Processing...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCustomer;