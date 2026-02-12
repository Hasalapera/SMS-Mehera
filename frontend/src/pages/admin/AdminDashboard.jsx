import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Package, LogOut, Settings } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  // LocalStorage එකේ අපි කලින් සේව් කරපු user විස්තර ගමු
  const user = JSON.parse(localStorage.getItem('user')) || { full_name: 'Admin' };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Token එක අයින් කරමු
    localStorage.removeItem('user');
    navigate('/login'); // නැවත Login පේජ් එකට
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white font-sans">
      
      {/* Sidebar - වම් පස මෙනුව */}
      <div className="w-64 bg-[#1a1a1a] border-r border-gray-800 p-6 flex flex-col">
        <div className="mb-10">
          <h2 className="text-2xl font-serif tracking-widest text-white">Mehera</h2>
          <p className="text-[10px] text-[#b4a460] tracking-widest uppercase">Admin Panel</p>
        </div>

        <nav className="flex-1 space-y-4">
          <button className="flex items-center gap-3 w-full p-3 rounded-lg bg-[#b4a460]/10 text-[#b4a460] border border-[#b4a460]/20">
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
            <Users size={20} /> Manage Users
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
            <Package size={20} /> Products
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
            <Settings size={20} /> Settings
          </button>
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full p-3 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors mt-auto"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>

      {/* Main Content - දකුණු පස ප්‍රධාන කොටස */}
      <div className="flex-1 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-medium">Hello, <span className="text-[#b4a460]">{user.full_name}</span>!</h1>
            <p className="text-gray-400 text-sm">Welcome to Mehera Sales Management System.</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#EFE185] to-[#9C9355] flex items-center justify-center text-black font-bold text-xl">
            {user.full_name.charAt(0)}
          </div>
        </header>

        {/* සරල Stats කාඩ් කිහිපයක් */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Total Sales</p>
            <h3 className="text-2xl font-bold">LKR 0.00</h3>
          </div>
          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Active Users</p>
            <h3 className="text-2xl font-bold">12</h3>
          </div>
          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Stock Alert</p>
            <h3 className="text-2xl font-bold text-red-500">5 Items Low</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;