import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  User,
  Package,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Search,
  ArrowRight,
  UserCheck,
  ClipboardList,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const AddOrder = () => {
  const [cusSearch, setCusSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const { token } = useAuth();
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash'); 
  

  // --- දත්ත කියවීමේ ප්‍රධාන FUNCTION එක ---
  const loadCartData = () => {
    try {
      const savedData = localStorage.getItem("active_order_cart");
      if (savedData) {
        setCart(JSON.parse(savedData));
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error("දත්ත කියවීමේදී දෝෂයක්:", error);
    }
  };

  useEffect(() => {
    loadCartData();
  }, []);

  useEffect(() => {
    window.addEventListener("focus", loadCartData);
    return () => window.removeEventListener("focus", loadCartData);
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("active_order_cart", JSON.stringify(cart));
    }
  }, [cart]);

  const increaseQty = (cartItemId) => {
    setCart((prev) => {
      const updatedCart = prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, qty: item.qty + 1 } : item,
      );
      localStorage.setItem("active_order_cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const decreaseQty = (cartItemId) => {
    setCart((prev) => {
      const updatedCart = prev.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, qty: Math.max(1, item.qty - 1) }
          : item,
      );
      localStorage.setItem("active_order_cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const removeItemCompletely = (cartItemId) => {
    const updatedCart = cart.filter((item) => item.cartItemId !== cartItemId);
    setCart(updatedCart);
    localStorage.setItem("active_order_cart", JSON.stringify(updatedCart));
    toast.error("Product removed from queue");
  };

  const totalAmount = cart.reduce((sum, item) => {
    const itemPrice = Number(item.price) || 0;
    const itemQty = Number(item.qty) || 0;
    return sum + itemPrice * itemQty;
  }, 0);

  const finalPayable = Math.max(0, totalAmount - (Number(discount) || 0));

  const handleCustomerSearch = async (query) => {
    setCusSearch(query);
    setSelectedCustomer(null);

    if (query.length > 1) {
      setIsSearching(true);
      try {
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};
        const res = await axios.get(
          `http://localhost:5001/api/customers/search?q=${query}`,
          config,
        );
        setSuggestions(res.data);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedCustomer) return toast.error("Please select a partner!");
    if (cart.length === 0) return toast.error("Selection queue is empty!");

    try {
      // Discount එක % වලින් නම් calculate කරන්න
      const discountPercentage = Number(discount) || 0;
      const discountAmount = (totalAmount * discountPercentage) / 100;
      const finalAmount = Math.max(0, totalAmount - discountAmount);

      const orderData = {
        customer_id: selectedCustomer.customer_id,
        customer_name: selectedCustomer.saloon_name,
        shipping_address: `${selectedCustomer.lane1 || ""}, ${selectedCustomer.district || ""}`,
        phone: selectedCustomer.phone1,

        // 👇 මේවා තමයි database එකට යන්නේ
        subtotal: totalAmount, // මුලු එකතුව (discount නැතුව)
        discount_percentage: discountPercentage, // % එක
        discount_amount: discountAmount, // LKR amount එක
        total_amount: finalAmount, // අවසාන payable එක
        payment_method: paymentMethod, // 'cash' or 'credit'

        items: cart.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          qty: item.qty,
          price: item.price,
        })),
      };

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post(
        "http://localhost:5001/api/orders/place",
        orderData,
        config,
      );

      if (res.data.success) {
        toast.success("Order Placed Successfully!");
        localStorage.removeItem("active_order_cart");
        setCart([]);
        setSelectedCustomer(null);
        setCusSearch("");
        setDiscount(0); // 👈 discount reset කරන්න
      }
    } catch (err) {
      console.error("Order Error:", err);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-10 animate-in fade-in duration-500 pb-20">

      <div className="space-y-6">
        <h1 className="text-2xl font-black text-textMain transition-colors duration-300 tracking-tight uppercase">
          Create <span className="text-primary transition-all duration-300">New Order</span>
        </h1>

        {/* STEP 1: PARTNER DETAILS */}
        <div className="bg-background transition-all duration-300 p-6 rounded-[2rem] border border-border transition-colors duration-300 relative">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1.5 h-5 bg-primary transition-all duration-300 rounded-full"></div>
            <h2 className="text-[10px] font-black uppercase text-textMain transition-colors duration-300 tracking-[0.2em]">
              01. Partner Details
            </h2>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search
                className="text-textMain/50 transition-colors duration-300 group-focus-within:text-primary transition-all duration-300"
                size={18}
              />
            </div>
            <input
              type="text"
              placeholder="Search Saloon or Owner..."
              className="w-full pl-14 pr-6 py-4 bg-card transition-colors duration-300 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#b4a460]/20 transition-all shadow-sm"
              value={cusSearch}
              onChange={(e) => handleCustomerSearch(e.target.value)}
            />
          </div>

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && !selectedCustomer && (
            <div className="absolute z-50 left-6 right-6 bg-card transition-colors duration-300 shadow-2xl rounded-2xl mt-2 border border-border transition-colors duration-300 overflow-hidden divide-y divide-gray-50">
              {suggestions.map((c) => (
                <div
                  key={c.customer_id}
                  className="px-6 py-4 hover:bg-primary/10 transition-all duration-300 cursor-pointer flex justify-between items-center group"
                  onClick={() => {
                    setSelectedCustomer(c);
                    setCusSearch(c.saloon_name);
                    setSuggestions([]);
                  }}
                >
                  <div>
                    <p className="font-black text-xs uppercase text-textMain transition-colors duration-300 group-hover:text-primary transition-all duration-300">
                      {c.saloon_name}
                    </p>
                    <p className="text-[9px] text-textMain/50 transition-colors duration-300 font-bold uppercase tracking-widest">
                      {c.owner_name} • {c.phone1}
                    </p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-textMain/50 transition-colors duration-300 group-hover:text-primary transition-all duration-300 transition-all"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Selected Customer Card */}
          {selectedCustomer && (
            <div className="mt-5 p-5 bg-card transition-colors duration-300 rounded-2xl border-2 border-primary/10 transition-all duration-300 flex justify-between items-center shadow-sm animate-in zoom-in-95">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-primary transition-all duration-300">
                  <UserCheck size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-black text-textMain transition-colors duration-300 uppercase">
                    {selectedCustomer.saloon_name}
                  </p>
                  <p className="text-[9px] text-textMain/50 transition-colors duration-300 font-bold uppercase tracking-widest">
                    {selectedCustomer.district} • {selectedCustomer.phone1}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setCusSearch("");
                }}
                className="p-2 text-red-400 hover:text-red-600 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {/* STEP 2: QUEUE SELECTION */}
        <div className="bg-card transition-colors duration-300 p-6 rounded-[2rem] border border-border transition-colors duration-300 min-h-[300px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-5 bg-black rounded-full"></div>
              <h2 className="text-[10px] font-black uppercase text-textMain transition-colors duration-300 tracking-[0.2em]">
                02. Order Queue
              </h2>
            </div>
            <span className="text-[9px] font-black bg-gray-100 px-3 py-1 rounded-full text-textMain/50 transition-colors duration-300 uppercase">
              {cart.length} Items
            </span>
          </div>

          <div className="space-y-3">
            {cart && cart.length > 0 ? (
              cart.map((item) => (
                <div
                  //key={item.product_id} // can't use this because we need to differentiate variants of the same product
                  key={item.cartItemId} 
                  className="p-4 bg-card transition-colors duration-300 rounded-2xl border border-border transition-colors duration-300 flex justify-between items-center group hover:border-primary/30 transition-all duration-300 transition-all"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-black text-[11px] uppercase text-textMain transition-colors duration-300 truncate group-hover:text-primary transition-all duration-300">
                      {item.name}
                    </p>
                    {item.variant_name && item.variant_name !== "Standard" && (
                      <p className="text-[9px] text-primary transition-all duration-300 font-black uppercase mt-0.5">
                        {item.variant_name}
                      </p>
                    )}
                    <p className="text-[10px] font-bold text-textMain/50 transition-colors duration-300 mt-0.5">
                      LKR {(Number(item.price) || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3"> {/* ✅ මේ parent div එකෙන් තමයි දෙක අතර gap එක හදන්නේ */}
                    {/* Quantity Controls Div */}
                    <div className="flex items-center gap-2.5 bg-card transition-colors duration-300 rounded-xl p-1 border border-border transition-colors duration-300">
                      <button 
                        onClick={() => decreaseQty(item.cartItemId)}
                        className="hover:bg-gray-200 rounded-lg p-1 transition-colors"
                      >
                        <Minus size={14} strokeWidth={3} />
                      </button>
                      
                      <span className="font-medium min-w-[20px] text-center">{item.qty}</span>
                      
                      <button 
                        onClick={() => increaseQty(item.cartItemId)}
                        className="hover:bg-gray-200 rounded-lg p-1 transition-colors"
                      >
                        <Plus size={14} strokeWidth={3} />
                      </button>
                    </div>

                    {/* Trash Button Div - දැන් මේක වෙන් වෙලා තියෙන්නේ */}
                    <div className="flex items-center bg-red-50 hover:bg-red-100 rounded-xl p-1 border border-red-100 transition-colors">
                      <button 
                        onClick={() => removeItemCompletely(item.cartItemId)}
                        className="text-red-500 p-1" 
                      >
                        <Trash2 size={16} /> {/* ✅ බින් එක රතු පාටයි */}
                      </button>
                    </div>
                </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-border rounded-[2rem] flex flex-col items-center justify-center">
                <Package size={32} className="text-gray-100 mb-3" />
                <p className="text-[9px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-[0.2em]">
                  Queue is empty
                </p>
              </div>
            )}
          </div>
        </div>

        {/* --- UPDATED LIGHT THEME SUMMARY SECTION --- */}
        <div className="bg-card transition-colors duration-300 p-6 rounded-[2.5rem] border-2 border-primary/10 transition-all duration-300 shadow-xl shadow-[#b4a460]/5 relative overflow-hidden sticky top-6">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 transition-all duration-300 rounded-full -mr-16 -mt-16 blur-3xl"></div>

          <div className="relative z-10 flex flex-col space-y-5">
            {/* 01. Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ClipboardList size={16} className="text-primary transition-all duration-300" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary transition-all duration-300">
                  Order Finalization
                </span>
              </div>
              <p className="text-[9px] text-textMain/50 transition-colors duration-300 font-bold uppercase tracking-widest">
                Pricing Analysis
              </p>
            </div>

            {/* 02. Subtotal Display */}
            <div className="flex justify-between items-center px-1 pt-2 border-b border-border pb-4">
              <span className="text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest">
                Gross Subtotal
              </span>
              <span className="text-sm font-black text-textMain transition-colors duration-300">
                Rs. {totalAmount.toLocaleString()}
              </span>
            </div>

            {/* 03. Discount Percentage Input */}
            <div className="p-4 bg-background transition-all duration-300 rounded-2xl border border-dashed border-border transition-colors duration-300">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest">
                  Discount Rate
                </span>
                <span className="text-[10px] font-black text-primary transition-all duration-300">
                  % Percentage
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={discount}
                  onChange={(e) =>
                    setDiscount(Math.min(100, Math.max(0, e.target.value)))
                  } // 0-100 අතර තියාගන්නවා
                  placeholder="0"
                  className="w-full bg-card transition-colors duration-300 border-none rounded-xl py-3 pl-4 pr-10 text-sm font-black outline-none focus:ring-2 focus:ring-[#b4a460]/20 transition-all text-right shadow-sm"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-primary transition-all duration-300 text-sm">
                  %
                </span>
              </div>
            </div>

            {/* --- PAYMENT METHOD SELECTION --- */}
<div className="p-4 bg-card transition-colors duration-300 rounded-2xl border border-primary/30 transition-all duration-300 shadow-sm mb-4 mt-4">
  <label className="text-[10px] font-black uppercase tracking-widest text-textMain/50 transition-colors duration-300 block mb-3">
    Settlement Mode
  </label>
  <div className="flex gap-2">
    {['cash', 'credit'].map((mode) => (
      <button
        key={mode}
        type="button"
        onClick={() => setPaymentMethod(mode)}
        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
          paymentMethod === mode
            ? 'bg-primary transition-all duration-300 border-primary transition-all duration-300 text-white shadow-lg shadow-[#b4a460]/20'
            : 'bg-card transition-colors duration-300 border-border transition-colors duration-300 text-textMain/50 transition-colors duration-300 hover:border-primary/30 transition-all duration-300'
        }`}
      >
        {mode}
      </button>
    ))}
  </div>
</div>

            {/* 04. Final Payable (Calculation Updated for %) */}
            <div className="py-2 text-right">
              <p className="text-[9px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest mb-1">
                Final Payable
              </p>
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-[10px] font-black text-primary transition-all duration-300">
                  Rs.
                </span>
                <span className="text-4xl font-black text-textMain transition-colors duration-300 tracking-tighter leading-none">
                  {Math.max(
                    0,
                    totalAmount - (totalAmount * (Number(discount) || 0)) / 100,
                  ).toLocaleString()}
                </span>
              </div>
              {discount > 0 && (
                <div className="inline-block mt-2 px-3 py-1 bg-primary/10 transition-all duration-300 rounded-lg">
                  <p className="text-[9px] text-primary transition-all duration-300 font-black uppercase italic tracking-tighter">
                    {discount}% OFF Applied (-Rs.{" "}
                    {((totalAmount * discount) / 100).toLocaleString()})
                  </p>
                </div>
              )}
            </div>

            {/* 05. Action Button */}
            <div className="pt-2">
              <button
                onClick={handlePlaceOrder}
                disabled={cart.length === 0 || !selectedCustomer}
                className="w-full py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] transition-all duration-300 flex items-center justify-center gap-3 shadow-xl group bg-black text-primary transition-all duration-300 border border-black shadow-black/10 hover:bg-primary transition-all duration-300 hover:text-white hover:border-primary transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:bg-gray-100 disabled:text-textMain/50 transition-colors duration-300 disabled:border-border transition-colors duration-300 disabled:shadow-none disabled:scale-100 disabled:cursor-not-allowed"
              >
                <CheckCircle2
                  size={18}
                  strokeWidth={3}
                  className="transition-transform duration-300 group-hover:rotate-12 group-disabled:rotate-0"
                />
                Finalize Order
              </button>
            </div>

            {/* 06. Footer Branding */}
            <div className="flex items-center justify-center gap-3 opacity-20 pt-2">
              <div className="h-[1px] flex-1 bg-gray-400"></div>
              <p className="text-[7px] text-textMain/50 transition-colors duration-300 font-black uppercase tracking-[0.4em]">
                Mehera Registry
              </p>
              <div className="h-[1px] flex-1 bg-gray-400"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOrder;
