import React, { useState, useEffect } from 'react';
import { Tag, FileText, Globe, Loader2, Image as ImageIcon, LayoutGrid, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

const ViewBrands = () => {
  const [brands, setBrands] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Brands Fetch කරගැනීම
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5001/api/brands/getBrands');
        const brandData = response.data.brands || response.data;
        setBrands(brandData);
        
        if (brandData.length > 0) {
          setActiveTab(brandData[0].brand_id);
        }
      } catch (err) {
        toast.error("Failed to load brands");
      } finally {
        setLoading(false);
      }
    };

    fetchBrands(); // කෙලින්ම මේ useEffect එක ඇතුළෙම කෝල් කරන්න
  }, []); 

  // 🗑️ Delete/Archive Logic
  const handleDeleteBrand = async (brandId, brandName) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to deactivate "${brandName}"? This will hide the brand and its linked products from the active inventory.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#000',
      confirmButtonText: 'Yes, deactivate it!',
      background: '#ffffff',
      color: '#000000',
      customClass: {
        popup: 'rounded-[2rem]',
        confirmButton: 'rounded-xl px-6 py-3 font-bold',
        cancelButton: 'rounded-xl px-6 py-3 font-bold'
      }
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.delete(`http://localhost:5001/api/brands/delete/${brandId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        toast.success(`${brandName} moved to archive`);
        
        // UI එකෙන් අයින් කරන්න
        const updatedBrands = brands.filter(b => b.brand_id !== brandId);
        setBrands(updatedBrands);
        
        // ඊළඟට තියෙන Brand එක පෙන්වන්න
        if (updatedBrands.length > 0) {
          setActiveTab(updatedBrands[0].brand_id);
        } else {
          setActiveTab(null);
        }

      } catch (err) {
        console.error("Delete Error:", err);
        toast.error(err.response?.data?.error || "Failed to delete brand");
      }
    }
  };

  const activeBrand = brands.find(b => b.brand_id === activeTab);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary transition-all duration-300" size={40} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto animate-in fade-in duration-500 pb-10 px-4">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-10 text-left">
        <h2 className="text-3xl font-bold text-textMain transition-colors duration-300 flex items-center gap-3">
          <div className="p-3 bg-primary transition-all duration-300 rounded-2xl text-textMain transition-colors duration-300 shadow-lg shadow-[#b4a460]/20">
            <LayoutGrid size={28} />
          </div>
          Our Brands Portfolio
        </h2>
        <p className="text-textMain/50 transition-colors duration-300 text-sm mt-2 ml-16">
          Explore and manage the official brand partners of Mehera International.
        </p>
      </div>

      {/* Tabs Section */}
      <div className="flex flex-wrap gap-3 mb-8 border-b border-border transition-colors duration-300 pb-4">
        {brands.map((brand) => (
          <button
            key={brand.brand_id}
            onClick={() => setActiveTab(brand.brand_id)}
            className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${
              activeTab === brand.brand_id
                ? 'bg-primary transition-all duration-300 text-white shadow-xl scale-105'
                : 'bg-card transition-colors duration-300 text-textMain/50 transition-colors duration-300 hover:bg-black hover:text-primary transition-all duration-300 hover:shadow-lg'
            }`}
          >
            {brand.brand_name}
          </button>
        ))}
      </div>

      {/* Brand Content Card */}
      {activeBrand && (
        <div className="bg-card transition-colors duration-300 border border-border transition-colors duration-300 rounded-[3rem] shadow-sm p-8 md:p-12 animate-in slide-in-from-bottom-5 duration-500">
          <button 
            onClick={() => handleDeleteBrand(activeBrand.brand_id, activeBrand.brand_name)}
            className="absolute top-8 right-8 p-4 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-3xl transition-all group"
            title="Deactivate Brand"
          >
            <Trash2 size={24} className="group-hover:scale-110 transition-transform" />
          </button>
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            
            {/* Left: Brand Logo Area */}
            <div className="w-full lg:w-1/3">
              <div className="aspect-square rounded-[2.5rem] bg-card transition-colors duration-300 border-2 border-dashed border-border transition-colors duration-300 flex items-center justify-center overflow-hidden p-6 shadow-inner">
                {activeBrand.image_url ? (
                  <img 
                    src={activeBrand.image_url} 
                    alt={activeBrand.brand_name} 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center text-textMain/50 transition-colors duration-300">
                    <ImageIcon size={64} />
                    <span className="text-[10px] uppercase font-bold mt-2">No Logo Available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Brand Details */}
            <div className="flex-1 space-y-8 text-left">
              <div>
                <span className="bg-primary/10 transition-all duration-300 text-primary transition-all duration-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Official Partner
                </span>
                <h3 className="text-4xl font-black text-textMain transition-colors duration-300 mt-4">{activeBrand.brand_name}</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-textMain/50 transition-colors duration-300">
                  <FileText size={18} className="text-primary transition-all duration-300" />
                  <span className="text-xs font-bold uppercase tracking-widest">Brand Description</span>
                </div>
                <p className="text-textMain/50 transition-colors duration-300 leading-relaxed text-lg italic">
                  "{activeBrand.description || "No description provided for this brand yet."}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
                <div className="p-6 bg-card transition-colors duration-300 rounded-3xl">
                  <p className="text-[10px] font-bold text-textMain/50 transition-colors duration-300 uppercase mb-1">Total Products</p>
                  <p className="text-2xl font-black text-textMain transition-colors duration-300">
                  {/* 🚀 Backend එකෙන් එන productCount එක මෙතනට දානවා */}
                  {activeBrand.productCount || 0}
                </p>
                <p className="text-[9px] text-textMain/50 transition-colors duration-300 font-medium uppercase mt-1">Items in registry</p>
                </div>
                <div className="p-6 bg-card transition-colors duration-300 rounded-3xl">
                  <p className="text-[10px] font-bold text-textMain/50 transition-colors duration-300 uppercase mb-1">Created Date</p>
                  <p className="text-sm font-bold text-textMain transition-colors duration-300">
                    {new Date(activeBrand.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Empty State */}
      {brands.length === 0 && !loading && (
        <div className="bg-card transition-colors duration-300 rounded-[2rem] p-20 text-center border border-border transition-colors duration-300">
            <Tag size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-textMain/50 transition-colors duration-300 font-bold italic">No brands found in the inventory.</p>
        </div>
      )}
    </div>
  );
};

export default ViewBrands;