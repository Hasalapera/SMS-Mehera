import React, { useState } from 'react';
import { Tag, FileText, Upload, X, Loader2, PlusCircle, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const AddBrand = () => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    brand_name: '',
    description: '',
    image: null
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('brand_name', formData.brand_name);
    data.append('description', formData.description);
    if (formData.image) {
      data.append('brand_image', formData.image);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/brands/addBrand', data, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });
      
      toast.success(`Brand "${formData.brand_name}" added successfully!`);
      setFormData({ brand_name: '', description: '', image: null });
      setImagePreview(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add brand");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-500 pb-10 px-4">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-black flex items-center gap-3">
          <div className="p-2 bg-[#b4a460] rounded-lg text-black">
            <Tag size={24} />
          </div>
          Register New Brand
        </h2>
        <p className="text-gray-500 text-sm mt-1 ml-12">
          Add a new brand to the system (e.g., Inglot, Karal, etc.)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-8 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Brand Logo Upload & Preview */}
          <div className="flex flex-col items-center gap-4">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest self-start ml-2">Brand Logo</label>
            <div className="w-full aspect-square border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50 flex items-center justify-center relative overflow-hidden group hover:border-[#b4a460] transition-all">
              {imagePreview ? (
                <div className="relative w-full h-full p-4">
                  <img src={imagePreview} className="w-full h-full object-contain rounded-2xl" alt="Brand Logo" />
                  <button 
                    type="button" 
                    onClick={() => { setImagePreview(null); setFormData({...formData, image: null}); }}
                    className="absolute top-4 right-4 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center p-6 text-center">
                  <div className="p-4 bg-white rounded-2xl shadow-sm mb-3 group-hover:scale-110 transition-all">
                    <Upload className="text-[#b4a460]" size={28} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Upload Logo</span>
                  <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                </label>
              )}
            </div>
          </div>

          {/* Brand Details */}
          <div className="md:col-span-2 space-y-8">
            {/* Brand Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 tracking-widest">Brand Name</label>
              <div className="relative group">
                <input 
                  type="text" 
                  name="brand_name" 
                  required 
                  value={formData.brand_name} 
                  onChange={handleChange}
                  placeholder="e.g. Inglot"
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#b4a460] transition-all"
                />
                <Tag className="absolute left-4 top-4 text-gray-300 group-focus-within:text-[#b4a460]" size={18} />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 tracking-widest">Description</label>
              <div className="relative group">
                <textarea 
                  name="description" 
                  rows="4" 
                  value={formData.description} 
                  onChange={handleChange}
                  placeholder="Briefly describe the brand's profile..."
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#b4a460] transition-all resize-none"
                />
                <FileText className="absolute left-4 top-4 text-gray-300 group-focus-within:text-[#b4a460]" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-12 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#b4a460] text-black px-12 py-4 rounded-2xl font-black text-sm shadow-xl shadow-[#b4a460]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <PlusCircle size={18} />}
            {loading ? 'Creating Brand...' : 'Complete Brand Registration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBrand;