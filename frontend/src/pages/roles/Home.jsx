import React, { useState } from 'react';
import { Search, ChevronDown, Trophy } from 'lucide-react';
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
    <div className="min-h-screen bg-black text-white">
      {/* 1. Ranking Section - Sales Rep & Store Keeper Ranking */}
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {rankings.map((person) => (
          <div key={person.rank} className="bg-[#1A1A1A] border border-[#C0B26D]/30 p-4 rounded-xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#EFE185] to-[#C0B26D] rounded-full flex items-center justify-center text-black font-bold">
                {person.rank}
              </div>
              <div>
                <p className="text-xs font-bold">{person.name}</p>
                <p className="text-[10px] text-gray-500 uppercase">{person.role}</p>
              </div>
            </div>
            <div className="text-right text-[#C0B26D]">
              <p className="text-sm font-black">{person.points} pts</p>
              <p className="text-[8px] uppercase tracking-tighter text-gray-400 font-bold">Performance Rank</p>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Search & Filter Bar - image එකේ තියෙන විදිහට */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <input 
            type="text" 
            placeholder="Search Products..." 
            className="w-full bg-gradient-to-r from-[#EFE185] to-[#C0B26D] text-black px-12 py-3 rounded-full outline-none font-bold placeholder-black/50"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={20} />
        </div>
        <button className="bg-gradient-to-r from-[#EFE185] to-[#C0B26D] text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 min-w-[200px] justify-between shadow-xl">
          All Categories <ChevronDown size={18} />
        </button>
      </div>

      {/* 3. Product Catalog */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-10">
          <h2 className="bg-white text-black text-xs font-black px-4 py-2 inline-block mb-6 uppercase tracking-widest">
            Product Category 01
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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