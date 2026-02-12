import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  ShoppingBag, 
  Users, 
  History, 
  LogOut, 
  TrendingUp, 
  CheckCircle 
} from 'lucide-react';

const SalesRepDashboard = () => {
  const navigate = useNavigate();
  // LocalStorage එකෙන් Sales Rep ගේ නම ගමු
  const user = JSON.parse(localStorage.getItem('user')) || { full_name: 'Sales Rep' };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white font-sans">
      
      {/* Sidebar - Sales Rep Menu */}
      <div className="w-64 bg-[#1a1a1a] border-r border-gray-800 p-6 flex flex-col">
        <div className="mb-10">
          <h2 className="text-2xl font-serif tracking-widest text-white">Mehera</h2>
          <p className="text-[10px] text-[#b4a460] tracking-widest uppercase">Sales Portal</p>
        </div>

        <nav className="flex-1 space-y-4">
          <button className="flex items-center gap-3 w-full p-3 rounded-lg bg-[#b4a460]/10 text-[#b4a460] border border-[#b4a460]/20">
            <Home size={20} /> Home
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
            <ShoppingBag size={20} /> New Order
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
            <Users size={20} /> My Customers
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
            <History size={20} /> Sale History
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
            <h1 className="text-3xl font-medium">Welcome, <span className="text-[#b4a460]">{user.full_name}</span></h1>
            <p className="text-gray-400 text-sm">Have a productive sales day at Mehera!</p>
          </div>
        </header>

        {/* Sales Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-[#1a1a1a] p-5 rounded-xl border border-gray-800">
            <TrendingUp className="text-[#b4a460] mb-3" size={24} />
            <p className="text-gray-400 text-xs">Today's Sales</p>
            <h3 className="text-xl font-bold">LKR 12,450.00</h3>
          </div>
          <div className="bg-[#1a1a1a] p-5 rounded-xl border border-gray-800">
            <CheckCircle className="text-green-500 mb-3" size={24} />
            <p className="text-gray-400 text-xs">Target Achievement</p>
            <h3 className="text-xl font-bold">75%</h3>
          </div>
          <div className="bg-[#1a1a1a] p-5 rounded-xl border border-gray-800">
            <ShoppingBag className="text-blue-500 mb-3" size={24} />
            <p className="text-gray-400 text-xs">Orders Pending</p>
            <h3 className="text-xl font-bold">04</h3>
          </div>
          <div className="bg-[#1a1a1a] p-5 rounded-xl border border-gray-800">
            <Users className="text-purple-500 mb-3" size={24} />
            <p className="text-gray-400 text-xs">New Leads</p>
            <h3 className="text-xl font-bold">02</h3>
          </div>
        </div>

        {/* Recent Activities Section */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-6">
          <h2 className="text-xl font-medium mb-4">Recent Sales Activity</h2>
          <div className="space-y-4">
            {/* Sample Activity List */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-gray-800/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#b4a460]/20 flex items-center justify-center text-[#b4a460]">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-200">Order #MEH-00{item}</p>
                    <p className="text-xs text-gray-500">To: Customer Name {item}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#b4a460] text-sm">LKR 4,500.00</p>
                  <p className="text-[10px] text-gray-500">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesRepDashboard;