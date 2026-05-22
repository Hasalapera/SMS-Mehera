import React, { useState } from 'react';
import { DollarSign, UserCheck, TrendingUp, TrendingDown, X, Package } from 'lucide-react';

const ReportMetrics = ({ orders }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('best'); // 'best' | 'slow'
  
  // 🧮 Math function to parse all items and gather values
  const totalSalesValue = orders.reduce((acc, order) => {
    // 💡 FIX: Ensure `order.items` is an array before reducing.
    const orderTotal = Array.isArray(order.items) ? order.items.reduce((sum, item) => sum + (parseFloat(item.price || 0) * (item.quantity || 0)), 0) : 0;
    return acc + orderTotal;
  }, 0);

  // 🥇 Compute top performing sales representative dynamically
  const repCounts = {};
  orders.forEach(o => {
    if (o.sales_rep?.name) repCounts[o.sales_rep.name] = (repCounts[o.sales_rep.name] || 0) + 1;
  });
  const topRep = Object.keys(repCounts).reduce((a, b) => repCounts[a] > repCounts[b] ? a : b, "N/A");

  // 📦 Product Analysis (Best Selling & Slow Moving)
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

  // Sort products by quantity sold
  const sortedProducts = Object.values(productStats).sort((a, b) => b.qty - a.qty);
  
  const bestSelling = sortedProducts.length > 0 ? sortedProducts[0] : null;
  // Filter out products with 0 sales if necessary, though in 'orders' they at least have 1
  const slowMoving = sortedProducts.length > 0 ? sortedProducts[sortedProducts.length - 1] : null;

  const top10 = sortedProducts.slice(0, 10);
  // For slow moving, reverse the sorted array and take top 10
  const bottom10 = [...sortedProducts].reverse().slice(0, 10);

  const openModal = (tab) => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  return (
    <>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[0.75rem] md:gap-[1rem] print:grid-cols-4 print:gap-[0.75rem]">
      <MetricCard icon={DollarSign} label="Net Sales Volume" value={`Rs. ${totalSalesValue.toLocaleString()}`} />
      <MetricCard icon={UserCheck} label="Top Performer (Rep)" value={topRep} />
      
      <MetricCard 
        icon={TrendingUp} 
        label="Best Selling" 
        value={bestSelling ? bestSelling.productName : "N/A"} 
        subtext={bestSelling ? bestSelling.variantName : ""}
        color="text-emerald-500"
        onAction={() => openModal('best')}
      />
      
      <MetricCard 
        icon={TrendingDown} 
        label="Slow Moving" 
        value={slowMoving ? slowMoving.productName : "N/A"} 
        subtext={slowMoving ? slowMoving.variantName : ""}
        color="text-red-500"
        onAction={() => openModal('slow')}
      />
    </div>

    {/* 📊 Modal for Product Insights */}
    {isModalOpen && (
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}>
        <div className="bg-card w-full max-w-4xl rounded-[1.5rem] md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300 border border-border" onClick={(e) => e.stopPropagation()}>
          
          {/* Modal Header */}
          <div className="p-[1rem] md:p-[1.5rem] border-b border-border bg-background flex justify-between items-start md:items-center">
            <div className="flex items-start md:items-center gap-[0.75rem] md:gap-[1rem]">
              <div className={`p-[0.5rem] md:p-[0.75rem] rounded-[0.75rem] md:rounded-[1rem] shrink-0 ${modalTab === 'best' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                <Package size={20} className="md:w-[24px] md:h-[24px]" />
              </div>
              <div>
                <h3 className="text-[0.875rem] sm:text-[1.125rem] font-black uppercase text-textMain tracking-tight leading-tight mt-1 md:mt-0">
                  Product Insights
                </h3>
                <p className="text-[0.5rem] sm:text-[0.625rem] font-bold text-textMain/50 uppercase tracking-widest mt-[0.25rem]">
                  Based on currently filtered report data
                </p>
              </div>
            </div>
            <button onClick={() => setIsModalOpen(false)} className="p-[0.4rem] md:p-[0.5rem] bg-card border border-border rounded-full text-textMain/50 hover:text-red-500 hover:bg-red-50 transition-all shrink-0">
              <X size={16} className="md:w-5 md:h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex px-[1rem] md:px-[1.5rem] pt-[0.5rem] md:pt-[1rem] gap-2 border-b border-border bg-background overflow-x-auto custom-scrollbar">
            <button onClick={() => setModalTab('best')} className={`whitespace-nowrap px-3 md:px-4 py-2 md:py-3 text-[0.65rem] md:text-[0.75rem] font-black uppercase tracking-widest transition-all border-b-2 ${modalTab === 'best' ? 'border-primary text-primary' : 'border-transparent text-textMain/50 hover:text-textMain'}`}>
              Top 10 Best Selling
            </button>
            <button onClick={() => setModalTab('slow')} className={`whitespace-nowrap px-3 md:px-4 py-2 md:py-3 text-[0.65rem] md:text-[0.75rem] font-black uppercase tracking-widest transition-all border-b-2 ${modalTab === 'slow' ? 'border-red-500 text-red-500' : 'border-transparent text-textMain/50 hover:text-textMain'}`}>
              Top 10 Slow Moving
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-[1rem] md:p-[1.5rem] overflow-y-auto custom-scrollbar bg-card flex-1">
            <div className="border border-border rounded-[1rem] md:rounded-[1.5rem] overflow-x-auto bg-background">
              <table className="w-full text-left whitespace-nowrap min-w-[500px]">
                <thead className="bg-card/50 border-b border-border">
                  <tr className="text-[0.55rem] md:text-[0.625rem] font-black uppercase text-textMain/50 tracking-widest">
                    <th className="px-[0.75rem] md:px-[1rem] py-[0.5rem] md:py-[0.75rem]">Rank</th>
                    <th className="px-[0.75rem] md:px-[1rem] py-[0.5rem] md:py-[0.75rem]">Product & Variant</th>
                    <th className="px-[0.75rem] md:px-[1rem] py-[0.5rem] md:py-[0.75rem] text-center">Total Qty Sold</th>
                    <th className="px-[0.75rem] md:px-[1rem] py-[0.5rem] md:py-[0.75rem] text-right">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(modalTab === 'best' ? top10 : bottom10).map((stat, idx) => (
                    <tr key={idx} className="text-[0.65rem] md:text-[0.75rem] font-medium text-textMain hover:bg-card/50 transition-colors">
                      <td className="px-[0.75rem] md:px-[1rem] py-[0.5rem] md:py-[0.75rem] font-black text-textMain/40">#{idx + 1}</td>
                      <td className="px-[0.75rem] md:px-[1rem] py-[0.5rem] md:py-[0.75rem]">
                        <p className="font-bold">{stat.productName}</p>
                        <p className="text-[0.55rem] md:text-[0.625rem] text-primary italic mt-[0.125rem]">{stat.variantName}</p>
                      </td>
                      <td className="px-[0.75rem] md:px-[1rem] py-[0.5rem] md:py-[0.75rem] text-center font-bold">
                        <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-black text-white rounded-md md:rounded-lg text-[0.55rem] md:text-[0.625rem]">{stat.qty} Units</span>
                      </td>
                      <td className="px-[0.75rem] md:px-[1rem] py-[0.5rem] md:py-[0.75rem] text-right font-bold text-textMain">
                        Rs. {stat.revenue.toLocaleString()}.00
                      </td>
                    </tr>
                  ))}
                  {(modalTab === 'best' ? top10 : bottom10).length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-6 md:py-8 text-textMain/40 font-bold text-[0.65rem] md:text-xs uppercase tracking-widest">No Sales Data Available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

const MetricCard = ({ icon: Icon, label, value, subtext, color = "text-primary", onAction }) => (
  <div className="p-[0.75rem] md:p-[1rem] bg-card border border-border rounded-[1rem] md:rounded-[1.25rem] flex items-center gap-[0.5rem] md:gap-[0.75rem] print:border-none print:bg-transparent print:p-0 print:gap-[0.5rem] print:shadow-none relative group">
    <div className={`p-[0.4rem] md:p-[0.5rem] bg-background border border-border rounded-[0.6rem] md:rounded-[0.75rem] ${color} print:p-1.5 print:bg-gray-100 print:border-gray-300 shrink-0`}>
      <Icon size={16} className="md:w-[18px] md:h-[18px] print:w-[14px] print:h-[14px]" />
    </div>
    <div className="flex-1 min-w-0 pr-6 md:pr-8 print:pr-0">
      <p className="text-[0.5625rem] md:text-[0.625rem] uppercase text-textMain/50 font-black tracking-[0.05em] print:text-[8px] print:text-gray-500">{label}</p>
      <p className="text-[0.6875rem] md:text-[0.8125rem] font-serif font-bold text-textMain mt-[0.125rem] print:text-[11px] print:font-sans print:text-black break-words leading-tight" title={value}>{value}</p>
      {subtext && <p className="text-[0.5rem] md:text-[0.5625rem] font-bold text-textMain/50 mt-[0.125rem] break-words uppercase tracking-widest print:text-[8px] leading-tight">{subtext}</p>}
    </div>
    {onAction && (
      <button 
        onClick={onAction} 
        className="absolute top-2 right-2 md:top-2 md:right-3 text-[0.5rem] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded-md opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
      >
        More
      </button>
    )}
  </div>
);

export default ReportMetrics;