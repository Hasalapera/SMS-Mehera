import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Tag, FileText, PlusCircle, LayoutGrid, Loader2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
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
      
      {/* Header Section */}
      <div className="flex items-center justify-between mb-10">
        <div className="text-left">
          <h2 className="text-3xl font-extrabold text-textMain transition-colors duration-300 flex items-center gap-3">
            <div className="p-3 bg-black rounded-2xl text-primary transition-all duration-300 shadow-xl">
              <LayoutGrid size={24} />
            </div>
            Create New Category
          </h2>
          <p className="text-textMain/50 transition-colors duration-300 text-sm mt-2 ml-14">Define product classifications for Mehera Inventory.</p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-textMain/50 transition-colors duration-300 hover:text-textMain transition-colors duration-300 font-bold text-sm"
        >
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main Card */}
        <div className="bg-card transition-colors duration-300 border border-border transition-colors duration-300 rounded-[2.5rem] shadow-sm p-8 md:p-12 relative overflow-hidden">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
            
            {/* Category Name Input */}
            <div className="space-y-3 text-left">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-textMain/50 transition-colors duration-300 ml-1">
                <Tag size={14} className="text-primary transition-all duration-300" /> Category Name
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g. Skin Care, Hair Care, Cosmetics"
                className="w-full px-6 py-4 rounded-2xl border border-border transition-colors duration-300 bg-card/50 transition-colors duration-300 focus:bg-card transition-colors duration-300 focus:border-primary transition-all duration-300 focus:ring-4 focus:ring-[#b4a460]/10 transition-all outline-none text-textMain transition-colors duration-300 font-semibold"
                required
              />
            </div>

            {/* Helper Info */}
            <div className="bg-primary/5 transition-all duration-300 rounded-3xl p-6 flex items-start gap-4 border border-primary/10 transition-all duration-300">
                <div className="p-2 bg-primary transition-all duration-300 rounded-lg text-textMain transition-colors duration-300">
                    <PlusCircle size={18} />
                </div>
                <div className="text-left">
                    <p className="text-sm font-bold text-textMain transition-colors duration-300">Grouping Products</p>
                    <p className="text-[11px] text-textMain/50 transition-colors duration-300 mt-1 leading-relaxed">
                        Categories help you filter inventory and generate sales reports more effectively.
                    </p>
                </div>
            </div>

            {/* Description Input */}
            <div className="md:col-span-2 space-y-3 text-left">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-textMain/50 transition-colors duration-300 ml-1">
                <FileText size={14} className="text-primary transition-all duration-300" /> Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what kind of products fall into this category..."
                rows="4"
                className="w-full px-6 py-4 rounded-2xl border border-border transition-colors duration-300 bg-card/50 transition-colors duration-300 focus:bg-card transition-colors duration-300 focus:border-primary transition-all duration-300 focus:ring-4 focus:ring-[#b4a460]/10 transition-all outline-none text-textMain transition-colors duration-300 font-semibold resize-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button Area */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="group relative flex items-center gap-3 bg-black text-primary transition-all duration-300 px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-card transition-all duration-300 transition-all hover:shadow-2xl hover:shadow-[#b4a460]/20 disabled:opacity-50"
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