import React, { useState, useEffect } from 'react';
import { 
  Package, Tag, Layers, FileText, PlusCircle, Trash2, 
  Loader2, Upload, X, Image as ImageIcon, AlertTriangle 
} from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const AddProduct = () => {
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [mainImagePreview, setMainImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    product_name: '',
    brand_id: '',
    category: '',
    description: '',
    main_image: null,
    variants: [
      { sku: '', variant_name: '', price: '', stock_count: '', critical_stock_level: 5, variant_image: null, preview: null }
    ]
  });

  // Brands load කරගැනීමට (ඔයාගේ backend එකේ route එක තිබිය යුතුයි)
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/brands');
        setBrands(response.data);
      } catch (err) {
        console.error("Brands load error");
      }
    };
    fetchBrands();
  }, []);

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, main_image: file });
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVariantImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const updatedVariants = [...formData.variants];
      updatedVariants[index].variant_image = file;
      updatedVariants[index].preview = URL.createObjectURL(file);
      setFormData({ ...formData, variants: updatedVariants });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVariantChange = (index, e) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index][e.target.name] = e.target.value;
    setFormData({ ...formData, variants: updatedVariants });
  };

  const addVariantField = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { sku: '', variant_name: '', price: '', stock_count: '', critical_stock_level: 5, variant_image: null, preview: null }]
    });
  };

  const removeVariantField = (index) => {
    if (formData.variants.length > 1) {
      const updatedVariants = formData.variants.filter((_, i) => i !== index);
      setFormData({ ...formData, variants: updatedVariants });
    } else {
      toast.error("At least one variant is required!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('product_name', formData.product_name);
    data.append('brand_id', formData.brand_id);
    data.append('category', formData.category);
    data.append('description', formData.description);
    if (formData.main_image) data.append('main_image', formData.main_image);

    data.append('variants', JSON.stringify(formData.variants.map(v => ({
        sku: v.sku, variant_name: v.variant_name, price: v.price, stock_count: v.stock_count, critical_stock_level: v.critical_stock_level
    }))));

    formData.variants.forEach((v) => {
        if (v.variant_image) data.append(`variant_images`, v.variant_image);
    });

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/products/addProduct', data, {
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data' 
        }
      });
      toast.success("Product added successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Error uploading product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-in fade-in duration-500 pb-10 px-4">
      <Toaster position="top-right" />
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-black flex items-center gap-3">
          <div className="p-2 bg-[#b4a460] rounded-lg text-black"><Package size={24} /></div>
          New Inventory Item
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: Main Details */}
        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-8 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl p-6 hover:border-[#b4a460] transition-colors relative h-64 lg:h-full">
            {mainImagePreview ? (
              <div className="relative w-full h-full">
                <img src={mainImagePreview} className="w-full h-full object-contain rounded-2xl" alt="Preview" />
                <button type="button" onClick={() => setMainImagePreview(null)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"><X size={16} /></button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center">
                <Upload className="text-gray-300 mb-2" size={40} />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">Upload Main Image</span>
                <input type="file" className="hidden" onChange={handleMainImageChange} accept="image/*" />
              </label>
            )}
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Product Name</label>
                <input type="text" name="product_name" required value={formData.product_name} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#b4a460]" />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Brand</label>
                <select name="brand_id" required value={formData.brand_id} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#b4a460]">
                  <option value="">Select Brand</option>
                  {brands.map(b => <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Category</label>
                <input type="text" name="category" required value={formData.category} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#b4a460]" />
            </div>
            <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Description</label>
                <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#b4a460] resize-none" />
            </div>
          </div>
        </div>

        {/* SECTION 2: Variants */}
        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-8 md:p-10">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-bold text-[#b4a460] uppercase tracking-widest flex items-center gap-2">
              <Layers size={18} /> Variants Configuration
            </h3>
            <button type="button" onClick={addVariantField} className="bg-black text-[#b4a460] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-gray-800 transition-all">
              <PlusCircle size={16} /> Add Another Variant
            </button>
          </div>

          <div className="space-y-6">
            {formData.variants.map((variant, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-6 p-6 bg-gray-50 rounded-[1.5rem] border border-gray-100 relative group animate-in slide-in-from-right-5">
                
                <div className="w-24 h-24 shrink-0 bg-white border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden relative">
                  {variant.preview ? (
                    <img src={variant.preview} className="w-full h-full object-cover" alt="Variant" />
                  ) : (
                    <label className="cursor-pointer">
                      <ImageIcon size={20} className="text-gray-300" />
                      <input type="file" className="hidden" onChange={(e) => handleVariantImageChange(index, e)} />
                    </label>
                  )}
                </div>

                <div className="flex-1 grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">SKU</label>
                    <input type="text" name="sku" required value={variant.sku} onChange={(e) => handleVariantChange(index, e)} className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-[#b4a460]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Variant Name</label>
                    <input type="text" name="variant_name" required value={variant.variant_name} onChange={(e) => handleVariantChange(index, e)} className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-[#b4a460]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Price</label>
                    <input type="number" name="price" required value={variant.price} onChange={(e) => handleVariantChange(index, e)} className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-[#b4a460]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Stock</label>
                    <input type="number" name="stock_count" required value={variant.stock_count} onChange={(e) => handleVariantChange(index, e)} className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-[#b4a460]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-red-400 uppercase flex items-center gap-1">
                      <AlertTriangle size={10} /> Critical
                    </label>
                    <input type="number" name="critical_stock_level" required value={variant.critical_stock_level} onChange={(e) => handleVariantChange(index, e)} className="w-full bg-red-50/50 border border-red-100 rounded-lg py-2 px-3 text-xs text-red-600 font-bold focus:ring-1 focus:ring-red-400" />
                  </div>
                </div>

                <button type="button" onClick={() => removeVariantField(index)} className="self-center p-2 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pr-4">
          <button type="submit" disabled={loading} className="bg-[#b4a460] text-black px-12 py-4 rounded-2xl font-bold shadow-xl shadow-[#b4a460]/20 hover:scale-105 transition-all flex items-center gap-3">
            {loading ? <Loader2 className="animate-spin" /> : <Package />}
            {loading ? 'Saving Listing...' : 'Save Product Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;