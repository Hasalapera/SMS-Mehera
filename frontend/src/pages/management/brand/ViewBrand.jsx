import React, { useState, useEffect } from 'react';
import { Tag, FileText, Globe, Loader2, Image as ImageIcon, LayoutGrid } from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const ViewBrands = () => {
  const [brands, setBrands] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Brands Fetch කරගැනීම
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/brands/getBrands');
        // Backend එකෙන් array එකක් එනවා නම් response.data, 
        // නැත්නම් response.data.brands (කලින් කෝඩ් එක අනුව)
        const brandData = response.data.brands || response.data;
        setBrands(brandData);
        
        // මුලින්ම තියෙන brand එක පෙන්වන්න සෙට් කරනවා
        if (brandData.length > 0) {
          setActiveTab(brandData[0].brand_id);
        }
      } catch (err) {
        toast.error("Failed to load brands");
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const activeBrand = brands.find(b => b.brand_id === activeTab);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#b4a460]" size={40} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto animate-in fade-in duration-500 pb-10 px-4">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-10 text-left">
        <h2 className="text-3xl font-bold text-black flex items-center gap-3">
          <div className="p-3 bg-[#b4a460] rounded-2xl text-black shadow-lg shadow-[#b4a460]/20">
            <LayoutGrid size={28} />
          </div>
          Our Brands Portfolio
        </h2>
        <p className="text-gray-500 text-sm mt-2 ml-16">
          Explore and manage the official brand partners of Mehera International.
        </p>
      </div>

      {/* Tabs Section */}
      <div className="flex flex-wrap gap-3 mb-8 border-b border-gray-100 pb-4">
        {brands.map((brand) => (
          <button
            key={brand.brand_id}
            onClick={() => setActiveTab(brand.brand_id)}
            className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${
              activeTab === brand.brand_id
                ? 'bg-[#b4a460] text-white shadow-xl scale-105'
                : 'bg-white text-gray-400 hover:bg-black hover:text-[#b4a460] hover:shadow-lg'
            }`}
          >
            {brand.brand_name}
          </button>
        ))}
      </div>

      {/* Brand Content Card */}
      {activeBrand && (
        <div className="bg-white border border-gray-100 rounded-[3rem] shadow-sm p-8 md:p-12 animate-in slide-in-from-bottom-5 duration-500">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            
            {/* Left: Brand Logo Area */}
            <div className="w-full lg:w-1/3">
              <div className="aspect-square rounded-[2.5rem] bg-gray-50 border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden p-6 shadow-inner">
                {activeBrand.image_url ? (
                  <img 
                    src={activeBrand.image_url} 
                    alt={activeBrand.brand_name} 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-300">
                    <ImageIcon size={64} />
                    <span className="text-[10px] uppercase font-bold mt-2">No Logo Available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Brand Details */}
            <div className="flex-1 space-y-8 text-left">
              <div>
                <span className="bg-[#b4a460]/10 text-[#b4a460] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Official Partner
                </span>
                <h3 className="text-4xl font-black text-black mt-4">{activeBrand.brand_name}</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-400">
                  <FileText size={18} className="text-[#b4a460]" />
                  <span className="text-xs font-bold uppercase tracking-widest">Brand Description</span>
                </div>
                <p className="text-gray-600 leading-relaxed text-lg italic">
                  "{activeBrand.description || "No description provided for this brand yet."}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                <div className="p-6 bg-gray-50 rounded-3xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Products</p>
                  <p className="text-2xl font-black text-black">--</p> 
                  {/* පසුව count එක දාන්න පුළුවන් */}
                </div>
                <div className="p-6 bg-gray-50 rounded-3xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Created Date</p>
                  <p className="text-sm font-bold text-black">
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
        <div className="bg-white rounded-[2rem] p-20 text-center border border-gray-100">
            <Tag size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-bold italic">No brands found in the inventory.</p>
        </div>
      )}
    </div>
  );
};

export default ViewBrands;