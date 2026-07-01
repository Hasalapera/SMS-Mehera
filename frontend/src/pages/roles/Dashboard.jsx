import React, { useState, useEffect, useRef } from 'react';
import SideBar from '../../components/SideBar';
import { useNavigate } from 'react-router-dom'; 
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-hot-toast';
import { 
  LayoutDashboard, Bell, ArrowUpRight, MoreVertical, Calendar,
  PlusCircle, SlidersHorizontal, Download, RefreshCw, Loader2, ArrowRight, Printer, FileText,
  FileSpreadsheet, FileDown, ReceiptText, User
} from 'lucide-react';
import api from '../../api/axiosInstance';
import ReportMetrics from '../../components/ReportMetrics';
import ReportTable from '../../components/ReportTable';
import QuotationModal from '../../components/QuotationModal';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // --- Filter States ---
  const [period, setPeriod] = useState('month'); // 'week', 'month', 'year', 'custom'
  const [specificMonth, setSpecificMonth] = useState(new Date().toISOString().slice(0, 7));
  const [specificYear, setSpecificYear] = useState(new Date().getFullYear().toString());
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [compareType, setCompareType] = useState('prev'); // 'prev', 'custom'
  const [compareMonth, setCompareMonth] = useState('');
  const [compareYear, setCompareYear] = useState('');
  const [compareDates, setCompareDates] = useState({ start: '', end: '' });

  // --- Print Refs ---
  const salesPrintRef = useRef(null);
  const ordersPrintRef = useRef(null);
  const trendingPrintRef = useRef(null);
  const performersPrintRef = useRef(null);
  const salesLedgerPrintRef = useRef(null);
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);

  // --- Data States ---
  const [loading, setLoading] = useState(true);
  const [systemSettings, setSystemSettings] = useState(null);
  const [ordersForExport, setOrdersForExport] = useState([]);
  const [metrics, setMetrics] = useState({
    sales: { current: 0, previous: 0 },
    orders: { current: 0, previous: 0 },
    customers: 0
  });
  const [chartData, setChartData] = useState([]);
  const [trendingProducts, setTrendinngProducts] = useState([]);
  const [performers, setPerformers] = useState([]);

  // Date Helper Function
  const formatDate = (date) => date.toISOString().split('T')[0];

  const getAutoDates = (p) => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();

    if (p === 'week') {
      const start = new Date(now); start.setDate(d - 6);
      const prevEnd = new Date(start); prevEnd.setDate(prevEnd.getDate() - 1);
      const prevStart = new Date(prevEnd); prevStart.setDate(prevStart.getDate() - 6);
      return { current: { start: formatDate(start), end: formatDate(now) }, previous: { start: formatDate(prevStart), end: formatDate(prevEnd) } };
    }
    if (p === 'month') {
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 0);
      const prevStart = new Date(y, m - 1, 1);
      const prevEnd = new Date(y, m, 0);
      return { current: { start: formatDate(start), end: formatDate(end) }, previous: { start: formatDate(prevStart), end: formatDate(prevEnd) } };
    }
    if (p === 'year') {
      const start = new Date(y, 0, 1);
      const end = new Date(y, 11, 31);
      const prevStart = new Date(y - 1, 0, 1);
      const prevEnd = new Date(y - 1, 11, 31);
      return { current: { start: formatDate(start), end: formatDate(end) }, previous: { start: formatDate(prevStart), end: formatDate(prevEnd) } };
    }
    return null;
  };

  useEffect(() => {
    const storeUser = localStorage.getItem('user');
    if(!storeUser || storeUser === "undefined"){
      navigate('/login');
    }else{
      setUser(JSON.parse(storeUser));
    }
  }, [navigate]);

  // Fetch system settings for logo
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await api.get('/settings/public');
        setSystemSettings(res.data);
      } catch (err) {
        console.error("Dashboard branding fetch failed:", err);
      }
    };
    fetchBranding();
  }, []);

  // Main Data Fetcher
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 1. Resolve Dates
        let curStart, curEnd, prevStart, prevEnd;
        
        if (period === 'custom') {
          if (!customDates.start || !customDates.end) { setLoading(false); return; } // Wait until filled
          curStart = customDates.start; curEnd = customDates.end;
          
          if (compareType === 'custom') {
            prevStart = compareDates.start; prevEnd = compareDates.end;
          } else if (compareType === 'specific_month') {
            if (!compareMonth) { setLoading(false); return; }
            const y = parseInt(compareMonth.substring(0,4));
            const m = parseInt(compareMonth.substring(5,7)) - 1;
            prevStart = formatDate(new Date(y, m, 1)); 
            prevEnd = formatDate(new Date(y, m + 1, 0));
          } else if (compareType === 'specific_year') {
            if (!compareYear) { setLoading(false); return; }
            const y = parseInt(compareYear);
            prevStart = formatDate(new Date(y, 0, 1)); 
            prevEnd = formatDate(new Date(y, 11, 31));
          } else {
            // Auto calculate previous matching period
            const d1 = new Date(curStart); const d2 = new Date(curEnd);
            const diffTime = Math.abs(d2 - d1);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            const pEnd = new Date(d1); pEnd.setDate(pEnd.getDate() - 1);
            const pStart = new Date(pEnd); pStart.setDate(pStart.getDate() - diffDays);
            prevStart = formatDate(pStart); prevEnd = formatDate(pEnd);
          }
        } else if (period === 'specific_month') {
          if (!specificMonth) { setLoading(false); return; }
          const y = parseInt(specificMonth.substring(0,4));
          const m = parseInt(specificMonth.substring(5,7)) - 1;
          curStart = formatDate(new Date(y, m, 1)); 
          curEnd = formatDate(new Date(y, m + 1, 0));
        } else if (period === 'specific_year') {
          if (!specificYear) { setLoading(false); return; }
          const y = parseInt(specificYear);
          curStart = formatDate(new Date(y, 0, 1)); 
          curEnd = formatDate(new Date(y, 11, 31));
        } else {
          const autoDates = getAutoDates(period);
          curStart = autoDates.current.start; curEnd = autoDates.current.end;
        }

        // Resolve Compare Dates for non-custom main period
        if (period !== 'custom') {
          if (compareType === 'custom') {
            prevStart = compareDates.start; prevEnd = compareDates.end;
          } else if (compareType === 'specific_month') {
            if (!compareMonth) { setLoading(false); return; }
            const y = parseInt(compareMonth.substring(0,4));
            const m = parseInt(compareMonth.substring(5,7)) - 1;
            prevStart = formatDate(new Date(y, m, 1)); 
            prevEnd = formatDate(new Date(y, m + 1, 0));
          } else if (compareType === 'specific_year') {
            if (!compareYear) { setLoading(false); return; }
            const y = parseInt(compareYear);
            prevStart = formatDate(new Date(y, 0, 1)); 
            prevEnd = formatDate(new Date(y, 11, 31));
          } else {
            if (period === 'specific_month') {
              const y = parseInt(specificMonth.substring(0,4));
              const m = parseInt(specificMonth.substring(5,7)) - 1;
              prevStart = formatDate(new Date(y, m - 1, 1)); 
              prevEnd = formatDate(new Date(y, m, 0));
            } else if (period === 'specific_year') {
              const y = parseInt(specificYear) - 1;
              prevStart = formatDate(new Date(y, 0, 1)); 
              prevEnd = formatDate(new Date(y, 11, 31));
            } else {
              const autoDates = getAutoDates(period);
              prevStart = autoDates.previous.start; prevEnd = autoDates.previous.end;
            }
          }
        }

        // 2. Fetch Data Parallelly
        const [curRes, prevRes, custRes, perfRes] = await Promise.all([
          api.get(`/report/sales-report?filterType=custom&startDate=${curStart}&endDate=${curEnd}`, config),
          api.get(`/report/sales-report?filterType=custom&startDate=${prevStart}&endDate=${prevEnd}`, config),
          api.get('/customers/count', config).catch(() => ({ data: { count: 0 } })),
          api.get(`/users/top-performers?startDate=${curStart}&endDate=${curEnd}`, config).catch(() => ({ data: { performers: [] } }))
        ]);

        const curOrders = curRes.data?.orders || [];
        const prevOrders = prevRes.data?.orders || [];

        setOrdersForExport(curOrders);

        // 3. Process Metrics
        const curSales = curOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
        const prevSales = prevOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
        
        setMetrics({
          sales: { current: curSales, previous: prevSales },
          orders: { current: curOrders.length, previous: prevOrders.length },
          customers: custRes.data?.count || 0
        });

        // 4. Process Chart (X-Axis Logic)
        let groupedData = [];
        if (period === 'year' || period === 'specific_year') {
          const months = Array(12).fill(0);
          curOrders.forEach(o => {
            months[new Date(o.created_at || o.createdAt).getMonth()] += Number(o.total_amount || 0);
          });
          groupedData = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((label, i) => ({ label, value: months[i] }));
        } else if (period === 'month' || period === 'specific_month') {
          const weeks = [0, 0, 0, 0, 0];
          curOrders.forEach(o => {
             const d = new Date(o.created_at || o.createdAt).getDate();
             const weekIdx = Math.min(Math.floor((d - 1) / 7), 4);
             weeks[weekIdx] += Number(o.total_amount || 0);
          });
          groupedData = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'].map((label, i) => ({ label, value: weeks[i] }));
        } else {
          // Week or Custom
          const days = {};
          curOrders.forEach(o => {
             const d = new Date(o.created_at || o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
             days[d] = (days[d] || 0) + Number(o.total_amount || 0);
          });
          groupedData = Object.keys(days).sort((a,b) => new Date(`${a} 2026`) - new Date(`${b} 2026`)).map(label => ({ label, value: days[label] }));
          // Fallback if no data
          if(groupedData.length === 0) groupedData = [{ label: 'No Sales', value: 0 }];
        }
        setChartData(groupedData);

        // 5. Process Trending Products
        const prodStats = {};
        curOrders.forEach(order => {
          (order.items || []).forEach(item => {
            const name = item.variant?.product?.name || item.variant?.product?.product_name || 'Unknown';
            const vName = item.variant?.variant_name || 'Std';
            const key = `${name}-${vName}`;
            if(!prodStats[key]) prodStats[key] = { name, variant: vName, qty: 0, price: item.price, image: item.variant?.image_url };
            prodStats[key].qty += Number(item.quantity || item.qty || 0);
          });
        });
        setTrendinngProducts(Object.values(prodStats).sort((a,b) => b.qty - a.qty).slice(0, 10));

        // 6. Process Top Performers
        setPerformers(perfRes.data?.performers || []);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [period, customDates, compareType, compareDates, specificMonth, compareMonth, specificYear, compareYear]);

  // --- Print Handlers ---
  // ⚠️ මේවා Hooks (`useReactToPrint`) නිසා අනිවාර්යයෙන්ම return එකකට කලින් උඩින්ම තියෙන්න ඕනේ.
  const dateStamp = new Date().toISOString().slice(0,10);
  const handlePrintSales = useReactToPrint({ contentRef: salesPrintRef, documentTitle: `Sales_Comparison_${dateStamp}`, pageStyle: `@page { size: A4 portrait; margin: 15mm; }` });
  const handlePrintOrders = useReactToPrint({ contentRef: ordersPrintRef, documentTitle: `Order_Comparison_${dateStamp}`, pageStyle: `@page { size: A4 portrait; margin: 15mm; }` });
  const handlePrintTrending = useReactToPrint({ contentRef: trendingPrintRef, documentTitle: `Trending_Products_${dateStamp}`, pageStyle: `@page { size: A4 portrait; margin: 15mm; }` });
  const handlePrintPerformers = useReactToPrint({ contentRef: performersPrintRef, documentTitle: `Top_Performers_${dateStamp}`, pageStyle: `@page { size: A4 portrait; margin: 15mm; }` });
  const handlePrintSalesLedger = useReactToPrint({ 
    contentRef: salesLedgerPrintRef, 
    documentTitle: `SalesReport_${period}_${dateStamp}`,
    pageStyle: `@page { size: A4 portrait; margin: 30mm 15mm 20mm 15mm; } @page :first { margin-top: 15mm; }`
  });

  // --- CSV Export Logic ---
  const handleDownloadCSV = () => {
    if (ordersForExport.length === 0) {
      toast.error("No data available to export.");
      return;
    }
    
    const headers = [
      "InvoiceNumber", "CustomerName", "Date", 
      "ItemName", "ItemDescription", "Quantity", "Rate", "Amount"
    ];
    const csvRows = [headers.join(",")];

    ordersForExport.forEach(order => {
      const invoiceNo = `ORD-${order.order_id.substring(0, 8).toUpperCase()}`;
      const customer = `"${order.customer?.saloon_name || order.customer_name || 'Direct Customer'}"`;
      const date = new Date(order.created_at || order.createdAt).toLocaleDateString('en-US');

      const items = order.items || order.OrderItems || [];
      items.forEach(item => {
        const itemName = `"${item.variant?.product?.name || item.variant?.product?.product_name || 'Item'} - ${item.variant?.variant_name || 'Std'}"`;
        const desc = `"${item.variant?.product?.name || item.variant?.product?.product_name || 'Product'}"`;
        const qty = item.quantity || item.qty || 0;
        const rate = item.price || 0;
        const amount = qty * rate;
        csvRows.push([invoiceNo, customer, date, itemName, desc, qty, rate, amount].join(","));
      });

      const discountAmt = Number(order.discount_amount || 0);
      if (discountAmt > 0) {
        csvRows.push([invoiceNo, customer, date, '"Discount"', '"Order Discount"', 1, -discountAmt, -discountAmt].join(","));
      }
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `QuickBooks_Export_${period}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QuickBooks CSV exported successfully!");
  };

  if(!user){
    return <div className="min-h-screen bg-background transition-all duration-300 flex items-center justify-center text-textMain transition-colors duration-300 font-bold"> Loading </div>
  }

  // Calculators for UI
  const calcPercentage = (curr, prev) => {
    if (prev === 0) return curr > 0 ? '+100%' : '0%';
    const diff = ((curr - prev) / prev) * 100;
    return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
  };
  const isPositive = (curr, prev) => curr >= prev;
  
  const maxChartVal = Math.max(...chartData.map(d => d.value), 1);
  const maxPerformerVal = Math.max(...performers.map(p => p.sales), 1);

  return (
      <main className={`w-full`}>
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-start gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-textMain transition-colors duration-300 flex items-center gap-3">
              <div className="p-2 bg-primary transition-all duration-300 rounded-lg text-textMain transition-colors duration-300 shadow-sm">
                <LayoutDashboard size={24} />
              </div>
              System Dashboard
            </h2>
            <p className="text-textMain/50 transition-colors duration-300 text-sm mt-1 ml-12">
              Monitor real-time metrics, analytics, and operational performance.
            </p>
          </div>
          {/* --- ACTION BUTTONS (Mobile Responsive) --- */}
          <div className="w-full md:w-auto mt-4 md:mt-0">
            <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-3">
              {/* <button className="col-span-2 md:col-auto p-2.5 bg-card border border-border rounded-xl text-textMain/50 shadow-sm relative hover:text-primary transition-all flex items-center justify-center gap-2">
                <Bell size={18} />
                <span className="md:hidden text-xs font-bold uppercase">Notifications</span>
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full"></span>
              </button> */}
              <button onClick={handleDownloadCSV} className="flex items-center justify-center gap-2 bg-[#2ca01c] text-white px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#2ca01c]/20 hover:bg-[#238016] transition-all">
                <FileSpreadsheet size={14} /> QB CSV
              </button>
              <button onClick={handlePrintSalesLedger} className="flex items-center justify-center gap-2 bg-primary text-black px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#b4a460]/20 hover:bg-[#9a8b50] transition-all">
                <FileDown size={14} /> PDF
              </button>
              <button onClick={() => setIsQuotationOpen(true)} className="col-span-2 md:col-auto flex items-center justify-center gap-2 bg-black text-primary px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg border border-primary/30 hover:border-primary transition-all">
                <ReceiptText size={14} /> Quotation
              </button>
            </div>
          </div>
        </header>

        {/* Action Buttons Bar (Filter, Customize, Export) */}
        <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              <select value={period} onChange={(e) => setPeriod(e.target.value)} className="bg-transparent text-sm font-bold text-textMain outline-none border-b border-border cursor-pointer pb-1">
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="specific_month">Specific Month</option>
                <option value="specific_year">Specific Year</option>
                <option value="custom">Custom Date</option>
              </select>
            </div>

            {period === 'custom' && (
              <div className="flex items-center gap-2">
                <input type="date" value={customDates.start} onChange={e => setCustomDates({...customDates, start: e.target.value})} className="bg-background border border-border text-xs rounded-md p-1 outline-none text-textMain" />
                <span className="text-xs text-textMain/50">to</span>
                <input type="date" value={customDates.end} onChange={e => setCustomDates({...customDates, end: e.target.value})} className="bg-background border border-border text-xs rounded-md p-1 outline-none text-textMain" />
              </div>
            )}

            {period === 'specific_month' && (
              <div className="flex items-center gap-2">
                <input type="month" value={specificMonth} onChange={e => setSpecificMonth(e.target.value)} className="bg-background border border-border text-xs rounded-md p-1 outline-none text-textMain" />
              </div>
            )}

            {period === 'specific_year' && (
              <div className="flex items-center gap-2">
                <select value={specificYear} onChange={e => setSpecificYear(e.target.value)} className="bg-background border border-border text-xs rounded-md p-1 outline-none text-textMain cursor-pointer">
                  {Array.from({ length: 11 }, (_, i) => 2024 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-4">
            <div className="flex items-center gap-2 text-xs font-bold text-textMain/50">
              <span className="uppercase tracking-widest text-[9px]">Compare With:</span>
              <select value={compareType} onChange={(e) => setCompareType(e.target.value)} className="bg-transparent font-bold text-textMain outline-none border-b border-border cursor-pointer pb-1">
                <option value="prev">Previous Period</option>
                <option value="custom">Custom Range</option>
                <option value="specific_month">Specific Month</option>
                <option value="specific_year">Specific Year</option>
              </select>
            </div>

            {compareType === 'custom' && (
              <div className="flex items-center gap-2">
                <input type="date" value={compareDates.start} onChange={e => setCompareDates({...compareDates, start: e.target.value})} className="bg-background border border-border text-xs rounded-md p-1 outline-none text-textMain" />
                <span className="text-xs text-textMain/50">to</span>
                <input type="date" value={compareDates.end} onChange={e => setCompareDates({...compareDates, end: e.target.value})} className="bg-background border border-border text-xs rounded-md p-1 outline-none text-textMain" />
              </div>
            )}

            {compareType === 'specific_month' && (
              <div className="flex items-center gap-2">
                <input type="month" value={compareMonth} onChange={e => setCompareMonth(e.target.value)} className="bg-background border border-border text-xs rounded-md p-1 outline-none text-textMain" />
              </div>
            )}

            {compareType === 'specific_year' && (
              <div className="flex items-center gap-2">
                <select value={compareYear} onChange={e => setCompareYear(e.target.value)} className="bg-background border border-border text-xs rounded-md p-1 outline-none text-textMain cursor-pointer">
                  <option value="">Select Year</option>
                  {Array.from({ length: 11 }, (_, i) => 2024 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Comparison Export Buttons */}
          <div className="flex flex-col sm:flex-row w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-4 justify-end gap-3">
             <button onClick={handlePrintSales} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-primary border border-primary transition-all duration-300 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-primary hover:text-black w-full sm:w-auto">
               <FileText size={14} /> Sales Comparison
             </button>
             <button onClick={handlePrintOrders} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-card text-textMain border border-border transition-all duration-300 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:border-primary hover:text-primary w-full sm:w-auto">
               <FileText size={14} /> Order Comparison
             </button>
          </div>
        </div>
        
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-xs font-bold uppercase tracking-widest text-textMain/50">Aggregating Live Data...</p>
          </div>
        ) : (
          <>

        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Sales Card */}
            <div className="bg-card p-6 rounded-[1.5rem] border border-border shadow-sm group hover:border-primary/40 transition-all">
              <div className="flex justify-between items-center mb-4 text-xs font-semibold text-textMain/50">
                <span>Total Sales</span>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-[9px] uppercase font-black">Verified</span>
              </div>
              <h3 className="text-3xl font-black text-textMain mb-1 tracking-tighter">LKR {metrics.sales.current.toLocaleString()}</h3>
              <p className={`text-[11px] font-bold ${isPositive(metrics.sales.current, metrics.sales.previous) ? 'text-green-500' : 'text-red-500'}`}>
                {calcPercentage(metrics.sales.current, metrics.sales.previous)} <span className="text-textMain/50 font-normal">vs comparison period</span>
              </p>
            </div>

            {/* Orders Card */}
            <div className="bg-card p-6 rounded-[1.5rem] border border-border shadow-sm group hover:border-primary/40 transition-all">
              <div className="flex justify-between items-center mb-4 text-xs font-semibold text-textMain/50">
                <span>Completed Orders</span>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-[9px] uppercase font-black">Volume</span>
              </div>
              <h3 className="text-3xl font-black text-textMain mb-1 tracking-tighter">{metrics.orders.current}</h3>
              <p className={`text-[11px] font-bold ${isPositive(metrics.orders.current, metrics.orders.previous) ? 'text-green-500' : 'text-red-500'}`}>
                {calcPercentage(metrics.orders.current, metrics.orders.previous)} <span className="text-textMain/50 font-normal">vs comparison period</span>
              </p>
            </div>

            {/* Customers Card */}
            <div className="bg-card p-6 rounded-[1.5rem] border border-border shadow-sm group hover:border-primary/40 transition-all">
              <div className="flex justify-between items-center mb-4 text-xs font-semibold text-textMain/50">
                <span>Active Customers</span>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-[9px] uppercase font-black">Global</span>
              </div>
              <h3 className="text-3xl font-black text-textMain mb-1 tracking-tighter">{metrics.customers}</h3>
              <p className="text-[11px] font-bold text-textMain/50">Total registered partners network</p>
            </div>

        </div>

        {/* Charts & Products Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-2 bg-card p-6 md:p-8 rounded-[1.5rem] border border-border shadow-sm overflow-hidden">
            <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
              <h4 className="text-sm font-bold">Sales analytics</h4>
              <div className="flex items-center gap-2 text-[10px] font-bold">
                <span className="w-2 h-2 rounded-full bg-primary"></span> Net Sales
              </div>
            </div>
            <div className="overflow-x-auto pb-2 -mx-2 md:mx-0">
              <div className="h-64 flex items-end justify-between gap-1 md:gap-2 border-b border-border relative pt-10 px-2 md:px-4">
                  {chartData.map((data, i) => (
                      <div key={data.label || i} className="flex-1 flex flex-col items-center gap-2 relative z-10 group">
                          <div className="w-full max-w-[40px] bg-background border border-border rounded-t-md md:rounded-t-lg h-40 relative flex flex-col justify-end hover:bg-card transition-colors">
                              <div className="w-full bg-primary rounded-t-sm" style={{height: `${(data.value / maxChartVal) * 100}%`}}></div>
                              {/* Tooltip */}
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                LKR {data.value.toLocaleString()}
                              </div>
                          </div>
                          <span className="text-[9px] text-textMain/50 font-bold uppercase tracking-widest truncate max-w-full">{data.label}</span>
                      </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Trending Products */}
          <div className="bg-card p-6 md:p-8 rounded-[1.5rem] border border-border shadow-sm h-full">
            <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
              <h4 className="text-sm font-bold text-textMain">Trending Products</h4>
              <div className="flex items-center gap-4">
                 <button onClick={handlePrintTrending} className="text-[10px] uppercase font-bold text-textMain/50 hover:text-primary transition-colors flex items-center gap-1"><Printer size={14}/> Export</button>
                 <button onClick={() => navigate('/product-summary')} className="text-[10px] uppercase font-bold text-primary hover:underline">View All</button>
              </div>
            </div>
            <div className="space-y-4 max-h-[350px] md:max-h-[420px] overflow-y-auto custom-scrollbar pr-2">
              {trendingProducts.length > 0 ? (
                trendingProducts.map((item, idx) => (
                  <div key={item.id || `prod-${idx}`} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-12 h-12 rounded-xl bg-background border border-border overflow-hidden shadow-inner flex items-center justify-center p-1">
                        <img 
                          src={item?.image || 'https://placehold.co/100x100?text=No+Image'} 
                          className="w-full h-full object-contain" 
                          alt={item?.name || 'Product'} 
                          onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=No+Image' }}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-textMain group-hover:text-primary transition-all">
                          {item.name ? item.name.split(" ").slice(0, 3).join(" ") + (item.name.split(" ").length > 3 ? "..." : "") : 'Product'}
                        </p>
                        <p className="text-[9px] text-textMain/50 font-bold uppercase tracking-widest mt-0.5">
                          {item.variant}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black">{item.qty} Units</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-center text-textMain/50 italic py-10">No trending data for this period</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Performers Table */}
        <div className="bg-card p-6 md:p-8 rounded-[1.5rem] border border-border shadow-sm mb-12">
          <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
            <h4 className="text-sm font-bold text-textMain">Top Performers</h4>
            <div className="flex items-center gap-4">
                 <button onClick={handlePrintPerformers} className="text-[10px] uppercase font-bold text-textMain/50 hover:text-primary transition-colors flex items-center gap-1"><Printer size={14}/> Export</button>
                 <button onClick={() => navigate('/rep-ranking')} className="text-[10px] uppercase font-bold text-primary hover:underline flex items-center gap-1">Leaderboard <ArrowRight size={12}/></button>
            </div>
          </div>
          <div className="space-y-4 max-h-[420px] overflow-y-auto custom-scrollbar pr-2">
            {performers.slice(0, 5).length > 0 ? performers.slice(0, 5).map((rep, idx) => {
              const isGold = idx === 0;
              const isSilver = idx === 1;
              const isBronze = idx === 2;
              
              let borderClass = 'border-border';
              let badgeBg = 'bg-primary/20 text-primary';
              let nameColor = 'text-textMain';

              if (isGold) { borderClass = 'border-yellow-400 bg-yellow-50/10'; badgeBg = 'bg-yellow-400 text-black'; nameColor = 'text-yellow-500'; }
              else if (isSilver) { borderClass = 'border-gray-400 bg-gray-50/10'; badgeBg = 'bg-gray-400 text-black'; nameColor = 'text-gray-400'; }
              else if (isBronze) { borderClass = 'border-amber-600 bg-amber-50/10'; badgeBg = 'bg-amber-600 text-white'; nameColor = 'text-amber-600'; }

              return (
              <div key={idx} className={`flex items-center justify-between gap-4 p-3 rounded-2xl border ${borderClass} transition-all`}>
                <div className="flex items-center gap-4 flex-1 text-left">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${badgeBg} shadow-sm shrink-0`}>
                    {idx + 1}
                  </div>
                  {rep.image ? (
                    <img src={rep.image} className="w-10 h-10 rounded-xl object-cover border border-border" alt="rep" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-card text-textMain flex items-center justify-center font-black text-xs uppercase border border-border">{rep.name.substring(0,2)}</div>
                  )}
                  <div>
                    <h5 className={`text-sm font-bold ${nameColor}`}>{rep.name}</h5>
                    <p className="text-[9px] text-textMain/50 uppercase tracking-widest font-bold mt-0.5">Top Area: {rep.topArea}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-1 max-w-sm hidden sm:flex">
                   <div className="flex-1 h-2 bg-background border border-border rounded-full relative overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/50 to-primary rounded-full" style={{ width: `${(rep.sales / maxPerformerVal) * 100}%` }}></div>
                   </div>
                   <p className="text-xs font-black text-textMain min-w-[90px] text-right">Rs. {rep.sales.toLocaleString()}</p>
                </div>
              </div>
            )}) : (
              <p className="text-[10px] text-center text-textMain/50 italic py-6">No performance data generated yet</p>
            )}
          </div>
        </div>
        
        </>
        )}

        {/* 🖨️ HIDDEN PRINT COMPONENTS (Fixed to match SalesReport exactly) */}
        <div className="absolute -left-[9999px] top-0 w-full flex justify-center print:static print:w-auto">
           
           {/* --- 1. Sales Comparison Report --- */}
           <div ref={salesPrintRef} className="print-report-container bg-white text-black p-10 font-sans" style={{ width: '210mm', minHeight: '297mm', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', boxSizing: 'border-box' }}>
               {/* Print Header */}
               <div className="border-b-2 border-black pb-4 mb-8 flex justify-between items-end">
                   <div>
                       <h1 className="text-2xl font-black tracking-widest uppercase text-black">Mehera International</h1>
                       <p className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mt-1">Sales Comparison Report</p>
                   </div>
                   <div className="text-right">
                       <p className="text-[10px] font-bold text-gray-500 uppercase">Generated: {new Date().toLocaleDateString('en-GB')}</p>
                       <p className="text-[10px] font-bold text-black uppercase mt-1">Filter Scope: {period.replace('_', ' ')}</p>
                       <p className="text-[10px] font-bold text-gray-500 uppercase">Comparison: {compareType.replace('_', ' ')}</p>
                   </div>
               </div>

               {/* Print Metrics */}
               <div className="grid grid-cols-2 gap-6 mb-10">
                   <div className="p-4 border border-gray-300 rounded-xl bg-gray-50">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Net Sales Volume</p>
                       <h3 className="text-2xl font-black text-black">LKR {metrics.sales.current.toLocaleString()}</h3>
                       <p className={`text-[10px] font-bold mt-1 ${isPositive(metrics.sales.current, metrics.sales.previous) ? 'text-green-600' : 'text-red-600'}`}>
                           {calcPercentage(metrics.sales.current, metrics.sales.previous)} vs previous
                       </p>
                   </div>
                   <div className="p-4 border border-gray-300 rounded-xl bg-gray-50">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Comparison Sales Volume</p>
                       <h3 className="text-2xl font-black text-black">LKR {metrics.sales.previous.toLocaleString()}</h3>
                       <p className="text-[10px] font-bold mt-1 text-gray-500">From comparison period</p>
                   </div>
               </div>

               {/* Print Top Performers */}
               <div className="mb-10">
                   <h4 className="text-sm font-black uppercase tracking-widest border-b border-black pb-2 mb-4 text-black">Top Performing Representatives</h4>
                   <table className="w-full text-left text-xs border-collapse">
                       <thead>
                           <tr className="bg-gray-100 border-b border-gray-300">
                               <th className="p-3 uppercase text-gray-600">Rank</th>
                               <th className="p-3 uppercase text-gray-600">Representative</th>
                               <th className="p-3 uppercase text-gray-600">Top Region</th>
                               <th className="p-3 uppercase text-gray-600 text-right">Revenue Generated</th>
                           </tr>
                       </thead>
                       <tbody>
                           {performers.slice(0,5).map((rep, idx) => (
                               <React.Fragment key={idx}>
                               <tr key={idx} className="border-b border-gray-200">
                                   <td className={`p-3 font-black ${idx === 0 ? 'text-yellow-600' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-700' : 'text-gray-500'}`}>#{idx + 1}</td>
                                   <td className="p-3 font-bold text-black">{rep.name}</td>
                                   <td className="p-3 text-gray-600 uppercase">{rep.topArea}</td>
                                   <td className="p-3 text-right font-black text-black">LKR {rep.sales.toLocaleString()}</td>
                               </tr>
                               </React.Fragment>
                           ))}
                           {performers.length === 0 && <tr><td colSpan="4" className="p-4 text-center italic text-gray-500">No performance data found for this period.</td></tr>}
                       </tbody>
                   </table>
               </div>

               {/* Print Trending Products */}
               <div className="mb-10">
                   <h4 className="text-sm font-black uppercase tracking-widest border-b border-black pb-2 mb-4 text-black">Trending Products</h4>
                   <table className="w-full text-left text-xs border-collapse">
                       <thead>
                           <tr className="bg-gray-100 border-b border-gray-300">
                               <th className="p-3 uppercase text-gray-600">Rank</th>
                               <th className="p-3 uppercase text-gray-600">Product Name</th>
                               <th className="p-3 uppercase text-gray-600">Variant/Shade</th>
                               <th className="p-3 uppercase text-gray-600 text-right">Units Sold</th>
                           </tr>
                       </thead>
                       <tbody>
                           {trendingProducts.slice(0,10).map((prod, idx) => (
                               <tr key={idx} className="border-b border-gray-200">
                                   <td className="p-3 font-bold text-gray-500">#{idx + 1}</td>
                                   <td className="p-3 font-bold text-black uppercase">{prod.name}</td>
                                   <td className="p-3 text-gray-600 italic">{prod.variant}</td>
                                   <td className="p-3 text-right font-black text-black">{prod.qty}</td>
                               </tr>
                           ))}
                           {trendingProducts.length === 0 && <tr><td colSpan="4" className="p-4 text-center italic text-gray-500">No trending products found for this period.</td></tr>}
                       </tbody>
                   </table>
               </div>
           </div>

           {/* --- 2. Order Comparison Report --- */}
           <div ref={ordersPrintRef} className="print-report-container bg-white text-black p-10 font-sans" style={{ width: '210mm', minHeight: '297mm', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', boxSizing: 'border-box' }}>
               {/* Print Header */}
               <div className="border-b-2 border-black pb-4 mb-8 flex justify-between items-end">
                   <div>
                       <h1 className="text-2xl font-black tracking-widest uppercase text-black">Mehera International</h1>
                       <p className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mt-1">Order Comparison Report</p>
                   </div>
                   <div className="text-right">
                       <p className="text-[10px] font-bold text-gray-500 uppercase">Generated: {new Date().toLocaleDateString('en-GB')}</p>
                       <p className="text-[10px] font-bold text-black uppercase mt-1">Filter Scope: {period.replace('_', ' ')}</p>
                       <p className="text-[10px] font-bold text-gray-500 uppercase">Comparison: {compareType.replace('_', ' ')}</p>
                   </div>
               </div>

               {/* Print Metrics */}
               <div className="grid grid-cols-2 gap-6 mb-10">
                   <div className="p-4 border border-gray-300 rounded-xl bg-gray-50">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Completed Orders</p>
                       <h3 className="text-2xl font-black text-black">{metrics.orders.current}</h3>
                       <p className={`text-[10px] font-bold mt-1 ${isPositive(metrics.orders.current, metrics.orders.previous) ? 'text-green-600' : 'text-red-600'}`}>
                           {calcPercentage(metrics.orders.current, metrics.orders.previous)} vs previous
                       </p>
                   </div>
                   <div className="p-4 border border-gray-300 rounded-xl bg-gray-50">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Active Customers</p>
                       <h3 className="text-2xl font-black text-black">{metrics.customers}</h3>
                       <p className="text-[10px] font-bold text-gray-500 mt-1">Global Network Count</p>
                   </div>
               </div>
           </div>

           {/* --- 3. Isolated Trending Report --- */}
           <div ref={trendingPrintRef} className="print-report-container bg-white text-black p-10 font-sans" style={{ width: '210mm', minHeight: '297mm', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', boxSizing: 'border-box' }}>
               <div className="border-b-2 border-black pb-4 mb-8 flex justify-between items-end">
                   <div>
                       <h1 className="text-2xl font-black tracking-widest uppercase text-black">Mehera International</h1>
                       <p className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mt-1">Trending Products Report</p>
                   </div>
                   <div className="text-right">
                       <p className="text-[10px] font-bold text-gray-500 uppercase">Generated: {new Date().toLocaleDateString('en-GB')}</p>
                       <p className="text-[10px] font-bold text-black uppercase mt-1">Scope: {period.replace('_', ' ')}</p>
                   </div>
               </div>
               <table className="w-full text-left text-xs border-collapse">
                   <thead>
                       <tr className="bg-gray-100 border-b-2 border-black">
                           <th className="p-4 uppercase text-black font-black">Rank</th>
                           <th className="p-4 uppercase text-black font-black">Product Name</th>
                           <th className="p-4 uppercase text-black font-black">Variant/Shade</th>
                           <th className="p-4 uppercase text-black font-black text-right">Units Sold</th>
                       </tr>
                   </thead>
                   <tbody>
                       {trendingProducts.map((prod, idx) => (
                           <tr key={idx} className="border-b border-gray-200">
                               <td className="p-4 font-bold text-gray-500">#{idx + 1}</td>
                               <td className="p-4 font-bold text-black uppercase">{prod.name}</td>
                               <td className="p-4 text-gray-600 italic">{prod.variant}</td>
                               <td className="p-4 text-right font-black text-black">{prod.qty}</td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>

           {/* --- 4. Isolated Top Performers Report --- */}
           <div ref={performersPrintRef} className="print-report-container bg-white text-black p-10 font-sans" style={{ width: '210mm', minHeight: '297mm', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', boxSizing: 'border-box' }}>
               <div className="border-b-2 border-black pb-4 mb-8 flex justify-between items-end">
                   <div>
                       <h1 className="text-2xl font-black tracking-widest uppercase text-black">Mehera International</h1>
                       <p className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mt-1">Top Performers Report</p>
                   </div>
                   <div className="text-right">
                       <p className="text-[10px] font-bold text-gray-500 uppercase">Generated: {new Date().toLocaleDateString('en-GB')}</p>
                       <p className="text-[10px] font-bold text-black uppercase mt-1">Scope: {period.replace('_', ' ')}</p>
                   </div>
               </div>
               <table className="w-full text-left text-xs border-collapse">
                   <thead>
                       <tr className="bg-gray-100 border-b-2 border-black">
                           <th className="p-4 uppercase text-black font-black">Rank</th>
                           <th className="p-4 uppercase text-black font-black">Representative</th>
                           <th className="p-4 uppercase text-black font-black">Top Region</th>
                           <th className="p-4 uppercase text-black font-black text-right">Revenue Generated</th>
                       </tr>
                   </thead>
                   <tbody>
                       {performers.map((rep, idx) => (
                           <tr key={idx} className="border-b border-gray-200">
                               <td className="p-4 font-bold text-gray-500">#{idx + 1}</td>
                               <td className="p-4 font-bold text-black uppercase">{rep.name}</td>
                               <td className="p-4 text-gray-600 uppercase">{rep.topArea}</td>
                               <td className="p-4 text-right font-black text-black">LKR {rep.sales.toLocaleString()}</td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>

           {/* --- 5. Executive Sales Ledger (From SalesReport) --- */}
           <div ref={salesLedgerPrintRef} className="print-root-wrapper relative z-10 w-[800px] print:w-full bg-transparent font-sans" style={{ width: '50em', fontSize: '16px' }}>
              
              {/* 🖨️ FIXED PRINT FOOTER */}
              <div className="hidden print:block fixed bottom-0 left-0 w-full z-10 bg-white text-black border-t border-white">
                <div className="p-[2.5em] grid grid-cols-2 gap-[4rem] text-left border-t border-gray-200">
                  <div className="flex flex-col justify-end items-center">
                    <div className="w-full h-[0.063rem] bg-black mb-[0.5rem]"></div>
                    <p className="text-[0.5625rem] font-black uppercase tracking-widest text-black">Manager's Signature</p>
                  </div>
                  <div className="flex flex-col justify-end items-center">
                    <div className="w-full h-[0.063rem] bg-black mb-[0.5rem]"></div>
                    <p className="text-[0.5625rem] font-black uppercase tracking-widest text-black">Authorized Signature</p>
                  </div>
                </div>
                <div className="bg-black py-[1rem]">
                  <p className="text-[0.5em] text-gray-500 uppercase tracking-[0.4em] font-black text-center">
                    Cloud Registry System • Mehera International • {new Date().getFullYear()}
                  </p>
                </div>
              </div>

              <div className="quotation-container relative z-20 w-full bg-white text-black shadow-none overflow-hidden print:m-0 origin-top print:!transform-none print:!bg-white print:!text-black flex flex-col">
                
                {/* Header Section */}
                <div className="relative h-[11em] bg-black p-[2.5em] flex justify-between items-start text-white overflow-hidden print:bg-black">
                  <div className="absolute top-0 right-0 w-[16em] h-[16em] bg-primary rounded-full -mr-[8rem] -mt-[8rem] opacity-20 blur-[2rem]"></div>
                  <div className="relative z-10 text-left">
                    {systemSettings?.dark_logo_url ? (
                      <img src={systemSettings.dark_logo_url} alt="Mehera" className="h-[2.5em] object-contain" />
                    ) : (
                      <>
                        <h1 className="text-[1.875em] font-serif tracking-[0.3em] uppercase mb-[0.25em]">Mehera</h1>
                        <p className="text-[0.5625em] font-black tracking-[0.5em] text-primary uppercase">International</p>
                      </>
                    )}
                    <div className="mt-[1.5em] space-y-[0.25rem] text-[0.5625em] text-gray-300 font-bold uppercase tracking-widest">
                      <p>MEHERA INTERNATIONAL (PVT) LTD</p>
                      <p>No 182, Kuruppumulla Road, Panadura</p>
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <h2 className="text-[2.5em] font-black uppercase tracking-tighter opacity-10 mb-[0.5rem] leading-none">
                      Sales Report
                    </h2>
                    <div className="space-y-[0.25rem]">
                      <p className="text-[0.5625rem] font-black text-primary uppercase tracking-widest">Report Scope</p>
                      <p className="text-[1.125em] font-mono font-black italic tracking-tighter capitalize">{period.replace('_', ' ')}</p>
                      <p className="text-[0.5625rem] font-bold text-gray-400 mt-[0.5rem]">Generated: {new Date().toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-[2.5em] border-b border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-2 gap-[2.5rem]">
                    <div>
                      <h3 className="text-[0.5625rem] font-black text-primary uppercase tracking-widest mb-[0.5rem]">Report Details</h3>
                      <p className="text-[0.625rem] text-gray-600 font-medium max-w-[20rem]">
                        This document is an official audit of approved sales transactions within the specified scope, generated from the Mehera Cloud Registry System.
                      </p>
                    </div>
                    <div className="space-y-[0.75rem] text-right">
                      <h3 className="text-[0.5625rem] font-black text-gray-500 uppercase tracking-widest flex items-center gap-[0.5rem] justify-end">
                        Report Generated By:
                      </h3>
                      <div className="flex items-center gap-[0.75rem] bg-white p-[0.75rem] rounded-[1rem] border border-gray-200 shadow-sm justify-end">
                        <div className="text-right">
                          <p className="text-[0.625rem] font-black text-black uppercase leading-tight">{user?.name || user?.full_name || "System User"}</p>
                          <p className="text-[0.5rem] text-primary font-bold uppercase italic">Role: {user?.role?.replace("_", " ") || "Authorized"}</p>
                        </div>
                        <div className="w-[2rem] h-[2rem] rounded-full bg-black flex items-center justify-center text-primary">
                          <User size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="p-[2.5em] space-y-[2rem] flex-grow">
                  <ReportMetrics orders={ordersForExport} token={localStorage.getItem('accessToken')} />
                  {ordersForExport.length > 0 ? (
                    <div className="mehera-table-print-fix">
                      <ReportTable orders={ordersForExport} />
                    </div>
                  ) : (
                    <div className="py-[3rem] text-center text-gray-400 font-bold italic text-[0.875rem] uppercase">
                      No approved transactional records found for this scope.
                    </div>
                  )}
                </div>

                <div className="hidden print:block w-full bg-white h-[200px]"></div>
              </div>
           </div>

        </div>

        {/* --- Advanced Print Styles --- */}
        <style dangerouslySetInnerHTML={{ __html: `
            @media print {
                /* Everything is visible inside the isolated iframe */
                body * { visibility: visible !important; }
                html, body {
                  background: white !important; 
                  width: 100% !important;
                  margin: 0 !important; 
                  padding: 0 !important;
                  -webkit-print-color-adjust: exact;
                }
                .print\\:hidden { display: none !important; }
                .print\\:block { display: block !important; }
                
                .quotation-container {
                  --theme-bg: #ffffff !important;
                  --theme-card: #ffffff !important;
                  --theme-text: #111111 !important;  
                  --theme-border: #d1d5db !important;
                  --theme-primary: #b4a460 !important;
                  width: 100% !important;    
                  max-width: 100% !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  box-shadow: none !important;
                  box-sizing: border-box !important;
                  display: flex !important;
                  flex-direction: column !important;
                }
                .mehera-table-print-fix table { page-break-inside: auto !important; }
                .mehera-table-print-fix th, .mehera-table-print-fix td { page-break-inside: avoid !important; page-break-after: auto !important; }
                tr { page-break-inside: avoid !important; page-break-after: auto !important; }
            }
        `}} />
         <QuotationModal isOpen={isQuotationOpen} onClose={() => setIsQuotationOpen(false)} />
      </main>
  );
};

export default Dashboard;