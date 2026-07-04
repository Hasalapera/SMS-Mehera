import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  UserPlus, Phone, MapPin, Building2, UserCircle, 
  Loader2, ArrowLeft, RefreshCcw, CheckCircle2, Info, Mail, ChevronDown, Check
} from 'lucide-react';
import api from '../../../api/axiosInstance';
import { toast } from 'react-hot-toast';

import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const successToastStyles = {
  style: {
    borderRadius: '1.5rem',
    background: '#141414',
    color: '#b4a460',
    fontSize: '10px',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    padding: '16px 24px',
    border: '1px solid rgba(180, 164, 96, 0.2)',
  },
  iconTheme: {
    primary: '#b4a460',
    secondary: '#141414',
  },
};

const errorToastStyles = {
  ...successToastStyles,
  style: {
    ...successToastStyles.style,
    color: '#F87171', // Tailwind's red-400
    border: '1px solid rgba(248, 113, 113, 0.2)',
  },
  iconTheme: { ...successToastStyles.iconTheme, primary: '#F87171' },
};

const AddCustomer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { addNotification } = useNotifications();
  const { user } = useAuth();   

  const [loading, setLoading] = useState(false);

  const [customerCount, setCustomerCount] = useState(0);
  const [errors, setErrors] = useState({});

  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);

  const isFromAssignUser = location.state?.from === '/assign-user';

  const initialFormState = {
    type: 'Saloon',
    saloon_name: '',
    owner_name: '',
    email: '',
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
  //       const res = await api.get('/customers/count');
  //       setCustomerCount(res.data.count || 0);
  //     } catch (err) { console.error(err); }
  //   };
  //   fetchCustomerCount();
  // }, []);

  const fetchCustomerCount = async () => {
    try {
      const res = await api.get('/customers/count');
      setCustomerCount(res.data.count || 0);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchCustomerCount();
  }, []);

  useEffect(() => {
    const closeDropdowns = () => {
        setIsTypeDropdownOpen(false);
        setIsDistrictDropdownOpen(false);
    };
    document.addEventListener('click', closeDropdowns);
    return () => document.removeEventListener('click', closeDropdowns);
  }, []);

  const nextCustomerId = `CUS-${String(customerCount + 1).padStart(4, '0')}`;
  const districts = ["Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya", "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee", "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", "Moneragala", "Ratnapura", "Kegalle"];

  const isValidPhone = (phone) => {
    return /^0\d{9}$/.test(phone);
  };

  const isValidEmail = (email) => {
    return email.trim().includes("@") && !email.includes(" ");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let cleanValue = value;

    // Phone fields: only digits allowed + max 10 digits
    if (name === "phone1" || name === "phone2") {
      cleanValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData({ ...formData, [name]: cleanValue });

    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
    }
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to reset the form?")) {
      setFormData(initialFormState);
      setErrors({});
      toast.success("Form reset successfully", successToastStyles);
    }
  };

  const saveNotificationToDB = async (type, title, message, severity) => {
    try {
      const token = localStorage.getItem('accessToken');
      await api.post('/notifications',
        { type, title, message, severity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Failed to save notification:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.saloon_name.trim()) {
      newErrors.saloon_name = "Business name is required.";
    }

    if (!formData.owner_name.trim()) {
      newErrors.owner_name = "Owner name is required.";
    }

    if (!formData.phone1.trim()) {
      newErrors.phone1 = "Primary phone number is required.";
    } else if (!isValidPhone(formData.phone1)) {
      newErrors.phone1 = "Phone number must start with 0 and contain exactly 10 digits.";
    }

    if (formData.phone2.trim() && !isValidPhone(formData.phone2)) {
      newErrors.phone2 = "Secondary phone number must start with 0 and contain exactly 10 digits.";
    }

    if (formData.email.trim() && !isValidEmail(formData.email)) {
      newErrors.email = "Email address must contain @ symbol.";
    }

    if (!formData.lane1.trim()) {
      newErrors.lane1 = "Address lane 01 is required.";
    }

    if (!formData.district) {
      newErrors.district = "District is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please correct the errors before submitting.", errorToastStyles);
      return;
    }

    setLoading(true);
    try {
      const submissionData = { 
        ...formData, 
        customer_display_id: nextCustomerId, 
        address: `${formData.lane1}, ${formData.lane2}` 
      };

      await api.post('/customers/add', submissionData);
      toast.success("Customer Registered Successfully!", successToastStyles);

      // Create notification
      await saveNotificationToDB(
        'customer',
        '🏪 New Customer Registered',
        `${formData.saloon_name} (${formData.type}) - ${formData.district} district registered by ${user?.name} (${user?.role?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())})`,
        'info'
      );
      addNotification({
        type: 'customer',
        title: '🏪 New Customer Registered',
        message: `${formData.saloon_name} (${formData.type}) - ${formData.district} district registered by ${user?.name} (${user?.role?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())})`,
        severity: 'info'
      });

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
      toast.error(err.response?.data?.message || "Registration failed", errorToastStyles);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 py-6 md:py-10 px-4 md:px-8 font-sans">
      
      <div className="max-w-6xl mx-auto">
        {isFromAssignUser && (
          <button 
            onClick={() => navigate('/assign-user')}
            className="mb-6 flex items-center gap-2 text-textMain/50 hover:text-textMain font-black text-[10px] uppercase tracking-widest transition-all"
          >
            <ArrowLeft size={16} /> Back to Assign User Section
          </button>
        )}
        <div className="bg-card transition-colors duration-300 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden">
          

          {/* Header */}
          <div className="bg-background transition-all duration-300 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border">
            <div className="flex items-center gap-5">
              {/* Icon Box with Gold Color */}
              <div className="p-3 bg-primary rounded-2xl text-textMain shadow-lg shadow-[#b4a460]/20 flex items-center justify-center">
                <UserPlus size={24} md:size={28} strokeWidth={2.5} />
              </div>
              
              <div>

                <h1 className="text-xl md:text-3xl font-black text-textMain tracking-tight uppercase">Register New Customer</h1>
                <p className="text-textMain/50 text-xs font-bold uppercase tracking-[0.2em] mt-1">Mehera International</p>

              </div>
            </div>
            
            <div className="flex items-center gap-4">

               <div className="bg-card px-4 py-2 md:px-5 md:py-2.5 rounded-2xl border border-border flex items-center gap-3">
                  <span className="text-[10px] font-black text-textMain/50 uppercase tracking-widest">ID Reference</span>
                  <span className="text-base md:text-lg font-black text-primary">{nextCustomerId}</span>
               </div>

            </div>
          </div>

          <div className="px-6 md:px-10">
            <div className="w-full h-[1px] bg-gray-100"></div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-6 md:p-12 pb-6 lg:pb-12">
                <div className="mb-8">
                  <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em]">Basic Profile</h2>
                </div>
                {/* ... (rest of the form fields same as before) */}
                <div className="space-y-6">
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <label className="text-[9px] md:text-[10px] font-black text-textMain/50 uppercase tracking-widest mb-2 block ml-1">Customer Type</label>
                    <button
                      type="button"
                      onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                      className="w-full bg-card/50 border border-border rounded-2xl py-3.5 px-5 text-sm transition-all outline-none flex items-center justify-between text-left"
                    >
                      <span className="font-bold">{formData.type}</span>
                      <ChevronDown size={18} className={`transition-transform duration-300 ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isTypeDropdownOpen && (
                      <div className="absolute top-full mt-2 w-full bg-card rounded-2xl shadow-2xl border border-border py-2 z-20 animate-in fade-in slide-in-from-top-2">
                        {['Saloon', 'Wholesale', 'Retail'].map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              handleChange({ target: { name: 'type', value: type } });
                              setIsTypeDropdownOpen(false);
                            }}
                            className="w-full text-left px-5 py-3 text-sm font-bold hover:bg-primary/10 hover:text-primary flex items-center justify-between"
                          >
                            {type}
                            {formData.type === type && <Check size={16} className="text-primary" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-2 block ml-1 ${errors.saloon_name ? 'text-red-500' : 'text-textMain/50'}`}>Business Name *</label>
                    <div className="relative group">
                      <Building2 className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.saloon_name ? 'text-red-400' : 'text-textMain/50 group-focus-within:text-primary'}`} size={16} />
                      <input type="text" name="saloon_name" value={formData.saloon_name} onChange={handleChange} placeholder="e.g. Elegance Hair Studio" 
                        className={`w-full bg-card/50 border rounded-2xl py-3.5 pl-12 pr-5 text-sm transition-all outline-none ${errors.saloon_name ? 'border-red-500 focus:border-red-600 bg-red-50/30' : 'border-border focus:border-primary focus:bg-card'}`} />
                    </div>
                  </div>
                  <div>
                    <label className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-2 block ml-1 ${errors.owner_name ? 'text-red-500' : 'text-textMain/50'}`}>Owner Full Name *</label>
                    <div className="relative group">
                      <UserCircle className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.owner_name ? 'text-red-400' : 'text-textMain/50 group-focus-within:text-primary'}`} size={16} />
                      <input type="text" name="owner_name" value={formData.owner_name} onChange={handleChange} placeholder="Mr/Ms. Owner Name" 
                        className={`w-full bg-card/50 border rounded-2xl py-3.5 pl-12 pr-5 text-sm transition-all outline-none ${errors.owner_name ? 'border-red-500 focus:border-red-600 bg-red-50/30' : 'border-border focus:border-primary focus:bg-card'}`} />
                    </div>
                  </div>
                  <div>
                    <label
                      className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-2 block ml-1 flex items-center gap-2 ${
                        errors.email ? "text-red-500" : "text-textMain/50"
                      }`}
                    >
                      Email Address*
                    </label>

                    <div className="relative group">
                      <Mail
                        className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                          errors.email
                            ? "text-red-400"
                            : "text-textMain/50 group-focus-within:text-primary"
                        }`}
                        size={16}
                      />

                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="customer@example.com"
                        className={`w-full bg-card/50 border rounded-2xl py-3.5 pl-12 pr-4 text-sm transition-all outline-none ${
                          errors.email
                            ? "border-red-500 focus:border-red-600 bg-red-50/30"
                            : "border-border focus:border-primary focus:bg-card"
                        }`}
                      />
                    </div>

                    {errors.email && (
                      <p className="mt-2 ml-1 text-[10px] font-bold text-red-500">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-2 block ml-1 ${
                          errors.phone1 ? "text-red-500" : "text-textMain/50"
                        }`}
                      >
                        Primary Phone *
                      </label>

                      <div className="relative group">
                        <Phone
                          className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                            errors.phone1
                              ? "text-red-400"
                              : "text-textMain/50 group-focus-within:text-primary"
                          }`}
                          size={16}
                        />

                        <input
                          type="tel"
                          name="phone1"
                          value={formData.phone1}
                          onChange={handleChange}
                          placeholder="07xxxxxxxx"
                          inputMode="numeric"
                          maxLength={10}
                          pattern="0[0-9]{9}"
                          className={`w-full bg-card/50 border rounded-2xl py-3.5 pl-12 pr-4 text-sm transition-all outline-none ${
                            errors.phone1
                              ? "border-red-500 focus:border-red-600 bg-red-50/30"
                              : "border-border focus:border-primary focus:bg-card"
                          }`}
                        />
                      </div>

                      {errors.phone1 && (
                        <p className="mt-2 ml-1 text-[10px] font-bold text-red-500">
                          {errors.phone1}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-2 block ml-1 ${
                          errors.phone2 ? "text-red-500" : "text-textMain/50"
                        }`}
                      >
                        Secondary Phone
                      </label>

                      <input
                        type="tel"
                        name="phone2"
                        value={formData.phone2}
                        onChange={handleChange}
                        placeholder="Optional"
                        inputMode="numeric"
                        maxLength={10}
                        pattern="0[0-9]{9}"
                        className={`w-full bg-card/50 border rounded-2xl py-3.5 px-5 text-sm transition-all outline-none ${
                          errors.phone2
                            ? "border-red-500 focus:border-red-600 bg-red-50/30"
                            : "border-border focus:border-primary focus:bg-card"
                        }`}
                      />

                      {errors.phone2 && (
                        <p className="mt-2 ml-1 text-[10px] font-bold text-red-500">
                          {errors.phone2}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-12">
                <div className="mb-8">
                  <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em]">Location & Area</h2>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-2 block ml-1 ${errors.lane1 ? 'text-red-500' : 'text-textMain/50'}`}>Address Lane 01 *</label>
                      <input type="text" name="lane1" value={formData.lane1} onChange={handleChange} placeholder="No / Street" 
                        className={`w-full bg-card/50 border rounded-2xl py-3.5 px-5 text-sm transition-all outline-none ${errors.lane1 ? 'border-red-500 focus:border-red-600 bg-red-50/30' : 'border-border focus:border-primary focus:bg-card'}`} />
                    </div>
                    <div>
                      <label className="text-[9px] md:text-[10px] font-black text-textMain/50 uppercase tracking-widest mb-2 block ml-1">Address Lane 02</label>
                      <input type="text" name="lane2" value={formData.lane2} onChange={handleChange} placeholder="City / Area" className="w-full bg-card/50 border border-border focus:border-primary focus:bg-card rounded-2xl py-3.5 px-5 text-sm transition-all outline-none" />
                    </div>
                  </div>
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <label className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-2 block ml-1 ${errors.district ? 'text-red-500' : 'text-textMain/50'}`}>Operational District *</label>
                    <button
                        type="button"
                        onClick={() => setIsDistrictDropdownOpen(!isDistrictDropdownOpen)}
                        className={`w-full bg-card/50 border rounded-2xl py-3.5 px-5 text-sm transition-all outline-none flex items-center justify-between text-left ${errors.district ? 'border-red-500' : 'border-border'}`}
                    >
                        <div className="flex items-center gap-3">
                            <MapPin className={`transition-colors ${errors.district ? 'text-red-400' : 'text-textMain/50'}`} size={16} />
                            <span className={`font-bold ${formData.district ? 'text-textMain' : 'text-textMain/60'}`}>
                                {formData.district || 'Select District'}
                            </span>
                        </div>
                        <ChevronDown size={18} className={`transition-transform duration-300 ${isDistrictDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isDistrictDropdownOpen && (
                        <div className="absolute top-full mt-2 w-full bg-card rounded-2xl shadow-2xl border border-border py-2 z-10 animate-in fade-in slide-in-from-top-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {districts.map(d => (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => {
                                        handleChange({ target: { name: 'district', value: d } });
                                        setIsDistrictDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-5 py-3 text-sm font-bold hover:bg-primary/10 hover:text-primary flex items-center justify-between"
                                >
                                    {d}
                                    {formData.district === d && <Check size={16} className="text-primary" />}
                                </button>
                            ))}
                        </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black text-textMain/50 uppercase tracking-widest mb-2 block ml-1 flex items-center gap-2">
                      <Info size={14} className="text-primary" /> Additional Notes
                    </label>
                    <textarea name="additional_note" value={formData.additional_note} onChange={handleChange} rows="3" placeholder="Special instructions..." className="w-full bg-card/50 border border-border focus:border-primary focus:bg-card rounded-2xl py-3.5 px-5 text-sm transition-all outline-none resize-none"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 md:px-12 md:pb-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border mt-4 bg-card/30">
              <button type="button" onClick={handleClear} className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-card border border-border hover:border-red-100 hover:bg-red-50 text-textMain/50 hover:text-red-600 px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                <RefreshCcw size={16} className="group-hover:rotate-180 transition-all duration-500" />
                Reset Form
              </button>
              <button type="submit" disabled={loading} className="w-full sm:w-auto bg-black text-white hover:bg-primary hover:text-textMain px-12 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-gray-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
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