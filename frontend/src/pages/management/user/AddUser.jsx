import React, { useState } from 'react';
import { UserPlus, Mail, Phone, Calendar, ShieldCheck, IdCard, MapPin, Loader2, ArrowLeft } from 'lucide-react';
import api from '../../../api/axiosInstance';
import { toast } from 'react-hot-toast'; 
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

const AddUser = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotifications();

  const isFromAssignUser = location.state?.from === '/assign-user'; // Check if navigated from AssignUser page
  const defaultRole = location.state?.defaultRole || 'sales_rep'; // Get default role from navigation state
  const todayString = new Date().toISOString().slice(0, 10);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: defaultRole,
    contact_no: '',
    dob: '',
    nic_no: '', 
    address: '',
    gender: '',
    selectedDistricts: [] 
});

const districts = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya", 
  "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar", 
  "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee", 
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", 
  "Moneragala", "Ratnapura", "Kegalle"
];

const getBirthdayFromNIC = (nic) => {
  let year, days;

  if (nic.length === 10) {
    year = parseInt("19" + nic.substring(0, 2));
    days = parseInt(nic.substring(2, 5));
  } else if (nic.length === 12) {
    year = parseInt(nic.substring(0, 4));
    days = parseInt(nic.substring(4, 7));
  } else {
    return null;
  }

  if (days > 500) days -= 500;

  // Important: Sri Lankan NICs consider February 29th to be every year.
// So if there are 60 or more days in a non-leap year, 
// JavaScript advances one day, so one must be subtracted.
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  if (!isLeap && days >= 60) {
    days -= 1;
  }

  //prevent Timezone problem
  const dob = new Date(year, 0); 
  dob.setDate(days);

  // instead of ISO string get YYYY-MM-DD format 
  const y = dob.getFullYear();
  const m = String(dob.getMonth() + 1).padStart(2, '0');
  const d = String(dob.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
};

  // const handleChange = (e) => {
  //   setFormData({ ...formData, [e.target.name]: e.target.value });
  // };

const handleChange = (e) => {
  const { name, value } = e.target;

  let cleanValue = value;

  if (name === "contact_no") {
    cleanValue = value.replace(/\D/g, "").slice(0, 10);
  }

  if (name === "nic_no") {
    cleanValue = value
      .toUpperCase()
      .replace(/[^0-9VX]/g, "")
      .slice(0, 12);
  }

  let updatedData = { ...formData, [name]: cleanValue };

  if (name === "nic_no") {
    const extractedDob = getBirthdayFromNIC(cleanValue);
    if (extractedDob) {
      updatedData.dob = extractedDob;
    }
  }

  if (name === "role" && cleanValue !== "sales_rep") {
    updatedData.selectedDistricts = [];
  }

  setFormData(updatedData);

  if (errors[name]) {
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  if (name === "role" && errors.selectedDistricts) {
    setErrors((prev) => ({ ...prev, selectedDistricts: "" }));
  }
};

const handleDistrictChange = (district) => {
  const updated = formData.selectedDistricts.includes(district)
    ? formData.selectedDistricts.filter((d) => d !== district)
    : [...formData.selectedDistricts, district];

  setFormData({ ...formData, selectedDistricts: updated });

  if (errors.selectedDistricts) {
    setErrors((prev) => ({ ...prev, selectedDistricts: "" }));
  }
};

const getAgeFromDob = (dob) => {
  if (!dob) return 0;

  const birthDate = new Date(`${dob}T00:00:00`);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

const showValidationToast = (validationErrors) => {
  const errorMessages = Object.values(validationErrors).filter(Boolean);

  if (errorMessages.length === 0) return;

  const firstError = errorMessages[0];
  const remainingCount = errorMessages.length - 1;

  if (remainingCount > 0) {
    toast.error(`${firstError} (${remainingCount} more issue${remainingCount > 1 ? "s" : ""} found)`);
  } else {
    toast.error(firstError);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const {
    nic_no,
    dob,
    email,
    contact_no,
    name,
    role,
    selectedDistricts,
    address,
    gender,
  } = formData;

  const newErrors = {};

  if (!name.trim()) {
    newErrors.name = "Full name is required.";
  }

  if (!email.trim()) {
    newErrors.email = "Email address is required.";
  } else if (!email.includes("@") || email.includes(" ")) {
    newErrors.email = "Email address must contain @ symbol.";
  }

  if (!role) {
    newErrors.role = "User role is required.";
  }

  if (!contact_no.trim()) {
    newErrors.contact_no = "Contact number is required.";
  } else if (!/^0\d{9}$/.test(contact_no)) {
    newErrors.contact_no =
      "Contact number must start with 0 and contain exactly 10 digits.";
  }

  if (!nic_no.trim()) {
    newErrors.nic_no = "NIC number is required.";
  } else if (!/^([0-9]{9}[VX]|[0-9]{12})$/.test(nic_no.trim().toUpperCase())) {
    newErrors.nic_no = "NIC must be 12 digits or 9 digits followed by V/X.";
  }

  if (!dob) {
    newErrors.dob = "Date of birth is required.";
  } else if (dob > todayString) {
    newErrors.dob = "Birth date cannot be a future date.";
  } else if (getAgeFromDob(dob) < 16) {
    newErrors.dob = "User must be at least 16 years old.";
  }

  if (nic_no.trim() && dob) {
    const cleanNIC = nic_no.trim().toUpperCase();
    const dobYear = new Date(`${dob}T00:00:00`).getFullYear().toString();

    if (cleanNIC.length === 10) {
      const nicYearPart = cleanNIC.substring(0, 2);
      const dobYearLastTwo = dobYear.substring(2, 4);

      if (nicYearPart !== dobYearLastTwo) {
        newErrors.nic_no = `NIC old format does not match birth year ${dobYear}.`;
      }
    }

    if (cleanNIC.length === 12) {
      const nicYearPart = cleanNIC.substring(0, 4);

      if (nicYearPart !== dobYear) {
        newErrors.nic_no = `NIC new format does not match birth year ${dobYear}.`;
      }
    }
  }

  if (!address.trim()) {
    newErrors.address = "Residential address is required.";
  }

  if (!gender) {
    newErrors.gender = "Gender is required.";
  }

  if (role === "sales_rep" && selectedDistricts.length === 0) {
    newErrors.selectedDistricts =
      "Please select at least one working district for Sales Rep.";
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    showValidationToast(newErrors);
    return;
  }

  setLoading(true);
  const token = localStorage.getItem("accessToken");

  try {
    const submissionData = {
      ...formData,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      contact_no: contact_no.trim(),
      nic_no: nic_no.trim().toUpperCase(),
      address: address.trim(),
      gender,
      role,
    };

    const response = await api.post("/users/addUser", submissionData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 201) {
      toast.success(`User ${name} added successfully!`);


      if (response.data.notification) {
        addNotification(response.data.notification);
      }

      if (isFromAssignUser) {
        navigate("/assign-user");
      } else {
        setFormData({
          name: "",
          email: "",
          role: "sales_rep",
          contact_no: "",
          dob: "",
          nic_no: "",
          address: "",
          gender: "",
          selectedDistricts: [],
        });
        setErrors({});
      }
    }
  } catch (err) {
    const field = err.response?.data?.field;
    const message =
      err.response?.data?.message || err.message || "Failed to add user";

    if (field) {
      setErrors((prev) => ({ ...prev, [field]: message }));
    }

    toast.error(message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-textMain transition-colors duration-300 flex items-center gap-3">
          <div className="p-2 bg-primary transition-all duration-300 rounded-lg text-textMain transition-colors duration-300">
            <UserPlus size={24} />
          </div>
          Register New Employee
        </h2>
        <p className="text-textMain/50 transition-colors duration-300 text-sm mt-1 ml-12">
          Add a new member to Mehera International. An automated password will be sent via email.
        </p>
      </div>
      <div className="mb-6">
        {isFromAssignUser && (
            <button 
              type="button"
              onClick={() => navigate('/assign-user')}
              className="mb-6 flex items-center gap-2 text-textMain/50 transition-colors duration-300 hover:text-textMain transition-colors duration-300 font-black text-[10px] uppercase tracking-widest transition-all"
            >
              <ArrowLeft size={16} /> Back to Assign User Section
            </button>
          )}
      </div>

      <form onSubmit={handleSubmit} className="bg-card transition-colors duration-300 border border-border transition-colors duration-300 rounded-[2rem] shadow-sm p-8 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-textMain/50 transition-colors duration-300 uppercase ml-1">Full Name</label>
            <div className="relative group">
              <input
                type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="John Doe"
                className="w-full bg-background border border-border text-textMain rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
              <UserPlus className="absolute left-4 top-3.5 text-textMain/50 transition-colors duration-300 group-focus-within:text-primary transition-all duration-300" size={18} />
            </div>
          </div>

          {/* NIC Number */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-textMain/50 transition-colors duration-300 uppercase ml-1">NIC Number</label>
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
                className={`w-full bg-background border text-textMain rounded-xl py-3 pl-11 pr-4 text-sm transition-all focus:ring-2 focus:border-primary outline-none 
                  ${formData.nic_no && !/^([0-9]{9}[xXvV]|[0-9]{12})$/.test(formData.nic_no) 
                    ? 'border-red-500 focus:ring-red-200' 
                    : 'border-border focus:ring-primary/20'}`}
              />
              <IdCard className={`absolute left-4 top-3.5 transition-colors 
                ${formData.nic_no && !/^([0-9]{9}[xXvV]|[0-9]{12})$/.test(formData.nic_no) 
                  ? 'text-red-500' 
                  : 'text-textMain/50 transition-colors duration-300 group-focus-within:text-primary transition-all duration-300'}`} size={18} />
            </div>
            
            {formData.nic_no && !/^([0-9]{9}[xXvV]|[0-9]{12})$/.test(formData.nic_no) && (
              <p className="text-[10px] text-red-500 ml-1 font-medium italic">
                Please follow the NIC format (12 digits or 9 digits with V)
              </p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-textMain/50 transition-colors duration-300 uppercase ml-1">Email Address</label>
            <div className="relative group">
              <input 
                type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="mehera@example.com"
                className="w-full bg-background border border-border text-textMain rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
              <Mail className="absolute left-4 top-3.5 text-textMain/50 transition-colors duration-300 group-focus-within:text-primary transition-all duration-300" size={18} />
            </div>
          </div>

          {/* User Role */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-textMain/50 transition-colors duration-300 uppercase ml-1">System Role</label>
            <div className="relative group">
              <select 
                name="role" value={formData.role} onChange={handleChange} disabled={isFromAssignUser} 
                className="w-full bg-background border border-border text-textMain rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none transition-all"
              >
                <option value="sales_rep">Sales Representative</option>
                <option value="manager">Manager</option>
                <option value="online_store_keeper">Online Store Keeper (Sales)</option>
                <option value="logistics_officer">Logistics Officer (Dispatch)</option>
                <option value="admin">Administrator</option>
              </select>
              <ShieldCheck className="absolute left-4 top-3.5 text-textMain/50 transition-colors duration-300 group-focus-within:text-primary transition-all duration-300" size={18} />
            </div>
          </div>

          {/* Contact Number */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-textMain/50 transition-colors duration-300 uppercase ml-1">Contact No</label>
            <div className="relative group">
              <input
                type="tel"
                name="contact_no"
                required
                value={formData.contact_no}
                onChange={handleChange}
                placeholder="07XXXXXXXX"
                inputMode="numeric"
                maxLength={10}
                pattern="0[0-9]{9}"
                className="w-full bg-background border border-border text-textMain rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
              <Phone className="absolute left-4 top-3.5 text-textMain/50 transition-colors duration-300 group-focus-within:text-primary transition-all duration-300" size={18} />
            </div>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-textMain/50 transition-colors duration-300 uppercase ml-1">Date of Birth</label>
            <div className="relative group">
              <input
                type="date"
                name="dob"
                required
                value={formData.dob}
                onChange={handleChange}
                max={todayString}
                className="w-full bg-background border border-border text-textMain rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
              <Calendar className="absolute left-4 top-3.5 text-textMain/50 transition-colors duration-300 group-focus-within:text-primary transition-all duration-300" size={18} />
            </div>
          </div>

          {/* 🏠 Residential Address Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-textMain/50 uppercase ml-1">Residential Address</label>
            <div className="relative group">
              <input 
                type="text" name="address" value={formData.address} onChange={handleChange}
                placeholder="e.g. No 182, Kuruppumulla Road, Panadura"
                className="w-full bg-background border border-border text-textMain rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
              <MapPin className="absolute left-4 top-3.5 text-textMain/50 group-focus-within:text-primary transition-all duration-300" size={18} />
            </div>
          </div>

          {/* 👫 Gender Dropdown Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-textMain/50 uppercase ml-1">Gender</label>
            <div className="relative group">
              <select 
                name="gender" value={formData.gender} onChange={handleChange}
                className="w-full bg-background border border-border text-textMain rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none transition-all"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <UserPlus className="absolute left-4 top-3.5 text-textMain/50 group-focus-within:text-primary transition-all duration-300" size={18} />
            </div>
          </div>

          {/* District Selection (Only for Sales Rep) */}
          {formData.role === 'sales_rep' && (
            <div className="col-span-1 md:col-span-2 space-y-4 bg-card transition-colors duration-300 p-6 rounded-2xl border border-border transition-colors duration-300">
              <div className="flex items-center gap-2">
                <MapPin className="text-primary transition-all duration-300" size={18} />
                <label className="text-xs font-bold text-textMain/50 transition-colors duration-300 uppercase">Assign Working Districts</label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {districts.map(dist => (
                  <label key={dist} className="flex items-center gap-2 text-xs text-textMain/50 transition-colors duration-300 cursor-pointer hover:text-textMain transition-colors duration-300">
                    <input 
                      type="checkbox" 
                      className="rounded border-border text-primary focus:ring-primary/20 transition-all duration-300"
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
            className="bg-primary transition-all duration-300 text-textMain transition-colors duration-300 px-10 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#b4a460]/20 hover:bg-[#9a8b50] hover:scale-105 transition-all flex items-center gap-2"
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
