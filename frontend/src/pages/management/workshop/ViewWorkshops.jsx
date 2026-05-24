// src/pages/management/workshop/ViewWorkshops.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Award, Users, Trash2, Edit, Plus, X, Loader2, ImagePlus } from 'lucide-react';
import api from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

const ViewWorkshops = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState(null); // Edit කරන එක ට්‍රැක් කරන්න 🛠️

  // Form States & Validation States
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    capacity: '',
    speakers: '',
    durationValue: '', // ගණන (උදා: 3)
    durationUnit: 'Hours', // ඒකකය (Hours, Days, Months)
    image: null, // File upload සඳහා
    imagePreview: '', // Preview පෙන්වීමට
    type: 'series'
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      const res = await api.get('/workshops');
      setWorkshops(res.data);
    } catch (err) {
      toast.error("Failed to load workshops");
    } finally {
      setLoading(false);
    }
  };

  // Form Input Handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  // Image handling (File to Base64/Preview)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result, imagePreview: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // 🎯 Form Validation
  const validateForm = () => {
    let tempErrors = {};
    if (!formData.title.trim()) tempErrors.title = "Title is required";
    if (!formData.date) tempErrors.date = "Date is required";
    if (!formData.durationValue || formData.durationValue <= 0) tempErrors.duration = "Valid duration is required";
    if (!editingWorkshop && !formData.image) tempErrors.image = "Workshop image is required";
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Open Modal for Creating
  const handleOpenAdd = () => {
    setEditingWorkshop(null);
    setFormData({
      title: '', description: '', date: '', capacity: '', speakers: '',
      durationValue: '', durationUnit: 'Hours', image: null, imagePreview: '', type: 'series'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // 🛠️ Open Modal for Editing (කලින් ඩේටා ටික ෆෝම් එකට දානවා)
  const handleOpenEdit = (workshop) => {
    setEditingWorkshop(workshop);
    
    // Duration එක වෙන් කරගැනීම (e.g., "3 Hours" -> value: 3, unit: "Hours")
    const durationParts = workshop.duration ? workshop.duration.split(' ') : ['', 'Hours'];
    
    setFormData({
      title: workshop.title || '',
      description: workshop.description || '',
      date: workshop.date || '',
      capacity: workshop.capacity || '',
      speakers: workshop.speakers || '',
      durationValue: durationParts[0] || '',
      durationUnit: durationParts[1] || 'Hours',
      image: null,
      imagePreview: workshop.image_url || '',
      type: workshop.type || 'series'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Submit Handler (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    // Duration එක එකතු කරලා ලස්සන ස්ට්‍රින්ග් එකක් හදනවා (e.g., "3 Hours")
    const finalDuration = `${formData.durationValue} ${formData.durationUnit}`;
    
    const payload = {
      title: formData.title,
      description: formData.description,
      date: formData.date,
      capacity: formData.capacity,
      speakers: formData.speakers,
      duration: finalDuration,
      type: formData.type,
      // ඉමේජ් එකක් අලුතින් සිලෙක්ට් කරලා තියෙනවා නම් විතරක් යවනවා
      ...(formData.image && { image: formData.image }) 
    };

    try {
      if (editingWorkshop) {
        // 🔄 UPDATE (EDIT) REQUEST
        await api.put(`/workshops/${editingWorkshop.workshop_id}`, payload);
        toast.success("Workshop updated successfully!");
      } else {
        // ➕ CREATE REQUEST
        await api.post('/workshops', payload);
        toast.success("Workshop created successfully!");
      }
      setIsModalOpen(false);
      fetchWorkshops();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this workshop?")) {
      try {
        await api.delete(`/workshops/${id}`);
        toast.success("Workshop deleted");
        fetchWorkshops();
      } catch (err) {
        toast.error("Failed to delete workshop");
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto text-left">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-textMain">Workshop Console</h1>
          <p className="text-textMain/50 text-xs">Manage public masterclasses and dynamic event lists.</p>
        </div>
        <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-primary text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-opacity-90 transition-all shadow-md">
          <Plus size={16} /> Add Workshop
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {workshops.map((w) => (
            <div key={w.workshop_id} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-all">
              <div className="aspect-video w-full bg-gray-100 relative overflow-hidden">
                <img src={w.image_url || 'https://via.placeholder.com/300x150'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={w.title} />
                <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest bg-black/70 text-primary px-2.5 py-1 rounded-md backdrop-blur-sm">{w.type}</span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-serif text-lg text-textMain line-clamp-1">{w.title}</h3>
                  <p className="text-xs text-textMain/50 line-clamp-2 mt-1">{w.description || 'No description provided.'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px] font-bold text-textMain/70 pt-2 border-t border-border/50">
                  <div className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /> {w.date}</div>
                  <div className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /> {w.duration || 'N/A'}</div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => handleOpenEdit(w)} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold border border-border text-textMain/70 hover:bg-primary/10 hover:text-primary transition-all"><Edit size={14} /> Edit</button>
                  <button onClick={() => handleDelete(w.workshop_id)} className="p-2 rounded-xl border border-border text-red-400 hover:bg-red-50 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- ADD / EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-sidebar w-full max-w-xl rounded-3xl p-6 border border-border shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-textMain/50 hover:text-textMain"><X size={20} /></button>
            <h2 className="text-2xl font-serif mb-6 text-textMain">{editingWorkshop ? 'Edit Workshop' : 'Create New Workshop'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-textMain/70">
              {/* Image Upload Area */}
              <div>
                <label className="block mb-2 uppercase tracking-wider text-[10px]">Workshop Banner</label>
                <div className="border-2 border-dashed border-border rounded-2xl p-4 text-center hover:border-primary transition-all relative aspect-video bg-card/50 flex flex-col items-center justify-center cursor-pointer group">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  {formData.imagePreview ? (
                    <img src={formData.imagePreview} className="absolute inset-0 w-full h-full object-cover rounded-2xl" alt="Preview" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-textMain/40 group-hover:text-primary transition-colors">
                      <ImagePlus size={32} />
                      <span>Click to upload image</span>
                    </div>
                  )}
                </div>
                {errors.image && <p className="text-red-500 text-[10px] mt-1">{errors.image}</p>}
              </div>

              <div>
                <label className="block mb-1 uppercase tracking-wider text-[10px]">Workshop Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full p-3 bg-card border border-border rounded-xl focus:outline-none focus:border-primary" placeholder="e.g. Bridal Masterclass" />
                {errors.title && <p className="text-red-500 text-[10px] mt-1">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 uppercase tracking-wider text-[10px]">Date *</label>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full p-3 bg-card border border-border rounded-xl focus:outline-none focus:border-primary" />
                  {errors.date && <p className="text-red-500 text-[10px] mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className="block mb-1 uppercase tracking-wider text-[10px]">Category / Type</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} className="w-full p-3 bg-card border border-border rounded-xl focus:outline-none focus:border-primary">
                    <option value="series">Workshop Series</option>
                    <option value="flagship">Flagship Event</option>
                    <option value="past">Past Highlights</option>
                  </select>
                </div>
              </div>

              {/* 🕒 Dynamic Duration Fields */}
              <div>
                <label className="block mb-1 uppercase tracking-wider text-[10px]">Duration *</label>
                <div className="flex gap-2">
                  <input type="number" name="durationValue" value={formData.durationValue} onChange={handleInputChange} className="w-1/2 p-3 bg-card border border-border rounded-xl focus:outline-none focus:border-primary" placeholder="e.g. 3" min="1" />
                  <select name="durationUnit" value={formData.durationUnit} onChange={handleInputChange} className="w-1/2 p-3 bg-card border border-border rounded-xl focus:outline-none focus:border-primary">
                    <option value="Hours">Hours</option>
                    <option value="Days">Days</option>
                    <option value="Weeks">Weeks</option>
                    <option value="Months">Months</option>
                  </select>
                </div>
                {errors.duration && <p className="text-red-500 text-[10px] mt-1">{errors.duration}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 uppercase tracking-wider text-[10px]">Speakers / Maestros</label>
                  <input type="text" name="speakers" value={formData.speakers} onChange={handleInputChange} className="w-full p-3 bg-card border border-border rounded-xl focus:outline-none focus:border-primary" placeholder="e.g. Dhananjaya Bandara" />
                </div>
                <div>
                  <label className="block mb-1 uppercase tracking-wider text-[10px]">Capacity</label>
                  <input type="text" name="capacity" value={formData.capacity} onChange={handleInputChange} className="w-full p-3 bg-card border border-border rounded-xl focus:outline-none focus:border-primary" placeholder="e.g. 500+ Attendees" />
                </div>
              </div>

              <div>
                <label className="block mb-1 uppercase tracking-wider text-[10px]">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full p-3 bg-card border border-border rounded-xl focus:outline-none focus:border-primary" placeholder="Briefly describe the summit contents..."></textarea>
              </div>

              <button type="submit" disabled={submitting} className="w-full bg-primary text-white p-3 rounded-xl uppercase font-black tracking-widest text-[11px] hover:bg-opacity-90 flex justify-center items-center gap-2 mt-4 shadow-md">
                {submitting ? <Loader2 className="animate-spin" size={16} /> : (editingWorkshop ? 'Save Changes' : 'Publish Workshop')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewWorkshops;