
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Loader2, PackageSearch } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../../components/ProductCard';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  // 1. Backend එකෙන් Inventory (Products) දත්ත ටික ගන්නවා
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await axios.get('http://localhost:5001/api/products/getProducts', config);
        
        // Backend structure එක අනුව මෙතන දත්ත ටික ගන්න
        const data = response.data?.products || response.data;
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [token]);

  // 2. Search Filter එක (හොයන නම අනුව products ටික filter කරනවා)
  const filteredProducts = products.filter(p => 
    p.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ["Cosmetics", "Skin Care", "Hair Care", "Cleaning"];

  const handleAddToCart = (product) => {
    console.log("Add to cart button clicked for:", product.name); // බටන් එක වැඩද බලන්න මේක දැම්මා
    
    const saved = localStorage.getItem("active_order_cart");
    const existingCart = saved ? JSON.parse(saved) : [];
    
    const exists = existingCart.find(item => item.product_id === product.id);

    let updatedCart;
    if (exists) {
      updatedCart = existingCart.map(item => 
        item.product_id === product.id ? { ...item, qty: item.qty + 1 } : item
      );
    } else {
      updatedCart = [...existingCart, { 
        product_id: product.id, 
        name: product.name, 
        price: product.price, 
        qty: 1 
      }];
    }
    
    localStorage.setItem("active_order_cart", JSON.stringify(updatedCart));
    console.log("LocalStorage Updated:", updatedCart);

    setAddedProductId(product.id);
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  return (

    <div className="w-full min-h-screen bg-[#f8f9fa] text-black overflow-x-hidden">
      
      {/* --- Performance Rankings (Sales Rep ට පේන කෑල්ල) --- */}
      <div className="w-full px-6 pt-10 pb-4 text-left">
          <h1 className="text-4xl font-black text-black uppercase tracking-tight">
              Inventory Catalog
          </h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-[#b4a460]"></span>
              Browse products and check real-time stock
          </p>
      </div>

      {/* --- Search & Filter Bar --- */}
      <div className="max-w-full px-6 py-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <input 
            type="text" 
            placeholder="Search by Product Name..." 
            className="w-full bg-white border border-gray-200 text-black px-12 py-4 rounded-3xl outline-none font-bold placeholder-gray-400 focus:ring-2 focus:ring-[#b4a460] transition-all shadow-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <button className="bg-black text-[#b4a460] px-8 py-4 rounded-3xl font-bold flex items-center gap-2 min-w-[200px] justify-between shadow-xl">
          All Categories <ChevronDown size={18} />
        </button>
      </div>

      {/* --- Product Catalog Section --- */}
      <div className="max-w-full px-6 p-6">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[#b4a460]" size={42} />
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Updating Catalog...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-gray-300">
             <PackageSearch size={64} strokeWidth={1} />
             <p className="mt-4 font-bold uppercase text-xs tracking-widest">No Products Found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;