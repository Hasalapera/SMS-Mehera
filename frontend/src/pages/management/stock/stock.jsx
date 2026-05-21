// import React, { useState, useRef } from 'react';
// import { Search, ChevronDown, AlertTriangle, AlertCircle, Star } from 'lucide-react';

// const Stock = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("All Categories");
//   const [highlightedId, setHighlightedId] = useState(null);
  
//   const productRefs = useRef({});

//   const stockData = [
//     { id: 1, name: "OPI Nail Polish", price: "6,999", category: "Cosmetics", qty: 25 },
//     { id: 2, name: "Matte Lipstick", price: "4,500", category: "Cosmetics", qty: 50 },
//     { id: 3, name: "Foundation Cream", price: "5,200", category: "Cosmetics", qty: 12 },
//     { id: 4, name: "Eye Liner", price: "1,800", category: "Cosmetics", qty: 30 },
//     { id: 5, name: "Blush Palette", price: "3,500", category: "Cosmetics", qty: 7 },
//     { id: 6, name: "Sunscreen Lotion", price: "6,999", category: "Skin Care", qty: 15 },
//     { id: 7, name: "Face Wash 100ML", price: "1,200", category: "Skin Care", qty: 5 },
//     { id: 8, name: "Night Cream", price: "4,000", category: "Skin Care", qty: 22 },
//     { id: 9, name: "Body Lotion", price: "2,500", category: "Skin Care", qty: 18 },
//     { id: 10, name: "Face Scrub", price: "1,500", category: "Skin Care", qty: 45 },
//     { id: 11, name: "Wholesale Liquid", price: "6,999", category: "Cleaning", qty: 8 },
//     { id: 12, name: "Glass Cleaner", price: "900", category: "Cleaning", qty: 60 },
//     { id: 13, name: "Floor Wash", price: "1,350", category: "Cleaning", qty: 4 },
//     { id: 14, name: "Dish Soap", price: "750", category: "Cleaning", qty: 10 },
//     { id: 15, name: "Hand Sanitizer", price: "450", category: "Cleaning", qty: 100 },
//   ];

//   const categories = ["All Categories", "Cosmetics", "Skin Care", "Cleaning"];

//   const handleAlertClick = (id) => {
//     setHighlightedId(id);
//     productRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     setTimeout(() => setHighlightedId(null), 5000); 
//   };

//   const filteredStock = stockData.filter(item => {
//     const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesCategory = selectedCategory === "All Categories" || item.category === selectedCategory;
//     return matchesSearch && matchesCategory;
//   });

//   const groupedProducts = filteredStock.reduce((acc, product) => {
//     if (!acc[product.category]) acc[product.category] = [];
//     acc[product.category].push(product);
//     return acc;
//   }, {});

//   return (
//     <div className="w-full min-h-screen bg-background transition-all duration-300 text-textMain transition-colors duration-300 px-8 py-10">
      
//       {/* HEADER & SEARCH BAR */}
//       <div className="flex flex-col xl:flex-row justify-between items-center mb-12 gap-8">
//         <div className="w-full xl:w-auto">
//           <h1 className="text-3xl font-black uppercase tracking-tight text-textMain transition-colors duration-300">
//             STOCK <span className="text-primary transition-all duration-300">INVENTORY</span>
//           </h1>
//           <p className="text-[10px] text-textMain/50 transition-colors duration-300 font-bold uppercase tracking-[0.4em] mt-1">Mehera International Products</p>
//         </div>

//         <div className="flex flex-col md:flex-row gap-5 w-full xl:w-[70%]">
//           <div className="relative flex-1 group">
//             <div className="absolute left-6 top-1/2 -translate-y-1/2">
//               <Search size={20} className="text-primary transition-all duration-300" strokeWidth={2.5} />
//             </div>
//             <input 
//               type="text" 
//               placeholder="Search Products..." 
//               className="w-full bg-background transition-all duration-300 text-textMain transition-colors duration-300 pl-16 pr-6 py-4.5 rounded-[2.5rem] outline-none font-semibold placeholder-gray-400 border-2 border-transparent focus:border-primary/10 transition-all duration-300 focus:bg-card transition-colors duration-300 transition-all shadow-sm text-sm"
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
          
//           <div className="relative min-w-[260px]">
//             <select 
//               className="w-full appearance-none bg-background transition-all duration-300 text-textMain transition-colors duration-300 px-10 py-4.5 rounded-[2.5rem] font-black cursor-pointer shadow-sm outline-none text-[11px] uppercase tracking-widest border border-transparent hover:bg-card transition-all duration-300 transition-all"
//               value={selectedCategory}
//               onChange={(e) => setSelectedCategory(e.target.value)}
//             >
//               {categories.map(cat => (
//                 <option key={cat} value={cat} className="bg-card transition-colors duration-300 text-textMain transition-colors duration-300 font-bold uppercase tracking-widest">
//                   {cat}
//                 </option>
//               ))}
//             </select>
//             <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-textMain transition-colors duration-300" size={20} strokeWidth={2.5} />
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-12 gap-8">
//         {/* PRODUCTS AREA */}
//         <div className="col-span-12 xl:col-span-9">
//           {Object.keys(groupedProducts).length > 0 ? (
//             Object.keys(groupedProducts).map(categoryName => (
//               <div key={categoryName} className="mb-12">
//                 <h2 className="text-textMain transition-colors duration-300 text-[10px] font-black mb-8 uppercase tracking-[0.2em] inline-block pb-1">
//                   PRODUCT CATEGORY {categoryName.toUpperCase()}
//                 </h2>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//                   {groupedProducts[categoryName].map(item => {
//                     const isCritical = item.qty <= 10;
//                     const isWarning = item.qty > 10 && item.qty <= 20;
//                     const isHighlighted = highlightedId === item.id;

//                     return (
//                       <div 
//                         key={item.id}
//                         ref={el => productRefs.current[item.id] = el}
//                         className={`bg-card transition-colors duration-300 rounded-sm overflow-hidden transition-all duration-500 border border-border transition-colors duration-300 shadow-sm
//                           ${isHighlighted ? 'scale-105 z-10' : 'hover:shadow-md'}`}
//                         style={isHighlighted ? { 
//                           boxShadow: `0 0 30px ${isCritical ? 'rgba(239, 68, 68, 0.4)' : 'rgba(180, 164, 96, 0.4)'}`,
//                           borderColor: isCritical ? '#ef4444' : '#b4a460',
//                           borderWidth: '2px'
//                         } : {}}
//                       >
//                         <div className="bg-primary transition-all duration-300 p-6 aspect-square flex items-center justify-center relative">
//                           <div className="w-[85%] h-[85%] bg-[#9c8e52] flex items-center justify-center border border-[#8a7d48]">
//                             <p className="text-[#ded6b5] font-medium text-4xl text-center leading-tight">No Image</p>
//                           </div>
                          
//                           <div className={`absolute top-0 right-0 px-3 py-1.5 text-[10px] font-black uppercase text-white shadow-md
//                             ${isCritical ? 'bg-red-600 animate-pulse' : (isWarning ? 'bg-primary transition-all duration-300' : 'bg-black/40')}`}>
//                             QTY: {item.qty}
//                           </div>
//                         </div>

//                         <div className="p-4 bg-card transition-colors duration-300">
//                           <div className="flex justify-between items-start gap-2 mb-1">
//                             <h3 className="font-bold text-[13px] text-textMain transition-colors duration-300 leading-tight uppercase truncate">{item.name}</h3>
//                             <span className="font-bold text-[13px] text-primary transition-all duration-300">{item.price} LKR</span>
//                           </div>
//                           <p className="text-[10px] text-textMain/50 transition-colors duration-300 italic mb-3">Popular</p>
//                           <div className="flex justify-between items-center">
//                             <div className="flex gap-0.5">
//                               {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-[#b4a460] text-primary transition-all duration-300" />)}
//                             </div>
//                             <span className={`text-[8px] font-black uppercase tracking-wider
//                               ${isCritical ? 'text-red-600' : (isWarning ? 'text-primary transition-all duration-300' : 'text-textMain/50 transition-colors duration-300')}`}>
//                               {isCritical ? 'Critical Stock' : (isWarning ? 'Low Stock' : 'In Stock')}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="text-center py-24 bg-card transition-colors duration-300 rounded-[2.5rem] border-2 border-dashed border-border transition-colors duration-300">
//               <p className="text-textMain/50 transition-colors duration-300 font-black text-xs uppercase tracking-[0.4em]">No products found</p>
//             </div>
//           )}
//         </div>

//         {/* ALERTS SECTION - FLAT & CLEAN STYLE */}
//         <div className="col-span-12 xl:col-span-3">
//           <div className="sticky top-10 space-y-3">
//             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-textMain/50 transition-colors duration-300 border-b border-border pb-3 ml-1">Live Status</h3>
//             {stockData.filter(i => i.qty <= 20).sort((a,b) => a.qty - b.qty).map(item => {
//               const isCritical = item.qty <= 10;
//               return (
//                 <div 
//                   key={item.id}
//                   onClick={() => handleAlertClick(item.id)}
//                   className={`group p-4 rounded-xl cursor-pointer transition-all duration-300 flex items-center gap-4 border border-transparent hover:shadow-md
//                     ${isCritical 
//                       ? 'bg-red-50 hover:border-red-200' 
//                       : 'bg-amber-50 hover:border-amber-200'}
//                     ${highlightedId === item.id ? (isCritical ? 'ring-2 ring-red-500 bg-red-100' : 'ring-2 ring-amber-500 bg-amber-100') : ''}`}
//                 >
//                   <div className={`p-2 rounded-lg ${isCritical ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-primary transition-all duration-300'}`}>
//                     {isCritical ? <AlertCircle size={18} /> : <AlertTriangle size={18} />}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className={`text-[10px] font-black uppercase truncate ${isCritical ? 'text-red-900' : 'text-amber-900'}`}>{item.name}</p>
//                     <p className={`text-[9px] font-bold uppercase mt-0.5 ${isCritical ? 'text-red-600' : 'text-primary transition-all duration-300'}`}>
//                       {item.qty} Items Left
//                     </p>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Stock;