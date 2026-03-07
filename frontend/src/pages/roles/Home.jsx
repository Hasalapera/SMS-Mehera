import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import ProductCard from '../../components/ProductCard';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Dummy Data for Ranking
  const rankings = [
    { name: "Kasun Perera", role: "Sales Rep", points: "1,250", rank: 1 },
    { name: "Amali Silva", role: "Store Keeper", points: "980", rank: 2 },
  ];

  // Dummy Products for Catalog
  const products = [
    { id: 1, name: "OPI Nail Polish", price: "6,999", category: "Cosmetics" },
    { id: 2, name: "Sunscreen Lotion", price: "6,999", category: "Skin Care" },
    { id: 3, name: "Wholesale Liquid", price: "6,999", category: "Cleaning" },
    { id: 4, name: "Matte Lipstick", price: "4,500", category: "Cosmetics" },
  ];

  return (
    <div className="w-full min-h-screen bg-white text-black overflow-x-hidden">
      
      {/* 1. Ranking Section - Sales Rep & Store Keeper Ranking */}
      <div className="w-full max-w-full px-4 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {rankings.map((person) => (
          <div key={person.rank} className="bg-[#1A1A1A] border border-gray-800 p-5 rounded-2xl flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-5">
              <div className="w-11 h-11 bg-gradient-to-br from-[#EFE185] to-[#C0B26D] rounded-full flex items-center justify-center text-black font-black text-sm shadow-inner">
                {person.rank}
              </div>
              <div>
                <p className="text-white text-sm font-bold tracking-tight">{person.name}</p>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-0.5">{person.role}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[#C0B26D] text-base font-black tracking-tighter">{person.points} pts</p>
              <p className="text-[8px] uppercase tracking-[0.1em] text-gray-500 font-bold">Performance Rank</p>
            </div>
          </div>
        ))}
      </div>

      {/* 🔴 2. SEARCH & FILTER BAR - UPDATED TO MATCH IMAGE */}
      <div className="max-w-full px-8 py-6 flex flex-col md:flex-row gap-5 items-center">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2">
            <Search size={20} className="text-[#b4a460] transition-transform group-focus-within:scale-110" strokeWidth={2.5} />
          </div>
          <input
            type="text"
            placeholder="Search Products..."
            className="w-full bg-[#F3F3F3] text-black pl-16 pr-6 py-4.5 rounded-[2.5rem] outline-none font-semibold placeholder-gray-400 border-2 border-transparent focus:border-[#b4a460]/10 focus:bg-white transition-all shadow-sm text-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* All Categories Button */}
        <button className="w-full md:w-auto bg-[#F3F3F3] hover:bg-[#ebebeb] text-black px-10 py-4.5 rounded-[2.5rem] font-black flex items-center gap-6 min-w-[240px] justify-between transition-all border border-transparent active:scale-95">
          <span className="text-[11px] uppercase tracking-[0.15em]">All Categories</span>
          <ChevronDown size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* 3. Product Catalog */}
      <div className="max-w-full px-8 py-6">
        <div className="mb-10">
          <h2 className="text-black text-[10px] font-black px-1 py-2 inline-block mb-8 uppercase tracking-[0.3em] border-b-2 border-[#b4a460]">
            Product Category 01
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;