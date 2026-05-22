import React, { useState, useEffect } from 'react';
import api from '../../../api/axiosInstance'; // 👈 Centralized API Instance
import { toast } from 'react-hot-toast';
import { FileDown, FileText, Loader2 } from 'lucide-react';
import ReportFilters from '../../../components/ReportFilters';
import ReportMetrics from '../../../components/ReportMetrics';
import ReportTable from '../../../components/ReportTable';

const SalesReport = () => {
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('monthly');
  const [orders, setOrders] = useState([]);
  const [dates, setDates] = useState({ startDate: '', endDate: '' });

  // 📡 Async handler to pull aggregated records from backend
  const fetchReportData = async () => {
    setLoading(true);
    try {
        let queryStr = `/report/sales-report?filterType=${filterType}`;
        if (filterType === 'custom') {
            if (!dates.startDate || !dates.endDate) {
                toast.error("Please pick both start & end durations!");
                setLoading(false);
                return;
            }
            queryStr += `&startDate=${dates.startDate}&endDate=${dates.endDate}`;
        }

        const response = await api.get(queryStr);
        setOrders(response.data.orders || []);
        toast.success("Sales data compiled successfully!");
    } catch (err) {
        toast.error("Failed to load reporting node registries.");
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  // Trigger content on mounting sequence
  useEffect(() => {
    fetchReportData();
  }, [filterType]);

  // 🖨️ PDF Trigger Mechanism
  const handleDownloadPDF = () => {
    window.print(); // Native high-fidelity print utility that matches standard CSS constraints flawlessly
  };

  return (
    <div className="p-[1.5rem] md:p-[2rem] max-w-[72rem] mx-auto space-y-[2rem] min-h-screen">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-[1rem]">
        <div>
          <h1 className="text-[1.5rem] font-serif font-bold text-textMain flex items-center gap-[0.75rem]">
            <div className="p-[0.5rem] bg-primary/10 rounded-[0.75rem] text-primary"><FileText size={24} /></div>
            Executive Sales Ledger
          </h1>
          <p className="text-[0.8125rem] text-textMain/50 mt-[0.25rem]">
            Compile certified accounting documentation for Mehera International distribution loops.
          </p>
        </div>
        
        {/* Export Button Action */}
        <button 
          onClick={handleDownloadPDF}
          disabled={orders.length === 0}
          className="px-[1.5rem] py-[0.75rem] bg-black text-white hover:bg-primary hover:text-black font-bold text-[0.875rem] rounded-[1rem] shadow-md transition-all flex items-center justify-center gap-[0.5rem] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FileDown size={18} /> Export PDF Report
        </button>
      </div>

      {/* Filter Layer */}
      <ReportFilters 
        filterType={filterType} setFilterType={setFilterType} 
        dates={dates} setDates={setDates} onFetch={fetchReportData} 
      />

      {loading ? (
        <div className="py-[5rem] text-center flex flex-col items-center justify-center gap-[1rem]">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-[0.875rem] text-textMain/50 font-bold tracking-widest uppercase">Compiling Node Documents...</p>
        </div>
      ) : (
        /* 🔒 Printable Containment Wrapper - Force specific theme variables and handle scaling natively */
        <div id="mehera-printable-node" className="mehera-report-static-forced mehera-report-printable-area p-[2rem] bg-card border border-border rounded-[2.5rem] space-y-[2rem] shadow-sm">
          
          {/* Header Metadata inside the printable area */}
          <div className="border-b border-border pb-[1.5rem] flex justify-between items-end">
            <div>
              <h2 className="text-[1.25rem] font-serif font-bold text-textMain">MEHERA INTERNATIONAL (PVT) LTD</h2>
              <p className="text-[0.75rem] uppercase tracking-widest font-black text-primary mt-[0.25rem]">Official Distribution Audit Report</p>
            </div>
            <div className="text-right text-[0.75rem] text-textMain/50 font-medium">
              <p>Generated: {new Date().toLocaleDateString('en-GB')}</p>
              <p className="uppercase font-bold text-[0.6875rem] mt-[0.125rem]">Scope: {filterType}</p>
            </div>
          </div>

          {/* Metrics Layer */}
          <ReportMetrics orders={orders} />

          {/* Table Data Matrix */}
          {orders.length > 0 ? (
            <ReportTable orders={orders} />
          ) : (
            <div className="py-[3rem] text-center text-textMain/40 font-bold italic text-[0.875rem] uppercase">
              No approved transactional records found for this scope.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesReport;