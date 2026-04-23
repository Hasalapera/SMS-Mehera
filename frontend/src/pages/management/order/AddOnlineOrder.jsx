import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, User, Package, Plus, Minus, Trash2, 
  CheckCircle2, MapPin, Phone, UserPlus, Smartphone, Map, Mail, Percent
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AddOnlineOrder = () => {
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0); // 👈 Discount state එක් කරන්න
  const { token } = useAuth();

  const districts = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", 
    "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", 
    "Mannar", "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya", 
    "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
  ];

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    primaryPhone: '',
    secondaryPhone: '',
    district: '',
    address: '',
    email: ''
  });

  const loadCartData = () => {
    try {
      const savedData = localStorage.getItem("active_order_cart");
      setCart(savedData ? JSON.parse(savedData) : []);
    } catch (error) {
      console.error("Cart Loading Error:", error);
    }
  };

  useEffect(() => {
    loadCartData();
    window.addEventListener('focus', loadCartData);
    return () => window.removeEventListener('focus', loadCartData);
  }, []);

  const updateQty = (id, delta) => {
    const newCart = cart.map(item => 
      item.cartItemId === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    );
    setCart(newCart);
    localStorage.setItem("active_order_cart", JSON.stringify(newCart));
  };

  const removeItem = (id) => {
    const newCart = cart.filter(item => item.cartItemId !== id);
    setCart(newCart);
    localStorage.setItem("active_order_cart", JSON.stringify(newCart));
    toast.error("Item removed from queue");
  };

  // 👇 Subtotal calculation
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  // 👇 Discount calculation
  const discountPercentage = Number(discount) || 0;
  const discountAmount = (totalAmount * discountPercentage) / 100;
  const finalAmount = Math.max(0, totalAmount - discountAmount);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handlePlaceOnlineOrder = async () => {
    if (!customerInfo.name || !customerInfo.primaryPhone || !customerInfo.district || !customerInfo.address || !customerInfo.email) {
      toast.error("All marked fields (*) including Email are required!");
      return;
    }

    if (!isValidEmail(customerInfo.email)) {
      toast.error("Please enter a valid email address!");
      return;
    }

    if (cart.length === 0) {
      toast.error("Add at least one product to the order!");
      return;
    }

    try {
      const orderData = {
        customer_name: customerInfo.name,
        primary_phone: customerInfo.primaryPhone,
        secondary_phone: customerInfo.secondaryPhone,
        district: customerInfo.district,
        shipping_address: customerInfo.address,
        email: customerInfo.email,
        
        // 💰 Money fields with discount
        subtotal: totalAmount,              // මුලු එකතුව
        discount_percentage: discountPercentage, // % එක
        discount_amount: discountAmount,    // LKR amount එක
        total_amount: finalAmount,          // අවසාන payable එක
        
        items: cart.map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          qty: item.qty,
          price: item.price
        })),
        order_type: 'online'
      };

      const response = await axios.post(
        'http://localhost:5001/api/orders/online', 
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201 || response.status === 200) {
        toast.success("Online Order Successfully Created!");
        setCart([]);
        localStorage.removeItem("active_order_cart");
        setCustomerInfo({ name: '', primaryPhone: '', secondaryPhone: '', district: '', address: '', email: '' });
        setDiscount(0); // 👈 Discount reset කරන්න
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Internal Server Error");
    }
  };

  return (
    <div className="flex flex-col h-full font-sans text-left bg-white">
      <Toaster position="top-right" />
      
      <div className="p-6 border-b border-gray-50 bg-gray-50/20">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-black text-[#b4a460] rounded-2xl shadow-lg">
            <ShoppingCart size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-black">Online Registry</h2>
            <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">Retail Entry Form</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        
        {/* CUSTOMER REGISTRY SECTION */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus size={14} className="text-[#b4a460]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Customer Registry</span>
          </div>
          
          <div className="space-y-3">
            {/* Full Name */}
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#b4a460]" size={16} />
              <input 
                type="text" name="name" value={customerInfo.name} onChange={handleInputChange}
                placeholder="Full Name *" 
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#b4a460]/20 outline-none"
              />
            </div>
            
            {/* Contacts */}
            <div className="grid grid-cols-2 gap-3">
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input 
                    type="text" name="primaryPhone" value={customerInfo.primaryPhone} onChange={handleInputChange}
                    placeholder="Contact No 1 *" 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-[10px] font-bold focus:ring-2 focus:ring-[#b4a460]/20 outline-none"
                  />
                </div>
                <div className="relative group">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input 
                    type="text" name="secondaryPhone" value={customerInfo.secondaryPhone} onChange={handleInputChange}
                    placeholder="Contact No 2 (Optional)" 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-[10px] font-bold focus:ring-2 focus:ring-[#b4a460]/20 outline-none"
                  />
                </div>
            </div>

            {/* Email Field */}
            <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#b4a460]" size={16} />
                <input 
                    type="email" name="email" value={customerInfo.email} onChange={handleInputChange}
                    placeholder="Email Address * (Required for Invoice)" 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#b4a460]/20 outline-none"
                />
            </div>

            {/* District Dropdown */}
            <div className="relative group">
                <Map className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#b4a460]" size={16} />
                <select 
                    name="district" value={customerInfo.district} onChange={handleInputChange}
                    className="w-full pl-12 pr-10 py-4 bg-gray-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#b4a460]/20 outline-none appearance-none"
                >
                    <option value="">Select District *</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                    <Plus size={12} className="rotate-45" />
                </div>
            </div>

            {/* Address */}
            <div className="relative group">
              <MapPin className="absolute left-4 top-4 text-gray-300 group-focus-within:text-[#b4a460]" size={16} />
              <textarea 
                name="address" value={customerInfo.address} onChange={handleInputChange}
                placeholder="Delivery Address *" 
                rows="3"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#b4a460]/20 outline-none resize-none shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* CART QUEUE */}
        <div className="space-y-4 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <Package size={14} className="text-[#b4a460]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Order Queue ({cart.length})</span>
          </div>

          {cart.length > 0 ? (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.cartItemId} className="p-4 bg-white border border-gray-100 rounded-[2rem] flex items-center justify-between group hover:border-[#b4a460]/30 transition-all shadow-sm">
                  <div className="flex-1 overflow-hidden pr-4">
                    <h4 className="text-[11px] font-black uppercase text-black leading-tight truncate">{item.name}</h4>
                    {item.variant_name && item.variant_name !== 'Standard' && (
                      <p className="text-[9px] text-[#b4a460] font-black uppercase mt-0.5">{item.variant_name}</p>
                    )}
                    <p className="text-[10px] font-serif italic text-gray-400 mt-0.5">Rs. {item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-gray-100/50 p-1 rounded-xl">
                      <button onClick={() => updateQty(item.cartItemId, -1)} className="p-1.5 hover:bg-white rounded-lg transition-all shadow-sm"><Minus size={10} /></button>
                      <span className="text-xs font-black w-5 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.cartItemId, 1)} className="p-1.5 hover:bg-white rounded-lg transition-all shadow-sm"><Plus size={10} /></button>
                    </div>
                    <button onClick={() => removeItem(item.cartItemId)} className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300">
              <ShoppingCart size={32} className="mb-2 opacity-10" />
              <p className="text-[9px] font-black uppercase tracking-[0.2em]">Queue is empty</p>
            </div>
          )}
        </div>
      </div>

      {/* 👇 UPDATED FOOTER WITH DISCOUNT */}
      <div className="p-8 border-t border-gray-100 bg-white space-y-6">
        
        {/* Subtotal Display */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-50">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gross Subtotal</span>
          <span className="text-sm font-black text-black">Rs. {totalAmount.toLocaleString()}</span>
        </div>

        {/* Discount Input */}
        <div className="p-4 bg-[#f8f8f8] rounded-2xl border border-dashed border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Percent size={14} className="text-[#b4a460]" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Discount Rate</span>
            </div>
            <span className="text-[10px] font-black text-[#b4a460]">% Percentage</span>
          </div>
          <div className="relative">
            <input 
              type="number" 
              value={discount}
              onChange={(e) => setDiscount(Math.min(100, Math.max(0, e.target.value)))}
              placeholder="0"
              className="w-full bg-white border-none rounded-xl py-3 pl-4 pr-10 text-sm font-black outline-none focus:ring-2 focus:ring-[#b4a460]/20 transition-all text-right shadow-sm"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-[#b4a460] text-sm">%</span>
          </div>
          {discount > 0 && (
            <div className="mt-3 text-right">
              <p className="text-[9px] text-[#b4a460] font-black uppercase italic">
                {discount}% OFF Applied (-Rs. {discountAmount.toLocaleString()})
              </p>
            </div>
          )}
        </div>

        {/* Grand Total */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Grand Total</p>
            <div className="flex items-baseline gap-1">
              <span className="text-[10px] font-black text-[#b4a460]">LKR</span>
              <span className="text-3xl font-black tracking-tighter text-black">{finalAmount.toLocaleString()}</span>
            </div>
          </div>
          <span className="text-[8px] font-black uppercase px-4 py-1.5 rounded-full bg-[#b4a460]/10 text-[#b4a460]">
            {cart.length} Items Selected
          </span>
        </div>

        {/* Submit Button */}
        <button 
          onClick={handlePlaceOnlineOrder}
          disabled={cart.length === 0 || !customerInfo.name || !customerInfo.primaryPhone || !customerInfo.district || !customerInfo.email}
          className="w-full py-5 bg-black text-[#b4a460] rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-gray-900 transition-all disabled:bg-gray-100 disabled:text-gray-300 shadow-xl shadow-[#b4a460]/10"
        >
          <CheckCircle2 size={18} />
          Complete Online Order
        </button>
      </div>
    </div>
  );
};

export default AddOnlineOrder;