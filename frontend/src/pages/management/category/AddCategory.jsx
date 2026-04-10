import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Tag, FileText, PlusCircle, LayoutGrid, Loader2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AddCategory = () => {
    const { token } = useAuth();
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    console.log("Token going to backend:", token);
    e.preventDefault();
    if (!categoryName) return toast.error("Category name is required!");

    setLoading(true);
    console.log("Current Token:", token);
    try {
      const response = await axios.post('http://localhost:5001/api/category/addCategory', 
        {
          name: categoryName,
          description: description
        },
        {
          headers: {
            // Context එකෙන් එන Token එක මෙතනට දානවා
            Authorization: `Bearer ${token}` 
          }
        }
      );

      if (response.status === 201) {
        toast.success("Category added successfully!");
        setCategoryName('');
        setDescription('');
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.status === 401 
        ? "Your session has expired. Please login again." 
        : (err.response?.data?.error || "Something went wrong");
      
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
      <Toaster position="top-right" />
      
      {/* Header Section */}
      <div className="flex items-center justify-between mb-10">
        <div className="text-left">
          <h2 className="text-3xl font-extrabold text-black flex items-center gap-3">
            <div className="p-3 bg-black rounded-2xl text-[#b4a460] shadow-xl">
              <LayoutGrid size={24} />
            </div>
            Create New Category
          </h2>
          <p className="text-gray-400 text-sm mt-2 ml-14">Define product classifications for Mehera Inventory.</p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors font-bold text-sm"
        >
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main Card */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-8 md:p-12 relative overflow-hidden">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
            
            {/* Category Name Input */}
            <div className="space-y-3 text-left">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                <Tag size={14} className="text-[#b4a460]" /> Category Name
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g. Skin Care, Hair Care, Cosmetics"
                className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#b4a460] focus:ring-4 focus:ring-[#b4a460]/10 transition-all outline-none text-black font-semibold"
                required
              />
            </div>

            {/* Helper Info */}
            <div className="bg-[#b4a460]/5 rounded-3xl p-6 flex items-start gap-4 border border-[#b4a460]/10">
                <div className="p-2 bg-[#b4a460] rounded-lg text-black">
                    <PlusCircle size={18} />
                </div>
                <div className="text-left">
                    <p className="text-sm font-bold text-black">Grouping Products</p>
                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                        Categories help you filter inventory and generate sales reports more effectively.
                    </p>
                </div>
            </div>

            {/* Description Input */}
            <div className="md:col-span-2 space-y-3 text-left">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                <FileText size={14} className="text-[#b4a460]" /> Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what kind of products fall into this category..."
                rows="4"
                className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#b4a460] focus:ring-4 focus:ring-[#b4a460]/10 transition-all outline-none text-black font-semibold resize-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button Area */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="group relative flex items-center gap-3 bg-black text-[#b4a460] px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#1a1a1a] transition-all hover:shadow-2xl hover:shadow-[#b4a460]/20 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <PlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                Save Category
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCategory;