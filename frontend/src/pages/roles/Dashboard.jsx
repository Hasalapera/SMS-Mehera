import React, { useState } from 'react';
import SideBar from '../../components/SideBar';
import { useNavigate } from 'react-router-dom'; 
import { 
  LayoutDashboard, Bell, ArrowUpRight, MoreVertical, 
  PlusCircle, SlidersHorizontal, Download, RefreshCw 
} from 'lucide-react';
import { useEffect } from 'react';
import { use } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [trendingProducts, setTrendinngProducts] = useState([]);
  

  // useEffect(() => {
  //   const fetchTrendingProducts = async () => {
  //     try {
  //       const response = await axios.get('http://localhost:5001/api/products/getProducts');
  //       if(response.data && response.data.products && Array.isArray(response.data.products)){
  //         setTrendinngProducts(response.data.products.slice(0, 4));
  //       }else{
  //         console.log("No data received or data is not an array");
  //         setTrendinngProducts([]);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching trending products:', error);
  //     }finally{
  //       // setLoading(false);
  //     }
  //   };

  //   fetchTrendingProducts();
  // }, []);

  // const user = JSON.parse(localStorage.getItem('user'))
  // const user = JSON.parse(localStorage.getItem('user')) || { full_name: 'Admin User' };

  useEffect(() => {
    const storeUser = localStorage.getItem('user');
    if(!storeUser || storeUser === "undefined"){
      navigate('/login');
    }else{
      setUser(JSON.parse(storeUser));
    }
  }, [navigate]);

  if(!user){
    return <div className="min-h-screen bg-background transition-all duration-300 flex items-center justify-center text-textMain transition-colors duration-300 font-bold"> Loading </div>
  }

  const stats = [
    { title: "Total Sales", value: "536,254 LKR", change: "+ 238.28 LKR", color: "text-green-500" },
    { title: "Customers", value: "728", change: "+ 45 Customers", color: "text-green-500" },
    { title: "Orders", value: "448", change: "- 45 Orders", color: "text-red-500" },
  ];

  const performers = [
    { name: "Kavindu Githmal", role: "Downsouth Distributer", val: "96,000 LKR", progress: 65 },
    { name: "Kavindu Githmal", role: "Downsouth Distributer", val: "124,000 LKR", progress: 85 },
    { name: "Kavindu Githmal", role: "Downsouth Distributer", val: "22,000 LKR", progress: 20 },
    { name: "Kavindu Githmal", role: "Downsouth Distributer", val: "55,000 LKR", progress: 45 },
  ];

  return (
      <main className={`w-full`}>
        
        {/* Header Section */}
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-textMain/50 transition-colors duration-300 text-sm font-medium">
            <LayoutDashboard size={18} className="text-primary transition-all duration-300" /> <span>Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 bg-card transition-colors duration-300 border border-border transition-colors duration-300 rounded-lg text-textMain/50 transition-colors duration-300 shadow-sm relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary transition-all duration-300 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 bg-card transition-colors duration-300 p-1 pr-4 border border-border transition-colors duration-300 rounded-xl shadow-sm">
              <img src={user?.picture_url || `https://ui-avatars.com/api/?name=${user?.full_name || 'User'}&background=b4a460&color=fff`} className="w-10 h-10 rounded-lg object-cover" alt="user" />
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-textMain transition-colors duration-300 leading-tight">{user.full_name}</p>
                <p className="text-[10px] text-textMain/50 transition-colors duration-300 uppercase tracking-tighter">
                  {user.role === 'admin' && 'System Administrator'}
                  {user.role === 'manager' && 'Manager'}
                  {user.role === 'sales_rep' && 'Sales Representative'}
                  {user.role === 'store_keeper' && 'Inventory Controller'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Action Buttons Bar (Filter, Customize, Export) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-textMain/50 transition-colors duration-300">
            <RefreshCw size={14} className="text-primary transition-all duration-300" />
            Last updated Quick Book, 9 March 2026
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="flex items-center gap-2 bg-card transition-colors duration-300 border border-border transition-colors duration-300 px-3 py-2 rounded-lg text-xs font-bold text-textMain/50 transition-colors duration-300 hover:bg-card transition-colors duration-300">
              <PlusCircle size={14} /> Customize widget
            </button>
            <button className="flex items-center gap-2 bg-card transition-colors duration-300 border border-border transition-colors duration-300 px-3 py-2 rounded-lg text-xs font-bold text-textMain/50 transition-colors duration-300 hover:bg-card transition-colors duration-300">
              <SlidersHorizontal size={14} /> Filter
            </button>
            <button className="flex items-center gap-2 bg-primary transition-all duration-300 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-lg hover:bg-[#9a8b50] transition-colors">
              <Download size={14} /> Export Backup File
            </button>
          </div>
        </div>

        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-card transition-colors duration-300 p-6 rounded-[1.5rem] border border-border transition-colors duration-300 shadow-sm group hover:shadow-md transition-all">
              <div className="flex justify-between items-center mb-4 text-xs font-semibold text-textMain/50 transition-colors duration-300">
                <span>{stat.title}</span>
                <select className="bg-card transition-colors duration-300 border-none rounded p-1 text-[10px] outline-none font-bold"><option>This month</option></select>
              </div>
              <h3 className="text-3xl font-bold text-textMain transition-colors duration-300 mb-1">{stat.value}</h3>
              <p className={`text-[10px] font-bold ${stat.color}`}>{stat.change} <span className="text-textMain/50 transition-colors duration-300 font-normal">than last month</span></p>
              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-textMain/50 transition-colors duration-300 group-hover:text-primary transition-all duration-300 cursor-pointer">
                View Report <ArrowUpRight size={14} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts & Products Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-2 bg-card transition-colors duration-300 p-6 md:p-8 rounded-[1.5rem] border border-border transition-colors duration-300 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center mb-10">
              <h4 className="text-sm font-bold">Sales analytics</h4>
              <div className="flex items-center gap-4 text-[10px] font-bold">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary transition-all duration-300"></span> Hot Lead</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#EFE185]"></span> Warm Lead</div>
                <select className="bg-card transition-colors duration-300 border-none rounded p-1 outline-none"><option>This week</option></select>
              </div>
            </div>
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[500px] h-64 flex items-end justify-between gap-2 border-b border-border transition-colors duration-300 relative pt-10 px-4">
                  {['29 Sep', '30 Sep', '31 Sep', '01 Nov', '02 Nov', '03 Nov', '04 Nov'].map((day, i) => (
                      <div key={day} className="flex-1 flex flex-col items-center gap-2 relative z-10 group">
                          <div className="w-10 bg-card transition-colors duration-300 rounded-lg h-40 relative overflow-hidden flex flex-col justify-end group-hover:bg-gray-100 transition-colors">
                              <div className="w-full bg-[#EFE185] rounded-t" style={{height: `${20 + (i*10)}%`}}></div>
                              <div className="w-full bg-primary transition-all duration-300" style={{height: `${15 + (i*5)}%`}}></div>
                          </div>
                          <span className="text-[8px] text-textMain/50 transition-colors duration-300 font-bold">{day}</span>
                      </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Trending Products */}
          {/* <div className="bg-card transition-colors duration-300 p-6 md:p-8 rounded-[1.5rem] border border-border transition-colors duration-300 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-sm font-bold text-textMain transition-colors duration-300">Trending Products</h4>
              <MoreVertical size={16} className="text-textMain/50 transition-colors duration-300 cursor-pointer" />
            </div>
            <div className="space-y-6">
              {trendingProducts.length > 0 ? (
                trendingProducts.map((item, idx) => (
                  <div key={item.id || `prod-${idx}`} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3 text-left"> */}
                      {/* Database එකේ තියෙන Image එක පෙන්නන්න */}
                      {/* <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden shadow-inner"> */}
                        {/* <img 
                          // item?.productImage තියෙනවාද කියලා බලලා විතරක් URL එක හදන්න
                          src={item?.productImage ? `http://localhost:5001/${item.productImage}` : 'https://placehold.co/100x100?text=No+Image'} 
                          className="w-full h-full object-cover" 
                          alt={item?.productName || 'Product'} 
                          onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=No+Image' }}
                        />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold group-hover:text-primary transition-all duration-300">
                          {item.product_name ? item.product_name.split(" ").slice(0, 3).join(" ") + (item.product_name.split(" ").length > 3 ? "..." : "") : 'Mehera Collection'}
                        </p>
                        <p className="text-[8px] text-textMain/30 transition-colors duration-300 line-clamp-1">
                          {item.description ? item.description.split(" ").slice(0, 3).join(" ") + (item.description.split(" ").length > 3 ? "..." : "") : 'Mehera Collection'}
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] font-bold">{item.status} LKR</p>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-center text-textMain/50">No products available</p>
              )}
            </div> */}
          {/* </div> */}
        </div>

        {/* Top Performers Table */}
        <div className="bg-card transition-colors duration-300 p-6 md:p-8 rounded-[1.5rem] border border-border transition-colors duration-300 shadow-sm mb-12">
          <div className="flex justify-between items-center mb-8 text-textMain transition-colors duration-300">
            <h4 className="text-sm font-bold">Top performers for the Month</h4>
            <MoreVertical size={16} className="text-textMain/50 transition-colors duration-300 cursor-pointer" />
          </div>
          <div className="space-y-6">
            {performers.map((rep, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 text-left">
                  <img src={`https://i.pravatar.cc/150?u=${idx}`} className="w-10 h-10 rounded-full object-cover" alt="rep" />
                  <div>
                    <h5 className="text-[11px] font-bold text-textMain transition-colors duration-300">{rep.name}</h5>
                    <p className="text-[9px] text-textMain/50 transition-colors duration-300 leading-none">{rep.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-1 max-w-sm hidden sm:flex">
                   <div className="flex-1 h-6 bg-card transition-colors duration-300 rounded-lg relative overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#EFE185] to-[#b4a460] opacity-80" style={{ width: `${rep.progress}%` }}></div>
                   </div>
                   <p className="text-[11px] font-bold text-textMain transition-colors duration-300 min-w-[70px] text-right">{rep.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
  );
};

export default Dashboard;