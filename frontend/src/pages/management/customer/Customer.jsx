import React, { useState } from 'react';
import { 
  Users, UserPlus, UserMinus, UserCheck, 
  ShieldAlert, Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import AddCustomer from './AddCustomer';
import ViewCustomer from './ViewCustomer';

const Customer = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('view');
  const userRole = user?.role;

  const canAdd = ['admin', 'sales_rep'].includes(userRole);
  const canDelete = ['admin'].includes(userRole);
  const canView = ['admin', 'manager', 'sales_rep'].includes(userRole);

  const tabs = [
    { id: 'view', label: 'View All Customers', icon: Users, show: canView },
    { id: 'add', label: 'New Registration', icon: UserPlus, show: canAdd },
    { id: 'status', label: 'Credit Status', icon: UserCheck, show: canView },
    { id: 'delete', label: 'Archive Portal', icon: UserMinus, show: canDelete },
  ];

  return (
    <div className="min-h-screen bg-[#fdfdfb] p-4 sm:p-6 md:p-10 transition-all duration-300">
      
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto mb-8 md:mb-12 text-left">
        <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-1 flex bg-black"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b4a460]">
                Customer Relations
            </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif text-black uppercase tracking-tight">
            Customer <span className="italic text-[#b4a460]">Intelligence</span>
        </h1>
      </div>

      {/* TABS NAVIGATION - Orders Style (Fixed and Optimized) */}
      <div className="max-w-7xl mx-auto mb-8 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex gap-2 border-b border-gray-100 min-w-max pb-px">
          {tabs.map((tab) => (
            tab.show && (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 relative whitespace-nowrap ${
                  activeTab === tab.id 
                  ? 'text-black border-b-2 border-[#b4a460]' 
                  : 'text-gray-300 hover:text-gray-500'
                }`}
              >
                <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                <span className={`${activeTab === tab.id ? 'block' : 'hidden sm:block'}`}>
                    {tab.label}
                </span>
              </button>
            )
          ))}
        </div>
      </div>

      {/* DYNAMIC CONTENT AREA */}
      <div className="max-w-7xl mx-auto">
        {/* Content Container - Orders style (rounded-[3rem]) */}
        <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-gray-50 shadow-sm min-h-[600px] overflow-hidden">
          
          <div className="animate-in fade-in duration-500 w-full h-full">
            {activeTab === 'view' && (
                <div className="p-0 md:p-2">
                    <ViewCustomer />
                </div>
            )}
            
            {activeTab === 'add' && (
                <div className="p-0 md:p-2">
                    <AddCustomer />
                </div>
            )}
            
            {activeTab === 'status' && (
               <div className="py-24 text-center flex flex-col items-center">
                  <ShieldAlert className="text-[#b4a460] mb-6 opacity-20" size={64} />
                  <h3 className="text-xl font-serif italic text-gray-400">Credit monitoring is being synced</h3>
                  <p className="text-gray-400 text-[9px] mt-2 uppercase font-bold tracking-widest text-center">Version 1.0.4 Data Link Active</p>
               </div>
            )}

            {activeTab === 'delete' && (
               <div className="p-10 text-left">
                  <h2 className="text-xs font-black uppercase tracking-widest text-red-500 mb-6">Security & Archive</h2>
                  <div className="p-10 border-2 border-dashed border-gray-50 rounded-[2rem] text-center">
                    <UserMinus className="mx-auto text-gray-200 mb-4" size={48} />
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Archive portal is restricted to root administrators</p>
                  </div>
               </div>
            )}
          </div>

        </div>
      </div>

      <div className="h-10 md:hidden"></div>
    </div>
  );
};

export default Customer;