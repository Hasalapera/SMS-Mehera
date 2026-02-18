import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Phone, CreditCard, MapPin, 
  Shield, Calendar, Camera, Edit2, Save, X, Lock, KeyRound, RefreshCw
} from 'lucide-react';

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [user, setUser] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
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

  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load user data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setFormData({
        full_name: parsedUser.full_name || '',
        contact_no: parsedUser.contact_no || '',
        dob: formatDateForInput(parsedUser.dob), 
        nic_no: parsedUser.nic_no || '',
        picture_url: parsedUser.picture_url || fallbackAvatar
      });
    }
  }, []);

  /**
   * Image Compression Logic (Low Quality/Optimized)
   */
  const handleImageProcess = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400; // Low resolution optimization
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Quality reduced to 0.6 for faster performance
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setFormData(prev => ({ ...prev, picture_url: dataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  /**
   * Camera Access Logic
   */
  const startCamera = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access denied", err);
      setIsCapturing(false);
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
      setFormData(prev => ({ ...prev, picture_url: dataUrl }));
      
      // Stop Camera
      const stream = video.srcObject;
      stream.getTracks().forEach(track => track.stop());
      setIsCapturing(false);
    }
  };

  // --- Date Logic ---
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

  if (!user) return <div className="p-10 text-center font-bold italic text-gray-500 tracking-widest">Initializing...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500 relative text-left">
      
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-10 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50">
        <div className="relative group">
          <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-[#b4a460]/20 shadow-xl bg-gray-100">
            {isCapturing ? (
              <video ref={videoRef} autoPlay className="w-full h-full object-cover scale-x-[-1]" />
            ) : (
              <img src={formData.picture_url} alt="User" className="w-full h-full object-cover" />
            )}
          </div>
          
          <div className="absolute -bottom-2 -right-2 flex gap-1">
            {isCapturing ? (
              <button onClick={capturePhoto} className="p-2 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 transition-colors">
                <Save size={16} />
              </button>
            ) : (
              <button 
                onClick={() => isEditing && fileInputRef.current.click()} 
                disabled={!isEditing}
                className={`p-2 rounded-xl shadow-lg transition-colors ${isEditing ? 'bg-black text-white hover:bg-[#b4a460]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                <Camera size={18} />
              </button>
            )}
            {isEditing && !isCapturing && (
              <button onClick={startCamera} className="p-2 bg-black text-white rounded-xl shadow-lg hover:bg-[#b4a460]">
                <RefreshCw size={16} />
              </button>
            )}
          </div>
          <input 
            type="file" ref={fileInputRef} className="hidden" accept="image/*" 
            onChange={(e) => handleImageProcess(e.target.files[0])} 
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
        
        <div className="text-center md:text-left flex-1">
          {isEditing ? (
            <input 
              name="full_name" value={formData.full_name} onChange={handleInputChange}
              className="text-2xl font-serif text-black border-b-2 border-[#b4a460] focus:outline-none mb-2 bg-transparent w-full max-w-md px-1"
            />
          ) : (
            <h1 className="text-3xl font-serif text-black mb-1">{formData.full_name || "User Name"}</h1>
          )}
          
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
            <span className="px-3 py-1 bg-[#b4a460]/10 text-[#8a7b42] rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#b4a460]/20">
              {user.role}
            </span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 ${
              user.is_active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
            }`}>
              {user.is_active ? 'Active Account' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-2">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-2xl font-bold text-sm hover:scale-105 transition-all shadow-lg min-w-[160px]"
          >
            {isEditing ? <><X size={16} /> Cancel Edit</> : <><Edit2 size={16} /> Edit Profile</>}
          </button>
          
          {!isEditing && (
            <button 
              onClick={() => setShowPassModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#b4a460] text-black rounded-2xl font-bold text-sm hover:scale-105 transition-all shadow-lg min-w-[160px]"
            >
              <KeyRound size={16} /> Security
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-xl font-serif mb-8 flex items-center gap-3 text-black">
              <div className="p-2 bg-[#b4a460]/10 rounded-lg text-[#b4a460]"><User size={22} /></div>
              Personal Records
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
              <InfoItem icon={Mail} label="Professional Email" value={user.email} />
              <InfoItem 
                name="contact_no" icon={Phone} label="Mobile Number" 
                value={formData.contact_no} isEditable={isEditing} onChange={handleInputChange} 
              />
              <InfoItem 
                name="nic_no" icon={CreditCard} label="National ID Card" 
                value={formData.nic_no} isEditable={isEditing} onChange={handleInputChange} 
              />
              <InfoItem 
                name="dob" icon={Calendar} label="Birth Date" 
                value={isEditing ? formData.dob : formatDateDisplay(formData.dob)} 
                isEditable={isEditing} onChange={handleInputChange} type="date"
              />
            </div>
          </section>

          {/* District Management for Sales Reps */}
          {user.role === 'sales_rep' && (
            <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h2 className="text-xl font-serif mb-8 flex items-center gap-3 text-black">
                <div className="p-2 bg-[#b4a460]/10 rounded-lg text-[#b4a460]"><MapPin size={22} /></div>
                Assigned Operational Areas
              </h2>
              <div className="flex flex-wrap gap-3">
                {user.districts?.length > 0 ? user.districts.map((d, i) => (
                  <span key={i} className="px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-600 shadow-sm">{d}</span>
                )) : (
                  <p className="text-sm text-gray-400 italic font-medium px-2">No districts found in system registry.</p>
                )}
              </div>
            </section>
          )}

          {isEditing && (
            <div className="flex justify-end pt-4">
              <button className="w-full sm:w-auto px-12 py-4 bg-black text-white font-bold rounded-[1.5rem] shadow-2xl shadow-black/20 hover:bg-[#b4a460] transition-all flex items-center justify-center gap-3 text-base">
                <Save size={20} /> Update System Profile
              </button>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <section className="bg-black text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#b4a460]/10 rounded-full blur-3xl"></div>
            <h2 className="text-lg font-serif mb-8 flex items-center gap-3 text-[#b4a460]">
              <Shield size={20} /> System Identity
            </h2>
            <div className="space-y-6 relative z-10">
              <div>
                <p className="text-[10px] uppercase text-gray-500 font-bold tracking-[0.2em] mb-2">Account UUID</p>
                <p className="text-xs font-mono opacity-80 leading-relaxed">{user.user_id}</p>
              </div>
              <div className="pt-6 border-t border-white/10">
                <p className="text-[10px] uppercase text-gray-500 font-bold tracking-[0.2em] mb-2">Registration Date</p>
                <p className="text-sm font-medium">{user.created_at ? new Date(user.created_at).toDateString() : "Active Record"}</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Password Modal */}
      {showPassModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-serif text-black flex items-center gap-3">
                <Lock size={24} className="text-[#b4a460]" /> Security
              </h2>
              <button onClick={() => setShowPassModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-6">
              <PasswordInput label="Current Security Key" name="currentPassword" onChange={handlePasswordChange} />
              <PasswordInput label="New Security Key" name="newPassword" onChange={handlePasswordChange} />
              <PasswordInput label="Verify New Key" name="confirmPassword" onChange={handlePasswordChange} />
              <button className="w-full py-5 bg-black text-white font-bold rounded-2xl mt-6 hover:bg-[#b4a460] transition-all text-sm uppercase tracking-widest shadow-xl">
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ name, icon: Icon, label, value, isEditable, onChange, type = "text" }) => (
  <div className="space-y-2">
    <p className="text-[10px] uppercase text-gray-400 font-bold tracking-[0.15em] flex items-center gap-2">
       <Icon size={14} className="text-[#b4a460]" /> {label}
    </p>
    {isEditable ? (
      <input 
        type={type} name={name} value={value || ''} onChange={onChange}
        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#b4a460]/20 focus:border-[#b4a460] transition-all"
      />
    ) : (
      <p className="text-sm font-bold text-gray-800 px-1">{value || "Not Recorded"}</p>
    )}
  </div>
);

const PasswordInput = ({ label, name, onChange }) => (
  <div className="space-y-2">
    <p className="text-[10px] uppercase text-gray-400 font-bold tracking-[0.1em]">{label}</p>
    <input 
      type="password" name={name} onChange={onChange}
      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:border-[#b4a460] focus:ring-2 focus:ring-[#b4a460]/10 focus:outline-none transition-all"
    />
  </div>
);

export default UserProfile;