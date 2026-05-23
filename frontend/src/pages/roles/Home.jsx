import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Loader2, PackageSearch, X, PlusCircle, Check, ScanLine, QrCode } from 'lucide-react';
import api from '../../api/axiosInstance';
import ProductCard from '../../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedOrderId, setScannedOrderId] = useState(null);
  const [otpInput, setOtpInput] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);

  const { token, user } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await api.get('/products/getProducts', config);
        const productData = res.data?.products || res.data;
        setProducts(productData);

        const uniqueCategories = [
          "All Categories",
          ...new Set(productData.map(p => p.category?.category_name).filter(Boolean))
        ];
        setCategories(uniqueCategories);

      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [token]);

  useEffect(() => {
      let html5QrcodeScanner = null;
      if (isScannerOpen) {
          const initScanner = () => {
              html5QrcodeScanner = new window.Html5QrcodeScanner(
                  "delivery-qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false
              );
              html5QrcodeScanner.render(onScanSuccess, () => {});
          };
          if (!window.Html5QrcodeScanner) {
              const script = document.createElement('script');
              script.src = "https://unpkg.com/html5-qrcode";
              script.async = true;
              script.onload = initScanner;
              document.body.appendChild(script);
          } else {
              initScanner();
          }
      }
      return () => {
          if (html5QrcodeScanner) html5QrcodeScanner.clear().catch(e => console.error("Scanner clear error", e));
      };
  }, [isScannerOpen]);

  const onScanSuccess = async (decodedText) => {
      setIsScannerOpen(false);
      setLoading(true);
      try {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const res = await api.post(`/orders/initiate-delivery/${decodedText}`, {}, config);
          if (res.data.success) {
              setScannedOrderId(decodedText);
              setShowOtpModal(true);
              toast.success("OTP sent to customer's email!");
          }
      } catch (err) {
          toast.error(err.response?.data?.message || "Failed to initiate delivery for this QR.");
      } finally {
          setLoading(false);
      }
  };

  const handleVerifyOTP = async () => {
      if (!otpInput || otpInput.length < 6) return toast.error("Please enter a valid 6-digit OTP");
      setLoading(true);
      try {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const res = await api.post(`/orders/rep-confirm-delivery/${scannedOrderId}`, { otp: otpInput }, config);
          if (res.data.success) {
              toast.success("Order marked as Delivered successfully!");
              setShowOtpModal(false);
              setOtpInput("");
              setScannedOrderId(null);
          }
      } catch (err) {
          toast.error(err.response?.data?.message || "Invalid OTP or request failed.");
      } finally {
          setLoading(false);
      }
  };

  // ✅ වැඩිදියුණු කළ Search Filter (Product Name + Variant Names)
  const filteredProducts = products.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    
    // 1. Product එකේ නම ගැලපෙනවද බලනවා
    const matchesProductName = p.product_name?.toLowerCase().includes(searchLower);
    
    // 2. ඕනෑම Variant එකක නමක් (Shade Number) ගැලපෙනවද බලනවා
    const matchesVariantName = p.variants?.some(v => 
      v.variant_name?.toLowerCase().includes(searchLower)
    );

    const matchesSearch = matchesProductName || matchesVariantName;
    const matchesCategory = selectedCategory === "All Categories" || p.category?.category_name === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product, variant = null) => {
    toast.dismiss();
    const savedCart = JSON.parse(localStorage.getItem("active_order_cart") || "[]");
    const unitPrice = variant ? Number(variant.price) : (product.price || 0);
    const variantName = variant ? variant.variant_name : 'Standard';
    const cartItemId = variant ? `${product.product_id}-${variant.variant_id}` : product.product_id;

    const existingItemIndex = savedCart.findIndex(item => item.cartItemId === cartItemId);
    let updatedCart;
    if (existingItemIndex > -1) {
      updatedCart = [...savedCart];
      updatedCart[existingItemIndex].qty += 1;
    } else {
      updatedCart = [...savedCart, { 
        cartItemId, product_id: product.product_id, 
        variant_id: variant?.variant_id || null, variant_name: variantName,
        name: product.product_name, price: unitPrice, qty: 1, image: product.image_url
      }];
    }

    localStorage.setItem("active_order_cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('focus'));

    toast.success(`${variantName} added to order!`, {
      style: {
        borderRadius: '1.5rem', background: '#141414', color: '#b4a460',
        fontSize: '10px', fontWeight: '900', textTransform: 'uppercase',
        letterSpacing: '0.15em', padding: '16px 24px', border: '1px solid rgba(180, 164, 96, 0.2)',
      },
      iconTheme: { primary: '#b4a460', secondary: '#141414' },
    });
    setSelectedProduct(null);
  };

  const canScanDelivery = user && ["sales_rep", "admin", "manager"].includes(user?.role?.toLowerCase());

  return (
    <div className="w-full min-h-screen bg-background transition-all duration-300 text-textMain transition-colors duration-300 overflow-x-hidden text-left" onClick={() => setIsDropdownOpen(false)}>
      
      <div className="w-full px-6 pt-10 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
              <h1 className="text-4xl font-black text-textMain transition-colors duration-300 uppercase tracking-tight">Inventory Catalog</h1>
              <p className="text-textMain/50 transition-colors duration-300 text-xs font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                  <span className="w-8 h-[2px] bg-primary transition-all duration-300"></span>
                  Search by product name or shade number
              </p>
          </div>
          {canScanDelivery && (
              <button onClick={() => setIsScannerOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-black text-primary rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg hover:bg-primary hover:text-black transition-all">
                  <ScanLine size={18} /> Delivery Scanner
              </button>
          )}
      </div>

      <div className="max-w-full px-6 py-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <input 
            type="text" 
            placeholder="Search products or shade numbers (e.g. 72, Gold)..." 
            className="w-full bg-card transition-colors duration-300 border border-border transition-colors duration-300 text-textMain transition-colors duration-300 px-12 py-4 rounded-3xl outline-none font-bold placeholder-gray-400 focus:ring-2 focus:ring-[#b4a460] transition-all shadow-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textMain/50 transition-colors duration-300" size={20} />
        </div>

        <div className="relative w-full md:w-auto" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-black text-primary transition-all duration-300 px-8 py-4 rounded-3xl font-bold flex items-center gap-2 min-w-[220px] justify-between shadow-xl active:scale-95 transition-all"
          >
            <span className="truncate uppercase text-[11px] tracking-widest">{selectedCategory}</span>
            <ChevronDown size={18} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full mt-3 w-full bg-card transition-colors duration-300 rounded-2xl shadow-2xl border border-border transition-colors duration-300 py-3 z-[110] animate-in fade-in slide-in-from-top-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-6 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-primary/10 transition-all duration-300 hover:text-primary transition-all duration-300 flex items-center justify-between transition-colors"
                >
                  {cat}
                  {selectedCategory === cat && <Check size={14} className="text-primary transition-all duration-300" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-full px-6 p-6">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-primary transition-all duration-300" size={42} />
            <p className="text-textMain/50 transition-colors duration-300 font-bold uppercase text-[10px] tracking-widest">Updating Catalog...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.product_id} 
                product={product} 
                onAddToCart={() => product.variants?.length > 0 ? setSelectedProduct(product) : handleAddToCart(product)} 
              />
            ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-textMain/50 transition-colors duration-300">
             <PackageSearch size={64} strokeWidth={1} />
             <p className="mt-4 font-bold uppercase text-xs tracking-widest">No match found</p>
          </div>
        )}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
          <div className="bg-card transition-colors duration-300 rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-10 space-y-8 text-left">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-serif italic text-textMain transition-colors duration-300 leading-tight">{selectedProduct.product_name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-8 h-[2px] bg-primary transition-all duration-300"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-textMain/50 transition-colors duration-300">Available Shades</p>
                  </div>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="p-3 hover:bg-gray-100 rounded-full transition-all">
                  <X size={20} className="text-textMain/50 transition-colors duration-300" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar">
                {selectedProduct.variants.map((v) => (
                  <button key={v.variant_id} onClick={() => handleAddToCart(selectedProduct, v)} className="flex justify-between items-center p-6 bg-card transition-colors duration-300 hover:bg-primary/10 transition-all duration-300 border border-border transition-colors duration-300 rounded-3xl group transition-all">
                    <div className="flex flex-col">
                      <span className="font-black text-[12px] uppercase tracking-wider text-textMain transition-colors duration-300 group-hover:text-primary transition-all duration-300">{v.variant_name}</span>
                      <span className="text-[10px] text-textMain/50 transition-colors duration-300 font-bold mt-1 uppercase">Stock: {v.stock_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="font-serif italic text-xl">Rs. {Number(v.price).toLocaleString()}</span>
                      <div className="p-3 bg-card transition-colors duration-300 rounded-xl shadow-sm group-hover:bg-black group-hover:text-primary transition-all duration-300 transition-all">
                        <PlusCircle size={20} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📷 Scanner Modal */}
      {isScannerOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
              <div className="bg-card w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-border">
                  <div className="p-6 border-b border-border bg-background flex justify-between items-center">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 text-primary rounded-lg"><QrCode size={24} /></div>
                          <div>
                              <h3 className="text-lg font-black uppercase text-textMain tracking-tight">Scan Delivery QR</h3>
                              <p className="text-[10px] font-bold text-textMain/50 uppercase tracking-widest">Mark shipped orders as delivered</p>
                          </div>
                      </div>
                      <button onClick={() => setIsScannerOpen(false)} className="p-2 bg-card border border-border rounded-full text-textMain/50 hover:text-red-500 transition-all"><X size={20} /></button>
                  </div>
                  <div className="p-6 bg-background">
                      <div id="delivery-qr-reader" className="w-full rounded-2xl overflow-hidden border-2 border-primary/30 shadow-inner bg-black min-h-[300px]"></div>
                  </div>
              </div>
          </div>
      )}

      {/* 🔑 OTP Modal */}
      {showOtpModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
              <div className="bg-card w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-border p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20"><Check size={32} className="text-primary" /></div>
                  <h3 className="text-xl font-black uppercase text-textMain tracking-tight mb-2">Verify Delivery</h3>
                  <p className="text-xs text-textMain/50 font-bold mb-6">An OTP has been sent to the customer's email. Please enter it below to confirm delivery.</p>
                  <input type="text" maxLength="6" value={otpInput} onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))} className="w-full bg-background border border-border rounded-xl py-4 px-4 text-center text-2xl tracking-[0.5em] font-black text-textMain outline-none focus:ring-2 focus:ring-primary/20 mb-6" placeholder="------" />
                  <div className="flex gap-3">
                      <button onClick={() => { setShowOtpModal(false); setScannedOrderId(null); setOtpInput(""); }} className="flex-1 py-3 bg-background border border-border text-textMain/70 rounded-xl font-black uppercase text-[10px] tracking-widest hover:text-textMain transition-all">Cancel</button>
                      <button onClick={handleVerifyOTP} disabled={otpInput.length < 6} className="flex-1 py-3 bg-primary text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#9a8b50] transition-all disabled:opacity-50">Confirm</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Home;