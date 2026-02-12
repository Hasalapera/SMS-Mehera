import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  ClipboardList, 
  Truck, 
  AlertTriangle, 
  LogOut, 
  Search,
  CheckCircle2
} from 'lucide-react';

const StoreKeeper = () => {
  const navigate = useNavigate();
  // LocalStorage එකෙන් User විස්තර ලබා ගැනීම
  const user = JSON.parse(localStorage.getItem('user')) || { full_name: 'Store Keeper' };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white font-sans">
      
      {/* Sidebar - Store Menu */}
      <div className="w-64 bg-[#1a1a1a] border-r border-gray-800 p-6 flex flex-col">
        <div className="mb-10">
          <h2 className="text-2xl font-serif tracking-widest text-white leading-none">Mehera</h2>
          <p className="text-[10px] text-[#b4a460] tracking-[0.2em] uppercase mt-1">Store Management</p>
        </div>

        <nav className="flex-1 space-y-4">
          <button className="flex items-center gap-3 w-full p-3 rounded-lg bg-[#b4a460]/10 text-[#b4a460] border border-[#b4a460]/20 font-medium">
            <ClipboardList size={20} /> Pending Orders
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
            <Box size={20} /> Inventory Stock
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
            <Truck size={20} /> Dispatched
          </button>
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full p-3 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors mt-auto"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-medium">Store Overview</h1>
            <p className="text-gray-400 text-sm">Welcome, <span className="text-[#b4a460] font-medium">{user.full_name}</span>. Ready for dispatch?</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search Order ID..." 
              className="bg-[#1a1a1a] border border-gray-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#b4a460] transition-colors"
            />
          </div>
        </header>

        {/* Store Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
              <ClipboardList size={28} />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">To be Packed</p>
              <h3 className="text-2xl font-bold">12 Orders</h3>
            </div>
          </div>
          
          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
              <AlertTriangle size={28} />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Low Stock Items</p>
              <h3 className="text-2xl font-bold">05 Products</h3>
            </div>
          </div>

          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Completed Today</p>
              <h3 className="text-2xl font-bold">28 Dispatches</h3>
            </div>
          </div>
        </div>

        {/* Pending Packaging List */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium">Pending Shipments</h2>
            <button className="text-[#b4a460] text-sm hover:underline">View All</button>
          </div>
          
          <div className="space-y-4">
            {[
              { id: "ORD-9921", customer: "Kasun Perera", items: "Gold Facial Kit x 2", status: "In-Queue" },
              { id: "ORD-9925", customer: "Nilmini Silva", items: "Aloe Gel x 5, Serum x 1", status: "Packing" },
              { id: "ORD-9928", customer: "Saman Kumara", items: "Night Cream x 1", status: "In-Queue" }
            ].map((order, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-gray-800/50">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#b4a460]/10 rounded-lg flex items-center justify-center text-[#b4a460]">
                    <Box size={22} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-200">{order.id}</h4>
                    <p className="text-xs text-gray-500">{order.items}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                    order.status === 'Packing' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {order.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-2">{order.customer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreKeeper;