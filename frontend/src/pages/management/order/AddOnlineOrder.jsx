import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, MapPin, Phone, Truck } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../../pages/context/AuthContext';

const AddOnlineOrder = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // පාරිභෝගික විස්තර
  const [customer, setCustomer] = useState({
    name: '',
    address: '',
    phone: '',
    secondary_phone: '',
    courier_name: ''
  });

  // 1. බඩු ලිස්ට් එක ගෙන්වා ගැනීම
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('http://localhost:5001/api/products/getProducts', config);
        
        // Response එක array එකක් බව තහවුරු කරගැනීම
        const data = res.data?.products || res.data;
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch Error:", err);
        toast.error("Inventory failed to load!");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProducts();
  }, [token]);

  // 2. කාට් එකට එකතු කිරීම
  const addToCart = (product, variant) => {
    if (!variant) return toast.error("Please select a variant!");
    
    const cartId = `${product.product_id}-${variant.variant_id}`;
    const existingItem = cart.find((item) => item.cartId === cartId);

    if (existingItem) {
      setCart(cart.map((item) =>
        item.cartId === cartId ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setCart([...cart, {
        cartId,
        product_id: product.product_id,
        variant_id: variant.variant_id,
        name: `${product.product_name} (${variant.variant_name})`,
        price: Number(variant.price),
        qty: 1
      }]);
    }
    toast.success("Added to cart");
  };

  // 3. ඕඩර් එක සේව් කිරීම
  const handlePlaceOrder = async () => {
    if (!customer.name || !customer.phone || cart.length === 0) {
      return toast.error("Please fill required fields and add items!");
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const orderData = {
        ...customer,
        items: cart,
        total_amount: cart.reduce((sum, item) => sum + (item.price * item.qty), 0)
      };

      await axios.post('http://localhost:5001/api/orders/create-online', orderData, config);
      toast.success("Order Placed Successfully!");
      setCart([]);
      setCustomer({ name: '', address: '', phone: '', secondary_phone: '', courier_name: '' });
    } catch (err) {
      console.error("Order Error:", err);
      toast.error("Failed to place order!");
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 lg:p-8 font-sans">
      <Toaster />
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* වම් පැත්ත: බඩු ලිස්ට් එක */}
        {/* <div className="lg:col-span-7 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="SEARCH PRODUCTS..."
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-sm border-none outline-none font-bold"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-10">Loading Products...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100vh-250px)] overflow-y-auto pr-2">
              {products
                .filter(p => p.product_name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(product => (
                  <ProductCard key={product.product_id} product={product} addToCart={addToCart} />
                ))
              }
            </div>
          )}
        </div> */}

        {/* දකුණු පැත්ත: විස්තර සහ කාට් එක */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm space-y-4">
            <h3 className="flex items-center gap-2 font-black text-gray-800 uppercase mb-2"><User size={18}/> Customer Details</h3>
            <input type="text" placeholder="CUSTOMER NAME" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm" value={customer.name} onChange={(e) => setCustomer({...customer, name: e.target.value})} />
            <textarea placeholder="SHIPPING ADDRESS" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm h-24" value={customer.address} onChange={(e) => setCustomer({...customer, address: e.target.value})} />
            <div className="grid grid-cols-2 gap-3">
               <input type="text" placeholder="PHONE 1" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm" value={customer.phone} onChange={(e) => setCustomer({...customer, phone: e.target.value})} />
               <input type="text" placeholder="PHONE 2" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm" value={customer.secondary_phone} onChange={(e) => setCustomer({...customer, secondary_phone: e.target.value})} />
            </div>
            <input type="text" placeholder="COURIER NAME (E.G. DOMEX)" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm" value={customer.courier_name} onChange={(e) => setCustomer({...customer, courier_name: e.target.value})} />
          </div>

          <div className="bg-black text-white p-8 rounded-[2.5rem] shadow-xl">
             <h3 className="flex items-center gap-2 font-black uppercase mb-6 text-[#b4a460]"><ShoppingCart size={20}/> Your Cart</h3>
             <div className="space-y-4 max-h-48 overflow-y-auto mb-6 pr-2">
                {cart.length === 0 ? <p className="text-gray-500 text-xs text-center py-4">Cart is empty</p> : 
                  cart.map(item => (
                    <div key={item.cartId} className="flex justify-between items-center border-b border-white/10 pb-2">
                        <div className="text-[10px] font-bold uppercase">{item.name} <br/> <span className="text-[#b4a460]">RS. {item.price} x {item.qty}</span></div>
                        <div className="font-black">RS. {item.price * item.qty}</div>
                    </div>
                  ))
                }
             </div>
             <div className="flex justify-between items-center mb-8 border-t border-white/20 pt-4">
                <span className="font-black text-gray-400">TOTAL AMOUNT</span>
                <span className="text-2xl font-black text-[#b4a460]">RS. {totalAmount}</span>
             </div>
             <button onClick={handlePlaceOrder} className="w-full py-5 bg-[#b4a460] hover:bg-[#96884a] text-black rounded-2xl font-black transition-all uppercase tracking-widest">Confirm & Save Order</button>
          </div>
        </div>

      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, addToCart }) => {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants?.[0]?.variant_id || '');
  const selectedVariant = product.variants?.find(v => v.variant_id === selectedVariantId);

  return (
    <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between">
      <div>
        <h4 className="font-black text-gray-800 text-xs uppercase mb-3 leading-tight">{product.product_name}</h4>
        <select 
          className="w-full p-3 bg-gray-50 rounded-xl text-[10px] font-bold outline-none mb-4 appearance-none border border-gray-100"
          value={selectedVariantId}
          onChange={(e) => setSelectedVariantId(e.target.value)}
        >
          {product.variants?.map(v => (
            <option key={v.variant_id} value={v.variant_id}>{v.variant_name} - RS. {v.price}</option>
          ))}
        </select>
      </div>
      <button 
        onClick={() => addToCart(product, selectedVariant)}
        className="w-full py-3 bg-black text-[#b4a460] rounded-xl font-black text-[10px] uppercase hover:bg-gray-900 transition-colors"
      >
        Add To Order
      </button>
    </div>
  );
};

export default AddOnlineOrder;
