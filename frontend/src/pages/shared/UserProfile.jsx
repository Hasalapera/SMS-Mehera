import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, Phone, CreditCard, MapPin, 
  Shield, Calendar, Camera, Edit2, Save, X, Lock, KeyRound, RefreshCw, Loader2, Eye, EyeOff, Clock
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom'; // navigate එකත් ගත්තා
import toast, { Toaster } from 'react-hot-toast'; // Toaster එකත් දාන්න ඕනේ

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, logout, login } = useAuth(); // ✅ මෙතන ලස්සනට ඔක්කොම එකවර ගත්තා (පරණ double declaration එක අයින් කළා)
  
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
    if(!token) { navigate('/'); return; } // Token නැත්නම් එළියට

    const fetchLatestData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const targetId = id || storedUser?.user_id;
        if (!targetId) return;

        // ✅ මචං මෙතන Header එක නැති නිසයි මුලින් ඩේටා ලෝඩ් වෙන්නේ නැත්තේ
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`http://localhost:5001/api/users/profile/${targetId}`, config);
        const fetchedUser = response.data.user;

        if (!id || id === storedUser?.user_id) {
          localStorage.setItem('user', JSON.stringify(fetchedUser));
        }
        
        setUser(fetchedUser);
        setFormData({
          full_name: fetchedUser.name || fetchedUser.full_name || '',
          contact_no: fetchedUser.contact_no || '',
          dob: fetchedUser.dob ? fetchedUser.dob.split('T')[0] : '', 
          nic_no: fetchedUser.nic_no || '',
          picture_url: fetchedUser.profile_image || fetchedUser.picture_url || fallbackAvatar
        });
      } catch (err) {
        if (err.response?.status === 401) logout();
        console.error("Sync error:", err);
      }
    };

    fetchLatestData();
  }, [id, token]);

  const handlePasswordUpdate = async () => {
    if (passData.newPassword !== passData.confirmPassword) {
      toast.error("New security keys do not match!");
      return;
    }
    setIsUpdating(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put('http://localhost:5001/api/users/change-password', {
        userId: user.user_id,
        oldPassword: passData.currentPassword,
        newPassword: passData.newPassword
      }, config);

      toast.success("Security key updated successfully!");
      setShowPassModal(false);
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || "Password update failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    const uploadData = new FormData();
    uploadData.append("user_id", user.user_id);
    if(formData.full_name) uploadData.append("name", formData.full_name);
    uploadData.append("contact_no", formData.contact_no);
    uploadData.append("dob", formData.dob);
    uploadData.append("nic_no", formData.nic_no);
    
    if (fileInputRef.current?.files[0]) {
      uploadData.append("image", fileInputRef.current.files[0]);
    }

    try {
        const config = { 
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            } 
        };
        const response = await axios.put('http://localhost:5001/api/users/update-profile', uploadData, config);

        if (response.status === 200) {
            const updatedUser = response.data.user;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            login(updatedUser, token, localStorage.getItem('refreshToken'), localStorage.getItem('expiresAt'));
            setUser(updatedUser);
            window.dispatchEvent(new Event('storage')); 
            
            setIsEditing(false); 
            toast.success("Profile synchronized successfully!");
        }
    } catch (err) {
        toast.error("System synchronization failed.");
    } finally {
        setIsUpdating(false);
    }
  };

  // --- Helpers ---
  const handleImageSelect = (file) => { if (!file) return; const reader = new FileReader(); reader.onload = (e) => setFormData(prev => ({ ...prev, picture_url: e.target.result })); reader.readAsDataURL(file); };
  const startCamera = async () => { setIsCapturing(true); try { const stream = await navigator.mediaDevices.getUserMedia({ video: true }); if (videoRef.current) videoRef.current.srcObject = stream; } catch (err) { setIsCapturing(false); } };
  const capturePhoto = () => { const canvas = canvasRef.current; const video = videoRef.current; if (canvas && video) { canvas.width = video.videoWidth; canvas.height = video.videoHeight; canvas.getContext('2d').drawImage(video, 0, 0); canvas.toBlob((blob) => { const file = new File([blob], `cap.jpg`, { type: "image/jpeg" }); const dt = new DataTransfer(); dt.items.add(file); fileInputRef.current.files = dt.files; setFormData(prev => ({ ...prev, picture_url: URL.createObjectURL(file) })); video.srcObject.getTracks().forEach(track => track.stop()); setIsCapturing(false); }, 'image/jpeg', 0.6); } };

  if (!user) return <div className="p-10 text-center font-bold italic text-[#b4a460] tracking-widest">Initialising Registry...</div>;

  // ✅ Created At ලෙඩේට විසඳුම:
  const joinDate = user.createdAt || user.created_at;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500 text-left bg-gray-50/20 min-h-screen">
      <Toaster position="top-right" />
      
      {/* Profile Header Card */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-10 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50">
        <div className="relative group">
          <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-[#b4a460]/20 shadow-xl bg-gray-100">
            {isCapturing ? <video ref={videoRef} autoPlay className="w-full h-full object-cover scale-x-[-1]" /> : <img src={formData.picture_url} alt="User" className="w-full h-full object-cover" />}
          </div>
          <div className="absolute -bottom-2 -right-2 flex gap-1">
            {isEditing && (
              <>
                <button onClick={isCapturing ? capturePhoto : () => fileInputRef.current.click()} className="p-2 bg-black text-white rounded-xl shadow-lg hover:bg-[#b4a460] transition-colors">{isCapturing ? <Save size={16} /> : <Camera size={16} />}</button>
                {!isCapturing && <button onClick={startCamera} className="p-2 bg-black text-white rounded-xl shadow-lg hover:bg-[#b4a460]"><RefreshCw size={16} /></button>}
              </>
            )}
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageSelect(e.target.files[0])} />
          <canvas ref={canvasRef} className="hidden" />
        </div>
        
        <div className="text-center md:text-left flex-1">
          {isEditing ? <input name="full_name" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="text-2xl font-serif text-black border-b-2 border-[#b4a460] focus:outline-none mb-2 bg-transparent w-full max-w-md px-1" /> : <h1 className="text-3xl font-serif text-black mb-1">{formData.full_name || "User Name"}</h1>}
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
            <span className="px-3 py-1 bg-[#b4a460]/10 text-[#8a7b42] rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#b4a460]/20">{user.role}</span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 ${user.is_active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{user.is_active ? 'Active Node' : 'Inactive'}</span>
          </div>
        </div>

        {(!id || id === JSON.parse(localStorage.getItem('user'))?.user_id) && (
          <div className="flex flex-col sm:flex-row md:flex-col gap-2">
            <button onClick={() => setIsEditing(!isEditing)} className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg min-w-[160px] ${isEditing ? 'bg-gray-100 text-gray-400' : 'bg-[#b4a460] text-black hover:bg-black hover:text-white'}`}>
              {isEditing ? <><X size={16} /> Cancel</> : <><Edit2 size={16} /> Edit Profile</>}
            </button>
            {!isEditing && <button onClick={() => setShowPassModal(true)} className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black border border-gray-200 rounded-2xl font-bold text-sm shadow-md min-w-[160px] hover:bg-gray-50"><KeyRound size={16} /> Security</button>}
          </div>              
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-xl font-serif mb-8 flex items-center gap-3 text-black"><div className="p-2 bg-[#b4a460]/10 rounded-lg text-[#b4a460]"><User size={22} /></div>Identity Registry</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
              <InfoItem icon={Mail} label="Registry Email" value={user.email} />
              <InfoItem name="contact_no" icon={Phone} label="Contact No" value={formData.contact_no} isEditable={isEditing} onChange={(e) => setFormData({...formData, contact_no: e.target.value})} />
              <InfoItem name="nic_no" icon={CreditCard} label="NIC" value={formData.nic_no} isEditable={isEditing} onChange={(e) => setFormData({...formData, nic_no: e.target.value})} />
              <InfoItem name="dob" icon={Calendar} label="Date of Birth" value={isEditing ? formData.dob : new Date(formData.dob).toLocaleDateString('en-GB')} isEditable={isEditing} onChange={(e) => setFormData({...formData, dob: e.target.value})} type="date" />
            </div>
          </section>

          {isEditing && (
            <div className="flex justify-end pt-4">
              <button onClick={handleUpdateProfile} disabled={isUpdating} className="w-full sm:w-auto px-12 py-4 bg-black text-white font-bold rounded-[1.5rem] shadow-2xl hover:bg-[#b4a460] transition-all flex items-center justify-center gap-3 text-base">
                {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Commit Changes
              </button>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <section className="bg-white p-10 rounded-[2.5rem] shadow-xl border-2 border-[#b4a460]/10 relative overflow-hidden">
            <h2 className="text-lg font-serif mb-8 flex items-center gap-3 text-black"><Shield size={20} /> Audit Logs</h2>
            <div className="space-y-6 relative z-10 text-left">
              <div className="flex gap-4">
                <div className="p-3 bg-gray-50 rounded-2xl text-[#b4a460]"><Clock size={20} /></div>
                <div>
                  <p className="text-[10px] uppercase text-gray-500 font-bold tracking-[0.2em] mb-1">Registry Joined</p>
                  <p className="text-sm font-bold text-gray-900">
                    {joinDate ? new Date(joinDate).toDateString() : "Live Record"}
                  </p>
                </div>
              </div>
              <div className="pt-6 border-t border-gray-50">
                <p className="text-[10px] uppercase text-gray-300 font-black mb-2">Node UUID</p>
                <code className="text-[9px] text-gray-400 block break-all font-mono bg-gray-50 p-4 rounded-xl">{user.user_id}</code>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Password Modal */}
      {showPassModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-serif text-black flex items-center gap-3"><Lock size={24} className="text-[#b4a460]" /> Security</h2>
              <button onClick={() => setShowPassModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} className="text-gray-400" /></button>
            </div>
            <div className="space-y-6">
              <PasswordInput label="Current Key" name="currentPassword" value={passData.currentPassword} onChange={handlePasswordChange} />
              <PasswordInput label="New Key" name="newPassword" value={passData.newPassword} onChange={handlePasswordChange} />
              <PasswordInput label="Verify New Key" name="confirmPassword" value={passData.confirmPassword} onChange={handlePasswordChange} />
              <button onClick={handlePasswordUpdate} disabled={isUpdating} className="w-full py-4 bg-black text-white font-bold rounded-2xl mt-6 hover:bg-[#b4a460] transition-all flex items-center justify-center gap-2 text-sm">
                {isUpdating && <Loader2 className="animate-spin" size={18} />} Update Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ... Sub Components ...
const InfoItem = ({ icon: Icon, label, value, isEditable, onChange, type = "text" }) => (
  <div className="space-y-2">
    <p className="text-[10px] uppercase text-gray-400 font-bold tracking-[0.15em] flex items-center gap-2"><Icon size={14} className="text-[#b4a460]" /> {label}</p>
    {isEditable ? <input type={type} value={value || ''} onChange={onChange} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#b4a460]/20 focus:border-[#b4a460] transition-all" /> : <p className="text-sm font-bold text-gray-800 px-1">{value || "Not Recorded"}</p>}
  </div>
);

const PasswordInput = ({ label, name, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="space-y-2 text-left">
      <p className="text-[10px] uppercase text-gray-400 font-bold tracking-[0.1em]">{label}</p>
      <div className="relative">
        <input type={showPassword ? "text" : "password"} name={name} value={value} onChange={onChange} className="w-full p-4 pr-12 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:border-[#b4a460] outline-none" />
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
      </div>
    </div>
  );
};

export default UserProfile;