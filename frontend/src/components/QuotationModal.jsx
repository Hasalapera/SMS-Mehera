import React, { useState, useEffect } from 'react';
import { X, Search, Package, Plus, Minus, Trash2, FileText, User, MapPin, ReceiptText, Loader2 } from 'lucide-react';
import api from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../pages/context/AuthContext';

const QuotationModal = ({ isOpen, onClose }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);
    
    // --- Customer Selection States ---
    const [isCustomCustomer, setIsCustomCustomer] = useState(false);
    const [cusSearch, setCusSearch] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    
    const [customName, setCustomName] = useState('');
    const [customDistrict, setCustomDistrict] = useState('');
    const [customPhone, setCustomPhone] = useState('');
    
    const [discount, setDiscount] = useState(0);
    const [mobileTab, setMobileTab] = useState('inventory');
    
    const navigate = useNavigate();
    const { user, token } = useAuth();

    useEffect(() => {
        if (isOpen) {
            fetchProducts();
            // Reset states on open
            setCart([]);
            setSelectedCustomer(null);
            setCusSearch('');
            setSuggestions([]);
            setIsCustomCustomer(false);
            setCustomName('');
            setCustomDistrict('');
            setCustomPhone('');
            setDiscount(0);
            setSearch('');
            setMobileTab('inventory');
        }
    }, [isOpen]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/products/getProducts');
            setProducts(res.data?.products || res.data || []);
        } catch (err) {
            toast.error("Failed to load inventory");
        } finally {
            setLoading(false);
        }
    };

    const handleCustomerSearch = async (query) => {
        setCusSearch(query);
        setSelectedCustomer(null);
        if (query.length > 1) {
            try {
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const res = await api.get(`/customers/search?q=${query}`, config);
                setSuggestions(res.data);
            } catch (err) {
                console.error("Search failed", err);
            }
        } else {
            setSuggestions([]);
        }
    };

    if (!isOpen) return null;

    const filteredProducts = products.filter(p => 
        p.product_name?.toLowerCase().includes(search.toLowerCase()) || 
        p.variants?.some(v => v.variant_name?.toLowerCase().includes(search.toLowerCase()))
    );

    const handleAdd = (product, variantId = null) => {
        const variant = variantId ? product.variants.find(v => v.variant_id === variantId) : (product.variants?.[0] || null);
        const price = variant ? Number(variant.price) : Number(product.price || 0);
        const vName = variant ? variant.variant_name : 'Standard';
        const cartItemId = variant ? `${product.product_id}-${variant.variant_id}` : product.product_id;

        const existing = cart.find(item => item.cartItemId === cartItemId);
        if (existing) {
            setCart(cart.map(item => item.cartItemId === cartItemId ? { ...item, qty: item.qty + 1 } : item));
        } else {
            setCart([...cart, {
                cartItemId,
                product_id: product.product_id,
                name: product.product_name,
                variant_name: vName,
                price,
                qty: 1
            }]);
        }
        toast.success("Added to quotation");
    };

    const updateQty = (id, delta) => {
        setCart(cart.map(item => {
            if (item.cartItemId === id) {
                return { ...item, qty: Math.max(1, item.qty + delta) };
            }
            return item;
        }));
    };

    const remove = (id) => setCart(cart.filter(item => item.cartItemId !== id));

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discountAmt = (subtotal * (Number(discount) || 0)) / 100;
    const total = Math.max(0, subtotal - discountAmt);

    const handleGenerate = () => {
        if (cart.length === 0) return toast.error("Please add items to quotation");

        const customerNameToPass = isCustomCustomer ? customName : (selectedCustomer ? selectedCustomer.saloon_name : 'Walk-in Customer');
        const districtToPass = isCustomCustomer ? customDistrict : (selectedCustomer ? selectedCustomer.district : 'Unspecified');
        const phoneToPass = isCustomCustomer ? customPhone : (selectedCustomer ? selectedCustomer.phone1 : '');

        // 🛡️ Create Mock Order Object (No DB interaction)
        const mockOrder = {
            order_id: `QUO-${Date.now().toString().slice(-6)}`,
            created_at: new Date().toISOString(),
            creator: {
                name: user?.name || user?.full_name || 'System User',
                role: user?.role || 'Guest'
            },
            customer: {
                saloon_name: customerNameToPass || 'Walk-in Customer',
                district: districtToPass || 'Unspecified'
            },
            phone: phoneToPass,
            OrderItems: cart.map(item => ({
                quantity: item.qty,
                price: item.price,
                variant: {
                    variant_name: item.variant_name,
                    product: { product_name: item.name }
                }
            })),
            subtotal: subtotal,
            discount_percentage: discount,
            discount_amount: discountAmt,
            total_amount: total
        };

        onClose();
        navigate('/order/preview', { state: { order: mockOrder } });
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-300">
            <div className="bg-background w-full max-w-[1400px] h-full max-h-[90vh] rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl border border-border animate-in zoom-in-95">
                
                {/* Header */}
                <div className="p-6 border-b border-border bg-card flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-textMain uppercase tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary"><ReceiptText size={20} /></div>
                            Quotation Generator
                        </h2>
                        <p className="text-[10px] font-bold text-textMain/50 uppercase tracking-widest mt-1 ml-11">Create estimate without saving to database</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-background border border-border rounded-full hover:bg-red-50 hover:text-red-500 transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Body Split */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">

                    {/* Mobile Tabs */}
                    <div className="lg:hidden flex border-b border-border shrink-0">
                        <button
                            type="button"
                            onClick={() => setMobileTab('inventory')}
                            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${mobileTab === 'inventory' ? 'bg-background text-primary' : 'bg-card/50 text-textMain/50'}`}
                        >
                            <Package size={16} /> Inventory
                        </button>
                        <button
                            type="button"
                            onClick={() => setMobileTab('quotation')}
                            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 relative transition-colors ${mobileTab === 'quotation' ? 'bg-background text-primary' : 'bg-card/50 text-textMain/50'}`}
                        >
                            <FileText size={16} /> Quotation
                            {cart.length > 0 && (
                                <span className="absolute top-2 right-2 w-5 h-5 bg-primary text-black text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in">
                                    {cart.length}
                                </span>
                            )}
                        </button>
                    </div>
                    
                    {/* LEFT PANEL: PRODUCTS */}
                    <div className={`lg:w-[55%] flex-col border-b lg:border-b-0 lg:border-r border-border bg-background min-h-0 ${mobileTab === 'inventory' ? 'flex flex-1' : 'hidden lg:flex'}`}>
                        <div className="p-5 border-b border-border bg-card/50 shrink-0">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textMain/50" size={16} />
                                <input type="text" placeholder="Search inventory..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-background border border-border rounded-xl py-3 pl-11 pr-4 text-xs font-bold outline-none focus:border-primary" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center gap-3"><Loader2 className="animate-spin text-primary" size={32} /></div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {filteredProducts.map(p => (
                                        <div key={p.product_id} className="bg-card border border-border rounded-2xl p-3 flex flex-col hover:border-primary/40 transition-all shadow-sm">
                                            <div className="h-24 w-full bg-background rounded-xl mb-3 flex items-center justify-center p-2">
                                                <img src={p.image_url || 'https://placehold.co/150'} alt="product" className="max-h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                                            </div>
                                            <h3 className="text-[10px] font-black uppercase tracking-tight text-textMain truncate mb-1" title={p.product_name}>{p.product_name}</h3>
                                            
                                            {p.variants && p.variants.length > 0 ? (
                                                <div className="mt-auto pt-2">
                                                    <select onChange={(e) => { if(e.target.value) { handleAdd(p, e.target.value); e.target.value = ""; } }} className="w-full bg-background border border-border text-[9px] font-bold uppercase rounded-lg p-2 outline-none cursor-pointer focus:border-primary text-textMain/70">
                                                        <option value="">+ Add Variant</option>
                                                        {p.variants.map(v => <option key={v.variant_id} value={v.variant_id}>{v.variant_name} (Rs.{v.price})</option>)}
                                                    </select>
                                                </div>
                                            ) : (
                                                <button onClick={() => handleAdd(p)} className="mt-auto w-full bg-background border border-border text-[9px] font-bold uppercase rounded-lg p-2 hover:bg-primary hover:text-black transition-all">+ Add Product</button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL: CART & SETTINGS */}
                    <div className={`lg:w-[45%] flex-col bg-card overflow-y-auto custom-scrollbar min-h-0 ${mobileTab === 'quotation' ? 'flex flex-1' : 'hidden lg:flex'}`}>
                        <div className="p-4 md:p-6 space-y-6">
                            
                            {/* Customer Details */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><User size={14}/> Client Details</h4>
                                    <button 
                                        onClick={() => setIsCustomCustomer(!isCustomCustomer)} 
                                        className="text-[9px] font-bold text-textMain/50 hover:text-primary transition-colors uppercase tracking-widest bg-background px-2 py-1 rounded-md border border-border"
                                    >
                                        {isCustomCustomer ? "Search Database" : "New Customer"}
                                    </button>
                                </div>

                                {isCustomCustomer ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in zoom-in-95 duration-300">
                                        <input type="text" placeholder="Client Name (Optional)" value={customName} onChange={e => setCustomName(e.target.value)} className="bg-background border border-border rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-primary col-span-1 sm:col-span-2" />
                                        <input type="text" placeholder="Phone (Optional)" value={customPhone} onChange={e => setCustomPhone(e.target.value)} className="bg-background border border-border rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-primary" />
                                        <input type="text" placeholder="District / Area (Optional)" value={customDistrict} onChange={e => setCustomDistrict(e.target.value)} className="bg-background border border-border rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-primary" />
                                    </div>
                                ) : (
                                    <div className="relative animate-in fade-in zoom-in-95 duration-300">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Search className="text-textMain/50 transition-colors" size={14} />
                                        </div>
                                        <input 
                                            type="text" 
                                            placeholder="Search Registry..." 
                                            value={cusSearch} 
                                            onChange={e => handleCustomerSearch(e.target.value)} 
                                            className="w-full bg-background border border-border rounded-xl py-3 pl-11 pr-4 text-xs font-bold outline-none focus:border-primary shadow-sm" 
                                        />
                                        
                                        {suggestions.length > 0 && !selectedCustomer && (
                                            <div className="absolute z-50 left-0 right-0 bg-card shadow-2xl rounded-xl mt-2 border border-border overflow-hidden divide-y divide-border max-h-48 overflow-y-auto custom-scrollbar">
                                                {suggestions.map((c) => (
                                                    <div key={c.customer_id} className="px-4 py-3 hover:bg-primary/10 cursor-pointer flex flex-col" onClick={() => { setSelectedCustomer(c); setCusSearch(c.saloon_name); setSuggestions([]); }}>
                                                        <p className="font-black text-[10px] uppercase text-textMain">{c.saloon_name}</p>
                                                        <p className="text-[9px] text-textMain/50 font-bold uppercase tracking-widest">{c.district} • {c.phone1}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {selectedCustomer && (
                                            <div className="mt-3 p-3 bg-background rounded-xl border border-primary/20 flex justify-between items-center shadow-sm">
                                                <div>
                                                    <p className="text-[10px] font-black text-textMain uppercase">{selectedCustomer.saloon_name}</p>
                                                    <p className="text-[9px] text-textMain/50 font-bold uppercase tracking-widest">{selectedCustomer.district} • {selectedCustomer.phone1}</p>
                                                </div>
                                                <button onClick={() => { setSelectedCustomer(null); setCusSearch(""); }} className="p-1 text-red-400 hover:text-red-600 transition-colors"><X size={14} /></button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Cart List */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><Package size={14}/> Quotation Items ({cart.length})</h4>
                                <div className="space-y-2">
                                    {cart.map(item => (
                                        <div key={item.cartItemId} className="flex items-center justify-between p-3 bg-background border border-border rounded-xl shadow-sm">
                                            <div className="flex-1 overflow-hidden pr-2">
                                                <p className="text-[10px] font-black uppercase truncate text-textMain">{item.name}</p>
                                                <p className="text-[9px] font-bold text-primary truncate">{item.variant_name}</p>
                                                <p className="text-[10px] font-bold text-textMain/50 mt-1">Rs. {item.price.toLocaleString()}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1 bg-card rounded-lg p-1 border border-border">
                                                    <button onClick={() => updateQty(item.cartItemId, -1)} className="p-1.5 hover:bg-background rounded-md text-textMain/60"><Minus size={12}/></button>
                                                    <span className="text-[11px] font-black w-6 text-center text-textMain">{item.qty}</span>
                                                    <button onClick={() => updateQty(item.cartItemId, 1)} className="p-1.5 hover:bg-background rounded-md text-textMain/60"><Plus size={12}/></button>
                                                </div>
                                                <button onClick={() => remove(item.cartItemId)} className="p-2 text-textMain/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                            </div>
                                        </div>
                                    ))}
                                    {cart.length === 0 && (
                                        <div className="text-center py-12 text-textMain/40 font-bold text-[10px] uppercase tracking-widest border border-dashed border-border rounded-xl">No items selected</div>
                                    )}
                                </div>
                            </div>

                            {/* Calculations & Footer */}
                            <div className="pt-6 border-t border-border space-y-4">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-textMain/60 uppercase tracking-widest text-[10px]">Gross Subtotal</span>
                                    <span className="font-black text-textMain">Rs. {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs bg-background p-3 rounded-xl border border-border">
                                    <span className="font-bold text-textMain/60 uppercase tracking-widest text-[10px]">Discount (%)</span>
                                    <div className="flex items-center gap-2">
                                        <input type="number" min="0" max="100" value={discount} onChange={e => setDiscount(Math.min(100, Math.max(0, e.target.value)))} className="w-16 bg-card border border-border rounded-lg px-2 py-1.5 text-right text-xs font-black outline-none focus:border-primary" />
                                        <span className="font-bold text-textMain/50">%</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-border">
                                    <span className="font-black text-textMain uppercase tracking-widest text-[11px]">Net Quotation Value</span>
                                    <span className="font-black text-primary text-2xl tracking-tighter">Rs. {total.toLocaleString()}</span>
                                </div>
                                
                                <button onClick={handleGenerate} disabled={cart.length === 0} className="w-full py-5 mt-4 bg-black text-primary font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#b4a460]/10 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <FileText size={18} /> Generate Document
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuotationModal;