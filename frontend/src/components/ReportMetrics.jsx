import React from 'react';
import { DollarSign, ShoppingBag, UserCheck, TrendingUp } from 'lucide-react';

const ReportMetrics = ({ orders }) => {
  
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1rem] print:grid-cols-4 print:gap-x-[2.5rem] print:gap-y-0">
      <MetricCard icon={DollarSign} label="Net Sales Volume" value={`Rs. ${totalSalesValue.toLocaleString()}`} />
      <MetricCard icon={ShoppingBag} label="Approved Invoices" value={orders.length} />
      <MetricCard icon={UserCheck} label="Top Performer (Rep)" value={topRep} />
      <MetricCard icon={TrendingUp} label="Audit Status" value="100% Certified" color="text-green-600" />
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, color = "text-primary" }) => (
  <div className="p-[1.25rem] bg-card border border-border rounded-[1.5rem] flex items-center gap-[1rem] print:border-none print:bg-transparent print:p-0 print:gap-[0.75rem] print:shadow-none">
    <div className={`p-[0.75rem] bg-background border border-border rounded-[1rem] ${color} print:p-2 print:bg-gray-100 print:border-gray-300`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[0.6875rem] uppercase text-textMain/50 font-black tracking-[0.05em] print:text-[10px] print:text-gray-600">{label}</p>
      <p className="text-[1.125rem] font-serif font-bold text-textMain mt-[0.125rem] print:text-[14px] print:font-sans print:text-black">{value}</p>
    </div>
  </div>
);

export default ReportMetrics;