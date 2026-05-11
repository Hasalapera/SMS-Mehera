import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Tag, FileText, LayoutGrid, Loader2, Search, Package, ChevronRight, Calendar, ArrowUpRight, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

const ViewCategories = () => {
    const {token} = useAuth();
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const handleDeleteCategory = async (id, name) => {
        const result = await Swal.fire({
            title: 'Deactivate Category?',
            text: `Are you sure you want to archive "${name}"? This will hide it from the active inventory but won't delete associated products.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#b4a460', // Mehera Gold
            cancelButtonColor: '#000',
            confirmButtonText: 'Yes, Archive it!',
            background: '#ffffff',
            customClass: { popup: 'rounded-[3rem]' }
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:5001/api/category/delete/${id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
                });

                toast.success(`${name} archived successfully`);
                
                // UI එකෙන් අයින් කිරීම
                const updatedList = categories.filter(c => c.category_id !== id);
                setCategories(updatedList);
                
                // ඊළඟට තියෙන කැටගරි එක සිලෙක්ට් කිරීම
                if (updatedList.length > 0) setSelectedCategory(updatedList[0].category_id);
                else setSelectedCategory(null);

            } catch (err) {
                toast.error(err.response?.data?.error || "Failed to delete category");
            }
        }
    };

    // 1. Categories සහ ඒවාට අදාළ Products Fetch කරගැනීම
    useEffect(() => {
        const fetchCategories = async () => {
        try {
            // Backend එකේ getCategories එකේදී 'include: [Product]' දාලා තිබිය යුතුයි
            const response = await axios.get('http://localhost:5001/api/category/getCategories', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            const data = response.data.categories || response.data;
            setCategories(data);
            
            if (data.length > 0) {
            setSelectedCategory(data[0].category_id);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
        };
        if(token){
            fetchCategories();
        }
    }, [token]);

    // 2. Search Filter Logic
    const filteredCategories = categories.filter(cat =>
        cat.category_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeCategory = categories.find(c => c.category_id === selectedCategory);

    if (loading) {
        return (
        <div className="h-screen flex items-center justify-center bg-card transition-colors duration-300">
            <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-primary transition-all duration-300" size={48} />
            <p className="text-textMain/50 transition-colors duration-300 font-bold animate-pulse">Loading Mehera Inventory...</p>
            </div>
        </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto animate-in fade-in duration-700 pb-20 px-6">
        
        {/* Header & Search Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 mt-10">
            <div className="text-left">
            <h2 className="text-4xl font-black text-textMain transition-colors duration-300 flex items-center gap-4">
                <div className="p-4 bg-black rounded-3xl text-primary transition-all duration-300 shadow-2xl shadow-black/20">
                <LayoutGrid size={32} />
                </div>
                Category Hub
            </h2>
            <p className="text-textMain/50 transition-colors duration-300 text-sm mt-3 ml-20 font-medium">
                Manage your product classifications and explore associated inventory.
            </p>
            </div>

            {/* Advance Search Bar */}
            <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textMain/50 transition-colors duration-300 group-focus-within:text-primary transition-all duration-300" size={20} />
            <input 
                type="text" 
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-card transition-colors duration-300 border border-border transition-colors duration-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#b4a460]/10 focus:bg-card transition-colors duration-300 focus:border-primary transition-all duration-300 transition-all font-semibold text-textMain transition-colors duration-300"
            />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left: Category List (Tabs Style) */}
            <div className="lg:col-span-4 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary transition-all duration-300 mb-4 ml-2">All Classifications</p>
            <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {filteredCategories.map((cat) => (
                <button
                    key={cat.category_id}
                    onClick={() => setSelectedCategory(cat.category_id)}
                    className={`w-full flex items-center justify-between p-5 rounded-[2rem] transition-all duration-500 group ${
                    selectedCategory === cat.category_id
                        ? 'bg-black text-white shadow-2xl shadow-black/30 translate-x-2'
                        : 'bg-card transition-colors duration-300 text-textMain/50 transition-colors duration-300 hover:bg-card transition-colors duration-300 border border-border'
                    }`}
                >
                    <div className="flex items-center gap-4 text-left">
                    <div className={`p-3 rounded-2xl transition-colors ${selectedCategory === cat.category_id ? 'bg-primary transition-all duration-300 text-textMain transition-colors duration-300' : 'bg-gray-100 text-textMain/50 transition-colors duration-300 group-hover:bg-primary/20 transition-all duration-300 group-hover:text-textMain transition-colors duration-300'}`}>
                        <Tag size={20} />
                    </div>
                    <div>
                        <p className={`font-black text-sm ${selectedCategory === cat.category_id ? 'text-white' : 'text-gray-800'}`}>{cat.category_name}</p>
                        <p className="text-[10px] opacity-60 font-bold">{cat.products?.length || 0} Products Attached</p>
                    </div>
                    </div>
                    <ChevronRight size={18} className={`transition-transform duration-300 ${selectedCategory === cat.category_id ? 'rotate-90 text-primary transition-all duration-300' : 'opacity-0 group-hover:opacity-100'}`} />
                </button>
                ))}
            </div>
            </div>

            {/* Right: Detailed View & Products */}
            <div className="lg:col-span-8">
            {activeCategory ? (
                <div className="space-y-8 animate-in slide-in-from-right-10 duration-700">
                {/* Category Info Card */}
                <div className="bg-card transition-colors duration-300 border border-border transition-colors duration-300 rounded-[3.5rem] p-10 shadow-sm relative overflow-hidden">
                    <button 
                        onClick={() => handleDeleteCategory(activeCategory.category_id, activeCategory.category_name)}
                        className="absolute top-8 right-8 p-4 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all z-20 group"
                        title="Delete Category"
                    >
                        <Trash2 size={24} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-textMain transition-colors duration-300">
                        <Tag size={200} />
                    </div>
                    
                    <div className="relative z-10 text-left">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="bg-primary transition-all duration-300 text-textMain transition-colors duration-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#b4a460]/20">Active Classification</span>
                        <span className="flex items-center gap-1.5 text-textMain/50 transition-colors duration-300 text-[10px] font-bold uppercase"><Calendar size={12}/> {new Date(activeCategory.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <h3 className="text-5xl font-black text-textMain transition-colors duration-300 tracking-tight mb-6">{activeCategory.category_name}</h3>
                    
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 text-primary transition-all duration-300 mb-2">
                            <FileText size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Scope & Description</span>
                        </div>
                        <p className="text-textMain/50 transition-colors duration-300 text-lg leading-relaxed font-medium">
                        {activeCategory.category_description || "This category acts as a primary container for related items in the Mehera International inventory system."}
                        </p>
                    </div>
                    </div>
                </div>

                {/* Products Grid associated with this category */}
                <div className="space-y-6 text-left">
                    <div className="flex items-center justify-between px-4">
                        <h4 className="text-xl font-black text-textMain transition-colors duration-300 flex items-center gap-3">
                            <Package className="text-primary transition-all duration-300" /> 
                            Associated Products
                        </h4>
                        <span className="text-xs font-bold text-textMain/50 transition-colors duration-300 bg-gray-100 px-4 py-2 rounded-full">
                            {activeCategory.products?.length || 0} ITEMS FOUND
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeCategory.products && activeCategory.products.length > 0 ? (
                        activeCategory.products.map((prod) => (
                        <div key={prod.product_id} className="group bg-card transition-colors duration-300 p-6 rounded-[2.5rem] border border-border transition-colors duration-300 hover:border-primary transition-all duration-300 hover:shadow-2xl hover:shadow-[#b4a460]/10 transition-all duration-500 flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-card transition-colors duration-300 rounded-2xl flex items-center justify-center text-textMain/50 transition-colors duration-300 group-hover:bg-primary/10 transition-all duration-300 group-hover:text-primary transition-all duration-300">
                                    <Package size={28} />
                                </div>
                                <div>
                                    <p className="font-black text-textMain transition-colors duration-300 group-hover:text-primary transition-all duration-300">{prod.product_name}</p>
                                    <p className="text-[10px] font-bold text-textMain/50 transition-colors duration-300 uppercase tracking-tighter">SKU: {prod.sku || 'N/A'}</p>
                                </div>
                            </div>
                            <button className="p-3 bg-card transition-colors duration-300 rounded-xl text-textMain/50 transition-colors duration-300 group-hover:bg-black group-hover:text-primary transition-all duration-300 transition-all">
                                <ArrowUpRight size={20} />
                            </button>
                        </div>
                        ))
                    ) : (
                        <div className="md:col-span-2 py-20 bg-card/50 transition-colors duration-300 rounded-[3rem] border-2 border-dashed border-border transition-colors duration-300 text-center">
                            <Package size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-textMain/50 transition-colors duration-300 font-bold italic">No products currently assigned to this category.</p>
                        </div>
                    )}
                    </div>
                </div>
                </div>
            ) : (
                <div className="h-full flex items-center justify-center bg-card/50 transition-colors duration-300 rounded-[4rem] border-2 border-dashed border-border transition-colors duration-300">
                <div className="text-center">
                    <LayoutGrid size={64} className="mx-auto text-gray-200 mb-6" />
                    <p className="text-textMain/50 transition-colors duration-300 font-bold">Select a category to view its detailed inventory.</p>
                </div>
                </div>
            )}
            </div>
        </div>
        </div>
    );
    };

export default ViewCategories;