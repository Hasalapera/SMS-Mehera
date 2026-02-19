import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  User, Mail, Phone, CreditCard, MapPin, 
  Shield, Calendar, Camera, Edit2, Save, X, Lock, KeyRound, RefreshCw, Loader2
} from 'lucide-react';

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [user, setUser] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); 

  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const fallbackAvatar = "https://i.pravatar.cc/150?u=hasala";

  const [formData, setFormData] = useState({
    full_name: '',
    contact_no: '',
    dob: '',
    nic_no: '',
    picture_url: fallbackAvatar
  });

  useEffect(() => {
  const fetchLatestData = async () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      
      try {
        // Backend එකෙන් අලුත්ම දත්ත ලබාගැනීම (Port 5001 පාවිච්චි කරන බව මතක තබාගන්න)
        const response = await axios.get(`http://localhost:5001/api/users/profile/${parsedUser.user_id}`);
        const latestUser = response.data.user;

        // Local Storage එකේ තියෙන පරණ දත්ත අලුත් දත්ත වලින් යාවත්කාලීන කිරීම
        localStorage.setItem('user', JSON.stringify(latestUser));
        
        // State එක Update කිරීම
        setUser(latestUser);
        setFormData({
          full_name: latestUser.full_name || '',
          contact_no: latestUser.contact_no || '',
          dob: formatDateForInput(latestUser.dob), 
          nic_no: latestUser.nic_no || '',
          picture_url: latestUser.picture_url || fallbackAvatar
        });
      } catch (err) {
        console.error("Failed to sync profile data:", err);
        // Backend එක සම්බන්ධ කරගත නොහැකි නම් පමණක් පරණ දත්ත පෙන්වන්න
        setUser(parsedUser);
      }
    }
  };

  fetchLatestData();
}, []);

  // --- Password Update Logic (Moved inside the component) ---
  const handlePasswordUpdate = async () => {
    if (passData.newPassword !== passData.confirmPassword) {
      alert("System Error: New security keys do not match. Please verify.");
      return;
    }

    if (passData.currentPassword === passData.newPassword) {
      alert("Security Alert: New key cannot be the same as the current key.");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await axios.put('http://localhost:5001/api/users/change-password', {
        user_id: user.user_id,
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });

      if (response.status === 200) {
        alert("Registry Sync: Security key updated successfully.");
        setShowPassModal(false);
        setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      console.error("Security update failed:", err);
      alert(err.response?.data?.message || "Critical Error: Synchronization failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    const uploadData = new FormData();
    uploadData.append("user_id", user.user_id);
    uploadData.append("full_name", formData.full_name);
    uploadData.append("contact_no", formData.contact_no);
    uploadData.append("dob", formData.dob);
    uploadData.append("nic_no", formData.nic_no);
    
    const file = fileInputRef.current?.files[0];
    if (file) {
      uploadData.append("image", file);
    } else {
      uploadData.append("picture_url", formData.picture_url);
    }

    try {
      const response = await axios.put('http://localhost:5001/api/users/update-profile', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 200) {
        const updatedUser = response.data.user;
        
        // 1. LocalStorage එකේ අලුත් දත්ත සේව් කිරීම
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // 2. දැනට ඉන්න පේජ් එකේ (UserProfile) State එක update කිරීම
        setUser(updatedUser);
        
        // 3. මෙන්න මේ පේළිය අනිවාර්යයෙන්ම දාන්න - SideBar එකට පණිවිඩය යවන්නේ මේකෙන්
        window.dispatchEvent(new Event('storage')); 
        
        setIsEditing(false);
        alert("Profile successfully synchronized with registry.");
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert("System synchronization failed. Please verify connection.");
    } finally {
      setIsUpdating(false);
    }
  };

  // ... Helpers (handleImageSelect, startCamera, capturePhoto, Date Logic) ටික ඔයා ලියපු විදිහටම තබා ගන්න ...
  const handleImageSelect = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setFormData(prev => ({ ...prev, picture_url: e.target.result }));
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { setIsCapturing(false); }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
        setFormData(prev => ({ ...prev, picture_url: URL.createObjectURL(file) }));
        const stream = video.srcObject;
        stream.getTracks().forEach(track => track.stop());
        setIsCapturing(false);
      }, 'image/jpeg', 0.6);
    }
  };

  const getCleanDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return null;
    const onlyDate = dateString.split('T')[0]; 
    const parts = onlyDate.split('-'); 
    return parts.length === 3 ? { year: parts[0], month: parts[1], day: parts[2], formatted: onlyDate } : null;
  };

  const formatDateDisplay = (dateString) => {
    const clean = getCleanDate(dateString);
    if (!clean) return "Not Provided";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${clean.day} ${months[parseInt(clean.month, 10) - 1]} ${clean.year}`;
  };

  const formatDateForInput = (dateString) => {
    const clean = getCleanDate(dateString);
    return clean ? clean.formatted : '';
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPassData({ ...passData, [e.target.name]: e.target.value });

  if (!user) return <div className="p-10 text-center font-bold italic text-gray-500 tracking-widest">Initialising Profile Registry...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500 relative text-left">
      {/* --- Profile Header Card --- */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-10 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50">
        <div className="relative group">
          <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-[#b4a460]/20 shadow-xl bg-gray-100">
            {isCapturing ? <video ref={videoRef} autoPlay className="w-full h-full object-cover scale-x-[-1]" /> : <img src={formData.picture_url} alt="User" className="w-full h-full object-cover" />}
          </div>
          <div className="absolute -bottom-2 -right-2 flex gap-1">
            {isCapturing ? <button onClick={capturePhoto} className="p-2 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 transition-colors"><Save size={16} /></button> : <button onClick={() => isEditing && fileInputRef.current.click()} disabled={!isEditing} className={`p-2 rounded-xl shadow-lg transition-colors ${isEditing ? 'bg-black text-white hover:bg-[#b4a460]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}><Camera size={18} /></button>}
            {isEditing && !isCapturing && <button onClick={startCamera} className="p-2 bg-black text-white rounded-xl shadow-lg hover:bg-[#b4a460]"><RefreshCw size={16} /></button>}
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageSelect(e.target.files[0])} />
          <canvas ref={canvasRef} className="hidden" />
        </div>
        
        <div className="text-center md:text-left flex-1">
          {isEditing ? <input name="full_name" value={formData.full_name} onChange={handleInputChange} className="text-2xl font-serif text-black border-b-2 border-[#b4a460] focus:outline-none mb-2 bg-transparent w-full max-w-md px-1" /> : <h1 className="text-3xl font-serif text-black mb-1">{formData.full_name || "User Name"}</h1>}
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
            <span className="px-3 py-1 bg-[#b4a460]/10 text-[#8a7b42] rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#b4a460]/20">{user.role}</span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 ${user.is_active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{user.is_active ? 'Active Account' : 'Inactive'}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-2">
          <button onClick={() => setIsEditing(!isEditing)} className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-2xl font-bold text-sm hover:scale-105 transition-all shadow-lg min-w-[160px]">{isEditing ? <><X size={16} /> Cancel Edit</> : <><Edit2 size={16} /> Edit Profile</>}</button>
          {!isEditing && <button onClick={() => setShowPassModal(true)} className="flex items-center justify-center gap-2 px-6 py-3 bg-[#b4a460] text-black rounded-2xl font-bold text-sm hover:scale-105 transition-all shadow-lg min-w-[160px]"><KeyRound size={16} /> Security</button>}
        </div>
      </div>

      {/* --- Main Content Sections --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-xl font-serif mb-8 flex items-center gap-3 text-black"><div className="p-2 bg-[#b4a460]/10 rounded-lg text-[#b4a460]"><User size={22} /></div>Identity Registry</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
              <InfoItem icon={Mail} label="Email Address" value={user.email} />
              <InfoItem name="contact_no" icon={Phone} label="Contact No" value={formData.contact_no} isEditable={isEditing} onChange={handleInputChange} />
              <InfoItem name="nic_no" icon={CreditCard} label="NIC" value={formData.nic_no} isEditable={isEditing} onChange={handleInputChange} />
              <InfoItem name="dob" icon={Calendar} label="Date of Birth" value={isEditing ? formData.dob : formatDateDisplay(formData.dob)} isEditable={isEditing} onChange={handleInputChange} type="date" />
            </div>
          </section>

          {user.role === 'sales_rep' && (
            <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h2 className="text-xl font-serif mb-8 flex items-center gap-3 text-black"><div className="p-2 bg-[#b4a460]/10 rounded-lg text-[#b4a460]"><MapPin size={22} /></div>Assigned Operational Sectors</h2>
              <div className="flex flex-wrap gap-3">{user.districts?.length > 0 ? user.districts.map((d, i) => <span key={i} className="px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-600 shadow-sm">{d}</span>) : <p className="text-sm text-gray-400 italic font-medium px-2">No operational sectors assigned.</p>}</div>
            </section>
          )}

          {isEditing && (
            <div className="flex justify-end pt-4">
              <button onClick={handleUpdateProfile} disabled={isUpdating} className="w-full sm:w-auto px-12 py-4 bg-black text-white font-bold rounded-[1.5rem] shadow-2xl shadow-black/20 hover:bg-[#b4a460] transition-all flex items-center justify-center gap-3 text-base">
                {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {isUpdating ? "Synchronizing..." : "Commit Records"}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <section className="bg-black text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#b4a460]/10 rounded-full blur-3xl"></div>
            <h2 className="text-lg font-serif mb-8 flex items-center gap-3 text-[#b4a460]"><Shield size={20} /> System Credentials</h2>
            <div className="space-y-6 relative z-10">
              <div><p className="text-[10px] uppercase text-gray-500 font-bold tracking-[0.2em] mb-2">System UUID</p><p className="text-xs font-mono opacity-80 leading-relaxed">{user.user_id}</p></div>
              <div className="pt-6 border-t border-white/10"><p className="text-[10px] uppercase text-gray-500 font-bold tracking-[0.2em] mb-2">Registry Joined</p><p className="text-sm font-medium">{user.created_at ? new Date(user.created_at).toDateString() : "Live Record"}</p></div>
            </div>
          </section>
        </div>
      </div>

      {/* --- Password Modal --- */}
      {showPassModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-serif text-black flex items-center gap-3"><Lock size={24} className="text-[#b4a460]" /> Security Registry</h2>
              <button onClick={() => setShowPassModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} className="text-gray-400" /></button>
            </div>
            <div className="space-y-6">
              <PasswordInput label="Current Security Key" name="currentPassword" onChange={handlePasswordChange} />
              <PasswordInput label="New Security Key" name="newPassword" onChange={handlePasswordChange} />
              <PasswordInput label="Verify New Key" name="confirmPassword" onChange={handlePasswordChange} />
              <button onClick={handlePasswordUpdate} disabled={isUpdating} className="w-full py-5 bg-black text-white font-bold rounded-2xl mt-6 hover:bg-[#b4a460] transition-all text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                {isUpdating && <Loader2 className="animate-spin" size={18} />}
                Update Security Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ... Internal Components ...
const InfoItem = ({ name, icon: Icon, label, value, isEditable, onChange, type = "text" }) => (
  <div className="space-y-2">
    <p className="text-[10px] uppercase text-gray-400 font-bold tracking-[0.15em] flex items-center gap-2"><Icon size={14} className="text-[#b4a460]" /> {label}</p>
    {isEditable ? <input type={type} name={name} value={value || ''} onChange={onChange} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#b4a460]/20 focus:border-[#b4a460] transition-all" /> : <p className="text-sm font-bold text-gray-800 px-1">{value || "Not Recorded"}</p>}
  </div>
);

const PasswordInput = ({ label, name, onChange }) => (
  <div className="space-y-2">
    <p className="text-[10px] uppercase text-gray-400 font-bold tracking-[0.1em]">{label}</p>
    <input type="password" name={name} onChange={onChange} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:border-[#b4a460] focus:ring-2 focus:ring-[#b4a460]/10 focus:outline-none transition-all" />
  </div>
);

export default UserProfile;