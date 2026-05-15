import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  UserPlus, Phone, MapPin, Building2, UserCircle, 
  Loader2, ArrowLeft, RefreshCcw, CheckCircle2, Info
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AddCustomer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [customerCount, setCustomerCount] = useState(0);
  const [errors, setErrors] = useState({});

  const isFromAssignUser = location.state?.from === '/assign-user';

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

  // useEffect(() => {
  //   const fetchCustomerCount = async () => {
  //     try {
  //       const res = await axios.get('http://localhost:5001/api/customers/count');
  //       setCustomerCount(res.data.count || 0);
  //     } catch (err) { console.error(err); }
  //   };
  //   fetchCustomerCount();
  // }, []);

  const fetchCustomerCount = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/customers/count');
      setCustomerCount(res.data.count || 0);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchCustomerCount();
  }, []);

  const nextCustomerId = `CUS-${String(customerCount + 1).padStart(4, '0')}`;
  const districts = ["Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya", "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee", "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", "Moneragala", "Ratnapura", "Kegalle"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      const submissionData = { 
        ...formData, 
        customer_display_id: nextCustomerId, 
        address: `${formData.lane1}, ${formData.lane2}` 
      };

      await axios.post('http://localhost:5001/api/customers/add', submissionData);
      toast.success("Customer Registered Successfully!");

      if (isFromAssignUser) {
        setTimeout(() => {
          navigate('/assign-user');
        }, 1500);
      } else {
        setFormData(initialFormState);
        setErrors({});
        fetchCustomerCount();
      }

    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 py-10 px-4 md:px-8 font-sans">
      
      <div className="max-w-6xl mx-auto">
        {isFromAssignUser && (
          <button 
            onClick={() => navigate('/assign-user')}
            className="mb-6 flex items-center gap-2 text-textMain/50 transition-colors duration-300 hover:text-textMain transition-colors duration-300 font-black text-[10px] uppercase tracking-widest transition-all"
          >
            <ArrowLeft size={16} /> Back to Assign User Section
          </button>
        )}
        <div className="bg-card transition-colors duration-300 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-border transition-colors duration-300 overflow-hidden">
          

          {/* Header */}
          <div className="bg-background transition-all duration-300 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border transition-colors duration-300">
            <div className="flex items-center gap-5">
              {/* Icon Box with Gold Color */}
              <div className="p-3.5 bg-primary transition-all duration-300 rounded-2xl text-textMain transition-colors duration-300 shadow-lg shadow-[#b4a460]/20 flex items-center justify-center">
                <UserPlus size={28} strokeWidth={2.5} />
              </div>
              
              <div>

                <h1 className="text-2xl md:text-3xl font-black text-textMain transition-colors duration-300 tracking-tight uppercase">Register New Customer</h1>
                <p className="text-textMain/50 transition-colors duration-300 text-xs font-bold uppercase tracking-[0.2em] mt-1">Mehera International</p>

              </div>
            </div>
            
            <div className="flex items-center gap-4">

               <div className="bg-card transition-colors duration-300 px-5 py-2.5 rounded-2xl border border-border transition-colors duration-300 flex items-center gap-3">
                  <span className="text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest">ID Reference</span>
                  <span className="text-lg font-black text-primary transition-all duration-300">{nextCustomerId}</span>
               </div>
               {/* <button onClick={() => navigate('/home')} className="p-3 bg-card transition-colors duration-300 hover:bg-card transition-colors duration-300 text-textMain/50 transition-colors duration-300 hover:text-textMain transition-colors duration-300 rounded-xl transition-all border border-border transition-colors duration-300">
                <ArrowLeft size={20} />
              </button> */}

            </div>
          </div>

          <div className="px-10">
            <div className="w-full h-[1px] bg-gray-100"></div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 md:p-12 pb-6 lg:pb-12">
                <div className="mb-10">
                  <h2 className="text-sm font-black text-primary transition-all duration-300 uppercase tracking-[0.2em]">Basic Profile</h2>
                </div>
                {/* ... (rest of the form fields same as before) */}
                <div className="space-y-7">
                  <div>
                    <label className="text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest mb-2.5 block ml-1">Customer Type</label>
                    <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-card/50 transition-colors duration-300 border border-border transition-colors duration-300 focus:border-primary transition-all duration-300 focus:bg-card transition-colors duration-300 rounded-2xl py-4 px-5 text-sm transition-all outline-none cursor-pointer">
                      <option value="Saloon">Saloon</option>
                      <option value="Wholesale">Wholesale</option>
                      <option value="Retail">Retail</option>
                    </select>
                  </div>
                  <div>
                    <label className={`text-[10px] font-black uppercase tracking-widest mb-2.5 block ml-1 ${errors.saloon_name ? 'text-red-500' : 'text-textMain/50 transition-colors duration-300'}`}>Business Name *</label>
                    <div className="relative group">
                      <Building2 className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${errors.saloon_name ? 'text-red-400' : 'text-textMain/50 transition-colors duration-300 group-focus-within:text-primary transition-all duration-300'}`} size={18} />
                      <input type="text" name="saloon_name" value={formData.saloon_name} onChange={handleChange} placeholder="e.g. Elegance Hair Studio" 
                        className={`w-full bg-card/50 transition-colors duration-300 border rounded-2xl py-4 pl-13 pr-5 text-sm transition-all outline-none ${errors.saloon_name ? 'border-red-500 focus:border-red-600 bg-red-50/30' : 'border-border transition-colors duration-300 focus:border-primary transition-all duration-300 focus:bg-card transition-colors duration-300'}`} />
                    </div>
                  </div>
                  <div>
                    <label className={`text-[10px] font-black uppercase tracking-widest mb-2.5 block ml-1 ${errors.owner_name ? 'text-red-500' : 'text-textMain/50 transition-colors duration-300'}`}>Owner Full Name *</label>
                    <div className="relative group">
                      <UserCircle className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${errors.owner_name ? 'text-red-400' : 'text-textMain/50 transition-colors duration-300 group-focus-within:text-primary transition-all duration-300'}`} size={18} />
                      <input type="text" name="owner_name" value={formData.owner_name} onChange={handleChange} placeholder="Mr/Ms. Owner Name" 
                        className={`w-full bg-card/50 transition-colors duration-300 border rounded-2xl py-4 pl-13 pr-5 text-sm transition-all outline-none ${errors.owner_name ? 'border-red-500 focus:border-red-600 bg-red-50/30' : 'border-border transition-colors duration-300 focus:border-primary transition-all duration-300 focus:bg-card transition-colors duration-300'}`} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className={`text-[10px] font-black uppercase tracking-widest mb-2.5 block ml-1 ${errors.phone1 ? 'text-red-500' : 'text-textMain/50 transition-colors duration-300'}`}>Primary Phone *</label>
                      <div className="relative group">
                        <Phone className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${errors.phone1 ? 'text-red-400' : 'text-textMain/50 transition-colors duration-300 group-focus-within:text-primary transition-all duration-300'}`} size={16} />
                        <input type="text" name="phone1" value={formData.phone1} onChange={handleChange} placeholder="07x..." 
                          className={`w-full bg-card/50 transition-colors duration-300 border rounded-2xl py-4 pl-12 pr-4 text-sm transition-all outline-none ${errors.phone1 ? 'border-red-500 focus:border-red-600 bg-red-50/30' : 'border-border transition-colors duration-300 focus:border-primary transition-all duration-300 focus:bg-card transition-colors duration-300'}`} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest mb-2.5 block ml-1">Secondary Phone</label>
                      <input type="text" name="phone2" value={formData.phone2} onChange={handleChange} placeholder="Optional" className="w-full bg-card/50 transition-colors duration-300 border border-border transition-colors duration-300 focus:border-primary transition-all duration-300 focus:bg-card transition-colors duration-300 rounded-2xl py-4 px-5 text-sm transition-all outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-12">
                <div className="mb-10">
                  <h2 className="text-sm font-black text-primary transition-all duration-300 uppercase tracking-[0.2em]">Location & Area</h2>
                </div>
                <div className="space-y-7">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className={`text-[10px] font-black uppercase tracking-widest mb-2.5 block ml-1 ${errors.lane1 ? 'text-red-500' : 'text-textMain/50 transition-colors duration-300'}`}>Address Lane 01 *</label>
                      <input type="text" name="lane1" value={formData.lane1} onChange={handleChange} placeholder="No / Street" 
                        className={`w-full bg-card/50 transition-colors duration-300 border rounded-2xl py-4 px-5 text-sm transition-all outline-none ${errors.lane1 ? 'border-red-500 focus:border-red-600 bg-red-50/30' : 'border-border transition-colors duration-300 focus:border-primary transition-all duration-300 focus:bg-card transition-colors duration-300'}`} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest mb-2.5 block ml-1">Address Lane 02</label>
                      <input type="text" name="lane2" value={formData.lane2} onChange={handleChange} placeholder="City / Area" className="w-full bg-card/50 transition-colors duration-300 border border-border transition-colors duration-300 focus:border-primary transition-all duration-300 focus:bg-card transition-colors duration-300 rounded-2xl py-4 px-5 text-sm transition-all outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className={`text-[10px] font-black uppercase tracking-widest mb-2.5 block ml-1 ${errors.district ? 'text-red-500' : 'text-textMain/50 transition-colors duration-300'}`}>Operational District *</label>
                    <div className="relative group">
                      <MapPin className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${errors.district ? 'text-red-400' : 'text-textMain/50 transition-colors duration-300 group-focus-within:text-primary transition-all duration-300'}`} size={18} />
                      <select name="district" value={formData.district} onChange={handleChange} 
                        className={`w-full bg-card/50 transition-colors duration-300 border rounded-2xl py-4 pl-13 pr-5 text-sm transition-all outline-none appearance-none cursor-pointer ${errors.district ? 'border-red-500 focus:border-red-600 bg-red-50/30' : 'border-border transition-colors duration-300 focus:border-primary transition-all duration-300 focus:bg-card transition-colors duration-300'}`}>
                        <option value="">Select District</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest mb-2.5 block ml-1 flex items-center gap-2">
                      <Info size={14} className="text-primary transition-all duration-300" /> Additional Notes
                    </label>
                    <textarea name="additional_note" value={formData.additional_note} onChange={handleChange} rows="3" placeholder="Special instructions..." className="w-full bg-card/50 transition-colors duration-300 border border-border transition-colors duration-300 focus:border-primary transition-all duration-300 focus:bg-card transition-colors duration-300 rounded-2xl py-4 px-5 text-sm transition-all outline-none resize-none"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 md:px-12 md:pb-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-border mt-4 bg-card/30 transition-colors duration-300">
              <button type="button" onClick={handleClear} className="group flex items-center gap-3 bg-card transition-colors duration-300 border border-border transition-colors duration-300 hover:border-red-100 hover:bg-red-50 text-textMain/50 transition-colors duration-300 hover:text-red-600 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                <RefreshCcw size={16} className="group-hover:rotate-180 transition-all duration-500" />
                Reset Form
              </button>
              <button type="submit" disabled={loading} className="w-full sm:w-auto bg-black text-white hover:bg-primary transition-all duration-300 hover:text-textMain transition-colors duration-300 px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-gray-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
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