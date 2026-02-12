import React, { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react'; // Optional: npm install lucide-react

const productsData = [
  { id: 1, name: 'Premium Headphones', price: 120, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop' },
  { id: 2, name: 'Smart Watch', price: 85, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop' },
  { id: 3, name: 'Wireless Mouse', price: 45, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&h=200&fit=crop' },
];

export default function CartPage() {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(cart.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(item => item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <ShoppingCart size={32} /> Storefront
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PRODUCT LIST SECTION */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Available Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {productsData.map((product) => (
                <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                  <img src={product.image} alt={product.name} className="w-32 h-32 object-cover rounded-lg mb-4" />
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-gray-500 mb-4">${product.price}</p>
                  <button 
                    onClick={() => addToCart(product)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* CART SUMMARY SECTION */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-fit">
            <h2 className="text-xl font-bold mb-4">Your Cart ({cart.length})</h2>
            
            {cart.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Your cart is empty.</p>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-4 gap-4">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt="" className="w-12 h-12 rounded bg-gray-100" />
                      <div>
                        <p className="font-medium text-sm sm:text-base">{item.name}</p>
                        <p className="text-gray-500 text-xs">${item.price}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-gray-100 rounded-lg">
                        <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:text-blue-600"><Minus size={16}/></button>
                        <span className="px-2 text-sm font-bold">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:text-blue-600"><Plus size={16}/></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <button className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition">
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}