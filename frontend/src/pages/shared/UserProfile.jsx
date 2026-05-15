import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, Phone, CreditCard, MapPin, Users, ExternalLink, ArrowLeft,
  Shield, Calendar, Camera, Edit2, Save, X, Lock, KeyRound, RefreshCw, Loader2, Eye, EyeOff, Clock, XCircle,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast'; 

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, logout, login } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [user, setUser] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); 
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [userAreas, setUserAreas] = useState([]);
  const [isEditingAreas, setIsEditingAreas] = useState(false);
  const districtsList = ["Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya", "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee", "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", "Moneragala", "Ratnapura", "Kegalle"];
  
  const loggedInUser = JSON.parse(localStorage.getItem('user'));
  const isAdmin = loggedInUser?.role === 'admin';
  const isOwnProfile = !id || id === loggedInUser?.user_id;
  const showBackButton = isAdmin && !isOwnProfile;

  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const fallbackAvatar = "https://i.pravatar.cc/150?u=hasala";

  const [formData, setFormData] = useState({ full_name: '', contact_no: '', dob: '', nic_no: '', picture_url: fallbackAvatar });

  useEffect(() => {
    if(!token) { navigate('/'); return; }

    const fetchLatestData = async () => {
      try {
        const targetId = id || loggedInUser?.user_id;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`http://localhost:5001/api/users/profile/${targetId}`, config);
        const fetchedUser = response.data.user;

        setUser(fetchedUser);
        setUserAreas(fetchedUser.areas || []);
        setFormData({
          full_name: fetchedUser.name || fetchedUser.full_name || '',
          contact_no: fetchedUser.contact_no || '', 
          dob: fetchedUser.dob ? fetchedUser.dob.split('T')[0] : '', 
          nic_no: fetchedUser.nic_no || '',
          picture_url: fetchedUser.profile_image || fetchedUser.picture_url || fallbackAvatar
        });

        if (fetchedUser.role === 'sales_rep') {
            setLoadingCustomers(true);
            try {
                const custRes = await axios.get(`http://localhost:5001/api/customers/by-rep/${targetId}`, config);
                setCustomers(custRes.data.customers || []);
            } catch (custErr) { console.error(custErr); } finally { setLoadingCustomers(false); }
        }
      } catch (err) { console.error(err); }
    };
    fetchLatestData();
  }, [id, token]);

  const handlePasswordChange = (e) => setPassData({ ...passData, [e.target.name]: e.target.value });

  const handleAddArea = async (district) => {
    try {
      await axios.put(`http://localhost:5001/api/users/add-area/${user.user_id}`, { district }, { headers: { Authorization: `Bearer ${token}` } });
      setUserAreas([...userAreas, { district_name: district }]);
      toast.success(`${district} added!`);
    } catch (err) { toast.error("Failed to add area"); }
  };

  const handleRemoveArea = async (district) => {
    try {
      await axios.put(`http://localhost:5001/api/users/remove-area/${user.user_id}`, { district }, { headers: { Authorization: `Bearer ${token}` } });
      setUserAreas(userAreas.filter(a => a.district_name !== district));
      toast.success(`${district} removed!`);
    } catch (err) { toast.error("Failed to remove area"); }
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    const uploadData = new FormData();
    uploadData.append("user_id", user.user_id);
    uploadData.append("name", formData.full_name);
    uploadData.append("phone1", formData.contact_no);
    uploadData.append("dob", formData.dob);
    uploadData.append("nic_no", formData.nic_no);
    if (fileInputRef.current?.files[0]) uploadData.append("image", fileInputRef.current.files[0]);

    try {
        const response = await axios.put('http://localhost:5001/api/users/update-profile', uploadData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
        if (response.status === 200) {
            login(response.data.user, token, localStorage.getItem('refreshToken'), localStorage.getItem('expiresAt'));
            setUser(response.data.user);
            setIsEditing(false); 
            toast.success("Profile updated!");
        }
    } catch (err) { toast.error("Update failed."); } finally { setIsUpdating(false); }
  };

  const handlePasswordUpdate = async () => {
    if (passData.newPassword !== passData.confirmPassword) return toast.error("Mismatch!");
    setIsUpdating(true);
    try {
      await axios.put('http://localhost:5001/api/users/change-password', { userId: user.user_id, oldPassword: passData.currentPassword, newPassword: passData.newPassword }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Key updated!");
      setShowPassModal(false);
    } catch (err) { toast.error("Error updating key."); } finally { setIsUpdating(false); }
  };

  if (!user) return <div className="p-10 text-center font-bold italic text-[#b4a460] tracking-widest">Initialising...</div>;

  const isSalesRepProfile = user?.role === 'sales_rep';
  const joinDate = user.createdAt || user.created_at;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500 text-left bg-background text-textMain min-h-screen">

      {showBackButton && (
        <button 
          onClick={() => navigate('/all-users')} // ඔයාගේ Employee Directory එකේ route එක මෙතනට දාන්න
          className="mb-6 flex items-center gap-2 text-textMain/60 hover:text-primary transition-all font-black text-[10px] uppercase tracking-[0.2em] group"
        >
          <div className="p-2 bg-card rounded-xl shadow-sm border border-border group-hover:border-primary transition-all">
            <ArrowLeft size={16} className="group-hover:text-primary" />
          </div>
          Back to User List
        </button>
      )}
      
      {/* Header Card */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-10 bg-card p-8 rounded-[2rem] shadow-sm border border-border">
        <div className="relative group">
          <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-primary/20 shadow-xl bg-background">
            <img src={formData.picture_url} alt="User" className="w-full h-full object-cover" />
          </div>
          {isEditing && (
            <button onClick={() => fileInputRef.current.click()} className="absolute -bottom-2 -right-2 p-2 bg-black text-white rounded-xl shadow-lg hover:bg-[#b4a460] transition-colors"><Camera size={16} /></button>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if(file){ const reader = new FileReader(); reader.onload=(ev)=>setFormData({...formData, picture_url: ev.target.result}); reader.readAsDataURL(file); }}} />
        </div>
        <div className="text-center md:text-left flex-1">
          {isEditing ? <input value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="text-2xl font-serif text-textMain border-b-2 border-primary outline-none bg-transparent w-full max-w-md" /> : <h1 className="text-3xl font-serif text-textMain mb-1">{formData.full_name}</h1>}
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase border border-primary/20">{user.role}</span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${user.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{user.is_active ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
        {isOwnProfile && (
          <div className="flex flex-col sm:flex-row md:flex-col gap-2">
            <button onClick={() => setIsEditing(!isEditing)} className={`px-6 py-3 rounded-2xl font-bold text-sm shadow-lg min-w-[160px] transition-all ${isEditing ? 'bg-card border border-border text-textMain/60' : 'bg-primary text-black hover:bg-black hover:text-white'}`}>
              {isEditing ? <><X size={16} className="inline mr-2"/> Cancel</> : <><Edit2 size={16} className="inline mr-2"/> Edit Profile</>}
            </button>
            {!isEditing && <button onClick={() => setShowPassModal(true)} className="px-6 py-3 bg-card text-textMain border border-border rounded-2xl font-bold text-sm shadow-md min-w-[160px] hover:bg-background"><KeyRound size={16} className="inline mr-2"/> Security</button>}
          </div>              
        )}
      </div>

      {/* Main Grid: Identity Registry (with Audit Logs) vs Operational Districts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column (lg:col-span-2) */}
        <div className="lg:col-span-2">
          <section className="bg-card rounded-[2.5rem] shadow-sm border border-border overflow-hidden">
            {/* Identity Part */}
            <div className="p-10 border-b border-border">
              <h2 className="text-xl font-serif mb-8 flex items-center gap-3 text-textMain"><div className="p-2 bg-primary/10 rounded-lg text-primary"><User size={22} /></div>Identity Registry</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
                <InfoItem icon={Mail} label="Registry Email" value={user.email} />
                <InfoItem name="contact_no" icon={Phone} label="Contact No" value={formData.contact_no} isEditable={isEditing} onChange={(e) => setFormData({...formData, contact_no: e.target.value})} />
                <InfoItem name="nic_no" icon={CreditCard} label="NIC" value={formData.nic_no} isEditable={isEditing} onChange={(e) => setFormData({...formData, nic_no: e.target.value})} />
                <InfoItem name="dob" icon={Calendar} label="Date of Birth" value={isEditing ? formData.dob : new Date(formData.dob).toLocaleDateString('en-GB')} isEditable={isEditing} onChange={(e) => setFormData({...formData, dob: e.target.value})} type="date" />
              </div>
              {isEditing && (
                <button onClick={handleUpdateProfile} disabled={isUpdating} className="mt-8 px-10 py-4 bg-black text-white font-bold rounded-2xl hover:bg-primary transition-all flex items-center gap-3">
                  {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Commit Changes
                </button>
              )}
            </div>

            {/* 📍 Audit Logs - Nested inside the same Registry container */}
            <div className="p-10 bg-background/50">
              <h2 className="text-lg font-serif mb-6 flex items-center gap-3 text-textMain"><Shield size={20} className="text-primary" /> Audit Logs</h2>
              <div className="flex flex-col sm:flex-row gap-8">
                <div className="flex gap-4 items-center">
                  <div className="p-3 bg-card rounded-2xl shadow-sm text-primary"><Clock size={20} /></div>
                  <div>
                    <p className="text-[9px] uppercase text-textMain/60 font-bold tracking-[0.1em]">Joined Registry</p>
                    <p className="text-sm font-bold text-textMain">{joinDate ? new Date(joinDate).toDateString() : "Live Record"}</p>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[9px] uppercase text-textMain/60 font-bold tracking-[0.1em] mb-1">Node UUID</p>
                  <code className="text-[10px] text-textMain/60 font-mono bg-card px-3 py-1 rounded-lg border border-border">{user.user_id}</code>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (lg:col-span-1) - Operational Districts */}
        <div className="lg:col-span-1">
          {isSalesRepProfile && (
            <section className="bg-card p-10 rounded-[2.5rem] shadow-sm border border-border h-full">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-serif flex items-center gap-3 text-textMain"><MapPin size={20} className="text-primary" /> Operational Areas</h2>
                {isAdmin && (
                  <button onClick={() => setIsEditingAreas(!isEditingAreas)} className={`text-[9px] font-black uppercase px-4 py-2 rounded-xl transition-all ${isEditingAreas ? 'bg-black text-white' : 'bg-background text-textMain/60'}`}>
                    {isEditingAreas ? 'Lock' : 'Edit'}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {userAreas.length > 0 ? userAreas.map((area, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-background border border-border px-4 py-2 rounded-xl">
                    <span className="text-[10px] font-black text-textMain/70 uppercase">{area.district_name}</span>
                    {isAdmin && isEditingAreas && <button onClick={() => handleRemoveArea(area.district_name)} className="text-red-400"><XCircle size={14} /></button>}
                  </div>
                )) : <p className="text-xs font-bold text-textMain/40 italic">No assigned areas.</p>}
              </div>

              {isAdmin && isEditingAreas && (
                <div className="mt-8 pt-8 border-t border-border">
                  <p className="text-[9px] font-black text-primary uppercase mb-4 tracking-widest">Add New Area</p>
                  <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {districtsList.filter(d => !userAreas.some(ua => ua.district_name === d)).map(d => (
                      <button key={d} onClick={() => handleAddArea(d)} className="text-[9px] font-bold py-2 border border-border rounded-lg hover:border-primary hover:bg-primary/5 text-textMain/60">+ {d}</button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* Spacing Gap before Portfolio */}
      <div className="my-10" />

      {/* Customer Portfolio Table */}
      {isSalesRepProfile && (isAdmin || isOwnProfile) && (
        <section className="bg-card p-10 rounded-[2.5rem] shadow-sm border border-border animate-in fade-in duration-700">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-serif flex items-center gap-3 text-textMain"><Users size={24} className="text-primary" /> Customer Portfolio</h2>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase text-textMain/60 tracking-widest">Total Clients: {customers.length}</span>
                    <button onClick={() => navigate('/customers')} className="p-2 bg-background text-primary rounded-xl hover:bg-primary hover:text-black transition-all"><ExternalLink size={18}/></button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-[10px] font-black text-textMain/60 uppercase tracking-[0.2em]">
                            <th className="px-6 py-4">Client / Saloon</th>
                            <th className="px-6 py-4">District</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loadingCustomers ? (
                            <tr><td colSpan="4" className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary" size={30} /></td></tr>
                        ) : customers.length > 0 ? customers.map((cust) => (
                            <tr key={cust.customer_id} className="group hover:translate-x-1 transition-all">
                                <td className="px-6 py-5 bg-background rounded-l-2xl border-y border-l border-border">
                                    <p className="text-sm font-bold text-textMain">{cust.saloon_name}</p>
                                    <p className="text-[10px] text-textMain/60">{cust.owner_name}</p>
                                </td>
                                <td className="px-6 py-5 bg-background border-y border-border text-[10px] font-bold text-textMain/70 uppercase">{cust.district}</td>
                                <td className="px-6 py-5 bg-background border-y border-border text-xs font-bold">{cust.phone1 || cust.phone2 || "N/A"}</td>
                                <td className="px-6 py-5 bg-background rounded-r-2xl border-y border-r border-border text-right">
                                    <span className="text-[10px] font-black uppercase text-green-600 bg-green-500/10 px-3 py-1 rounded-lg border border-green-500/20">Mapped</span>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" className="text-center py-10 text-textMain/40 font-bold uppercase text-xs italic">No portfolio data.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
      )}

      {/* Password Modal */}
      {showPassModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-serif text-textMain flex items-center gap-3"><Lock size={24} className="text-primary" /> Security</h2>
              <button onClick={() => setShowPassModal(false)} className="p-2 hover:bg-background rounded-full transition-colors"><X size={24} className="text-textMain/60" /></button>
            </div>
            <div className="space-y-6">
              <PasswordInput label="Current Key" name="currentPassword" value={passData.currentPassword} onChange={handlePasswordChange} />
              <PasswordInput label="New Key" name="newPassword" value={passData.newPassword} onChange={handlePasswordChange} />
              <PasswordInput label="Verify New Key" name="confirmPassword" value={passData.confirmPassword} onChange={handlePasswordChange} />
              <button onClick={handlePasswordUpdate} disabled={isUpdating} className="w-full py-4 bg-black text-white font-bold rounded-2xl hover:bg-primary transition-all flex items-center justify-center gap-2 text-sm">
                {isUpdating && <Loader2 className="animate-spin" size={18} />} Update Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value, isEditable, onChange, type = "text" }) => (
  <div className="space-y-2">
    <p className="text-[10px] uppercase text-textMain/60 font-bold tracking-[0.1em] flex items-center gap-2"><Icon size={14} className="text-primary" /> {label}</p>
    {isEditable ? <input type={type} value={value || ''} onChange={onChange} className="w-full p-4 bg-background border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /> : <p className="text-sm font-bold text-textMain px-1">{value || "Not Recorded"}</p>}
  </div>
);

const PasswordInput = ({ label, name, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="space-y-2 text-left">
      <p className="text-[10px] uppercase text-textMain/60 font-bold tracking-[0.1em]">{label}</p>
      <div className="relative">
        <input type={showPassword ? "text" : "password"} name={name} value={value} onChange={onChange} className="w-full p-4 pr-12 bg-background border border-border rounded-2xl text-sm focus:border-primary outline-none" />
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-textMain/60 hover:text-primary">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
      </div>
    </div>
  );
};

export default UserProfile;