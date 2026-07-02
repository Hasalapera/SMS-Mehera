// 📄 src/pages/management/report/ProductSummaryReport.jsx
import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import api from '../../../api/axiosInstance';
import ReportFilters from '../../../components/ReportFilters';

const ProductSummaryReport = () => {
  const [filterType, setFilterType] = useState('monthly');
  const [dates, setDates] = useState({ startDate: new Date().toISOString().slice(0, 10), endDate: '' });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('best'); // 'best' | 'slow'

  useEffect(() => {
    const fetchReportOrders = async () => {
      // Custom date selected but dates are not filled
      if (filterType === 'custom' && (!dates.startDate || !dates.endDate)) {
        return; 
      }

      setLoading(true);
      try {
        let queryStr = `/report/sales-report?filterType=${filterType}`;
        if (filterType === 'custom') {
            queryStr += `&startDate=${dates.startDate}&endDate=${dates.endDate}`;
        } else if (filterType === 'monthly' && dates.startDate) {
            queryStr += `&startDate=${dates.startDate.substring(0, 7)}`;
        } else if (filterType === 'yearly' && dates.startDate) {
            queryStr += `&startDate=${dates.startDate.substring(0, 4)}-01-01`;
        }
        
        const response = await api.get(queryStr);
        setOrders(response.data.orders || []);
      } catch (err) {
        console.error("Failed to compile product node registries:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportOrders();
  }, [filterType, dates.startDate, dates.endDate]);

  // 🧮 2. Product Analysis Logic (උඹේ කෝඩ් එකේ තිබ්බ ලොජික් එකමයි මචං)
  const productStats = {};
  orders.forEach(order => {
    const targetItems = order.items || order.OrderItems || [];
    targetItems.forEach(item => {
      const variant = item.variant || item.Variant || item.ProductVariant;
      const product = variant?.product || variant?.Product;
      
      const pName = product?.name || product?.product_name || 'Unknown Product';
      const vName = variant?.variant_name || variant?.size || 'Standard';
      const key = `${pName} | ${vName}`;

      if (!productStats[key]) {
        productStats[key] = {
          id: key,
          productName: pName,
          variantName: vName,
          qty: 0,
          revenue: 0,
        };
      }
      
      const qty = parseInt(item.quantity || item.qty || 0);
      const price = parseFloat(item.price || 0);
      
      productStats[key].qty += qty;
      productStats[key].revenue += (qty * price);
    });
  });

  // Quantity මත පදනම්ව සෝට් කිරීම
  const allProducts = Object.values(productStats);
  // Top 10 ලබා ගැනීම
  const bestSellingList = [...allProducts].sort((a, b) => b.qty - a.qty).slice(0, 10);
  const slowMovingList = [...allProducts].sort((a, b) => a.qty - b.qty).slice(0, 10);

  // ටැබ් එක අනුව පෙන්වන්න ලිස්ට් එක සිලෙක්ට් කිරීම
  const displayedProducts = activeTab === 'best' ? bestSellingList : slowMovingList;

  return (
    <div className="p-4 sm:p-6 animate-in fade-in duration-500 max-w-[64rem] mx-auto text-left w-full overflow-hidden">
      
      {/* Page Header */}
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-textMain transition-colors duration-300 flex items-center gap-3">
            <div className="p-2 bg-primary transition-all duration-300 rounded-lg text-textMain transition-colors duration-300 shrink-0">
              <Package size={24} />
            </div>
            Product Performance Summary
          </h2>
          <p className="text-textMain/50 transition-colors duration-300 text-xs md:text-sm mt-2 md:mt-1 ml-0 sm:ml-12">
            In-depth analytical review of fast-moving inventory items and lagging product nodes.
          </p>
        </div>
      </div>

      {/* Filter Layer - Sticky on Mobile */}
      <div className="sticky md:static top-[80px] md:top-auto z-40 md:z-auto py-2 -my-2 md:py-0 md:my-0 bg-background/95 backdrop-blur-xl border-b border-border/40 md:border-none md:bg-transparent md:backdrop-blur-none mx-[-1rem] px-[1rem] sm:mx-[-1.5rem] sm:px-[1.5rem] md:mx-0 md:px-0 transition-all duration-300 mb-6 md:mb-8">
        <ReportFilters 
          filterType={filterType} setFilterType={setFilterType} 
          dates={dates} setDates={setDates} 
        />
      </div>

      {/* Main Content Sheet Layout */}
      <div className="bg-card transition-colors duration-300 border border-border transition-colors duration-300 rounded-[1.5rem] md:rounded-[2rem] shadow-sm overflow-hidden flex flex-col w-full">
        
        {/* Navigation Tabs Bar */}
        <div className="grid grid-cols-2 md:flex px-2 md:px-[1.5rem] pt-2 md:pt-[1rem] gap-2 border-b border-border transition-colors duration-300 bg-background/50 transition-colors duration-300">
          <button 
            onClick={() => setActiveTab('best')} 
            className={`flex justify-center md:justify-start items-center gap-1.5 md:gap-2 px-2 md:px-4 py-3 text-[10px] sm:text-xs md:text-[0.725rem] font-black uppercase tracking-tighter md:tracking-widest transition-all border-b-2 cursor-pointer ${activeTab === 'best' ? 'border-primary text-primary bg-primary/5 rounded-t-xl md:bg-transparent md:rounded-none' : 'border-transparent text-textMain/50 transition-colors duration-300 hover:text-textMain transition-colors duration-300'}`}
          >
            <TrendingUp size={16} className="shrink-0" /> <span className="truncate">Best Selling</span>
          </button>
          <button 
            onClick={() => setActiveTab('slow')} 
            className={`flex justify-center md:justify-start items-center gap-1.5 md:gap-2 px-2 md:px-4 py-3 text-[10px] sm:text-xs md:text-[0.725rem] font-black uppercase tracking-tighter md:tracking-widest transition-all border-b-2 cursor-pointer ${activeTab === 'slow' ? 'border-red-500 text-red-500 bg-red-500/5 rounded-t-xl md:bg-transparent md:rounded-none' : 'border-transparent text-textMain/50 transition-colors duration-300 hover:text-textMain transition-colors duration-300'}`}
          >
            <TrendingDown size={16} className="shrink-0" /> <span className="truncate">Slow Moving</span>
          </button>
        </div>

        {/* Data Table Area */}
        <div className="p-4 md:p-[1.5rem] bg-card transition-colors duration-300 flex-1">
          {loading ? (
            <div className="py-[6rem] text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-primary" size={36} />
              <p className="text-xs md:text-[10px] font-black uppercase tracking-widest text-textMain/40 transition-colors duration-300">Compiling Inventory Node Volume...</p>
            </div>
          ) : (
            <>
            {/* 📱 MOBILE VIEW: Cards */}
            <div className="md:hidden space-y-4">
              {displayedProducts.map((stat, idx) => (
                <div key={stat.id} className="bg-card border border-border rounded-2xl shadow-sm p-5 flex flex-col justify-between">
                  <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                          idx === 0 ? 'bg-primary text-black' : 
                          idx === 1 ? 'bg-primary/50 text-primary' : 
                          idx === 2 ? 'bg-primary/20 text-primary' : 
                          'bg-card text-textMain/50'
                      }`}>
                          {idx + 1}
                      </div>
                      <p className="text-[10px] font-black text-textMain/50 uppercase tracking-widest mt-1">
                        {activeTab === 'best' ? 'Best Selling Item' : 'Slow Moving Item'}
                      </p>
                  </div>
                  <div className="mt-3 text-left">
                    <p className="text-sm font-black text-textMain leading-tight break-words" title={stat.productName}>{stat.productName}</p>
                    <p className="text-[11px] text-primary mt-0.5 break-words" title={stat.variantName}>{stat.variantName}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
                      <div>
                          <p className="text-[9px] font-bold text-textMain/50 uppercase tracking-widest">Units Sold</p>
                          <p className="font-mono font-black text-textMain text-sm mt-1">{stat.qty}</p>
                      </div>
                      <div>
                          <p className="text-[9px] font-bold text-textMain/50 uppercase tracking-widest">Revenue</p>
                          <p className="font-mono font-black text-primary text-sm mt-1">Rs. {stat.revenue.toLocaleString()}</p>
                      </div>
                  </div>
                </div>
              ))}
              {displayedProducts.length === 0 && (
                <div className="text-center py-12 text-textMain/40 transition-colors duration-300 font-bold text-xs uppercase tracking-widest italic border border-dashed border-border transition-colors duration-300 rounded-2xl">
                  No transactional data registered for this specific period.
                </div>
              )}
            </div>

            {/* 🖥️ DESKTOP VIEW: Table */}
            <div className="hidden md:block border border-border transition-colors duration-300 rounded-2xl overflow-x-auto bg-background transition-colors duration-300">
              <table className="w-full text-left whitespace-nowrap min-w-[600px]">
                <thead className="bg-card/60 transition-colors duration-300 border-b border-border transition-colors duration-300">
                  <tr className="text-[10px] font-black uppercase text-textMain/50 transition-colors duration-300 tracking-widest">
                    <th className="px-6 py-3 w-[5rem]">Rank</th>
                    <th className="px-6 py-3">Product & Variant Particulars</th>
                    <th className="px-6 py-3 text-center">Total Quantity Sold</th>
                    <th className="px-6 py-3 text-right">Revenue Generated (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 transition-colors duration-300">
                  {displayedProducts.map((stat, idx) => (
                    <tr key={stat.id} className="text-xs font-medium text-textMain transition-colors duration-300 hover:bg-card/40 transition-colors duration-300">
                      <td className="px-6 py-5 font-bold text-textMain/50 transition-colors duration-300">
                        #{idx + 1}
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-semibold text-textMain transition-colors duration-300">{stat.productName}</p>
                        <p className="text-[10px] text-textMain/60 transition-all duration-300 font-medium tracking-wide italic mt-1">{stat.variantName}</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="px-2.5 py-1 bg-card transition-colors duration-300 text-textMain transition-colors duration-300 font-mono font-bold rounded-lg text-[11px] border border-border transition-colors duration-300">
                          {stat.qty} Units
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-mono font-bold text-primary transition-all duration-300">
                        Rs. {stat.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  
                  {displayedProducts.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-12 text-textMain/40 transition-colors duration-300 font-bold text-xs uppercase tracking-widest italic">
                        No transactional data registered for this specific period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductSummaryReport;