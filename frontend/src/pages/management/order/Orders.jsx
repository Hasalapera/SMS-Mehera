import React, { useState } from 'react';
import { 
  ShoppingBag, PlusCircle, History, TrendingUp, 
  Truck, ClipboardList, Filter 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ViewOrders from './ViewOrders';

// Import කරගන්න ඔයාගේ Order පේජ් ටික
import AddOrder from './AddOrder';
// import ViewOrders from './ViewOrders'; // පස්සේ හදාගන්න පුළුවන්

const Orders = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('create');
  const userRole = user?.role;

  // --- පර්මිෂන් ලොජික් එක ---
  const canCreate = ['admin', 'sales_rep'].includes(userRole);
  const canViewAll = ['admin', 'manager'].includes(userRole);
  const canViewReports = ['admin', 'manager'].includes(userRole);

  // ටැබ්ස් ව්‍යුහය
  const tabs = [
    { id: 'create', label: 'Create Order', icon: PlusCircle, show: canCreate },
    { id: 'history', label: 'Order History', icon: History, show: true }, // හැමෝටම තමන්ගේ ඉතිහාසය බලන්න පුළුවන්
    { id: 'tracking', label: 'Dispatch/Logistics', icon: Truck, show: true },
    { id: 'analytics', label: 'Sales Insights', icon: TrendingUp, show: canViewReports },
  ];

  return (
    <div className="min-h-screen bg-[#fdfdfb] p-6 md:p-10">
      <Toaster position="top-right" />
      
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto mb-10 text-left flex justify-between items-end">
        <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-1 flex bg-black"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b4a460]">
                    Transaction Engine
                </span>
            </div>
            <h1 className="text-4xl font-serif text-black uppercase tracking-tight">
                Order <span className="italic text-[#b4a460]">Management</span>
            </h1>
        </div>
        
        {/* Quick Summary Pill (Only for Admin/Manager) */}
        {canViewReports && (
            <div className="hidden md:flex gap-4">
                <div className="bg-white border border-gray-100 px-6 py-3 rounded-2xl shadow-sm">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Today's Volume</p>
                    <p className="text-lg font-black text-black">Rs. 142,500</p>
                </div>
            </div>
        )}
      </div>

      {/* TABS NAVIGATION */}
      <div className="max-w-7xl mx-auto mb-8 overflow-x-auto">
        <div className="flex gap-2 border-b border-gray-100 min-w-max pb-px">
          {tabs.map((tab) => (
            tab.show && (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 relative ${
                  activeTab === tab.id 
                  ? 'text-black border-b-2 border-[#b4a460]' 
                  : 'text-gray-300 hover:text-gray-500'
                }`}
              >
                <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                {tab.label}
              </button>
            )
          ))}
        </div>
      </div>

      {/* DYNAMIC CONTENT AREA */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-[3rem] border border-gray-50 shadow-sm min-h-[600px] overflow-hidden">
          
          {/* Active Tab Content */}
          <div className="animate-in fade-in duration-500">
            {activeTab === 'create' && <AddOrder />}
            
            {activeTab === 'history' && (
    <div className="p-10 text-left">
        <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-serif">Recent <span className="italic">Transactions</span></h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-all">
                <Filter size={14}/> Filter Results
            </button>
        </div>

        {/* මෙන්න මෙතනදී තමයි අලුත් Table එක පෙන්වන්නේ */}
        <ViewOrders /> 
    </div>
)}

            {activeTab === 'tracking' && (
               <div className="py-32 text-center">
                  <Truck className="mx-auto text-[#b4a460] mb-6 opacity-20" size={64} />
                  <h3 className="text-xl font-serif italic text-gray-400">Logistics tracking coming soon</h3>
               </div>
            )}

            {activeTab === 'analytics' && (
               <div className="p-10">
                  <h2 className="text-xs font-black uppercase tracking-widest text-[#b4a460] mb-8">Performance Metrics</h2>
                  {/* Chart එකක් වගේ දෙයක් මෙතනට දාන්න පුළුවන් */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-gray-50 rounded-[2rem] animate-pulse"></div>
                    ))}
                  </div>
               </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Orders;