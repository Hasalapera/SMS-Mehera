import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import api from '../../../api/axiosInstance'; // 👈 Centralized API Instance
import { toast } from 'react-hot-toast';
import { FileDown, FileText, Loader2, User } from 'lucide-react';
import ReportFilters from '../../../components/ReportFilters';
import ReportMetrics from '../../../components/ReportMetrics';
import ReportTable from '../../../components/ReportTable';
import { useAuth } from '../../../pages/context/AuthContext';

const SalesReport = () => {
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('monthly');
  const [orders, setOrders] = useState([]);
  const [dates, setDates] = useState({ startDate: '', endDate: '' });
  const { user } = useAuth(); // Get current user
  const [systemSettings, setSystemSettings] = useState(null); // For logo
  const printComponentRef = useRef(null); // Ref for printable component
  const wrapperRef = useRef(null); // Ref for scaling wrapper
  const [fontScale, setFontScale] = useState(1);

  // 📡 Async handler to pull aggregated records from backend
  const fetchReportData = async () => {
    // Auto-fetch ONLY when both dates are provided if 'custom' is selected
    if (filterType === 'custom' && (!dates.startDate || !dates.endDate)) {
        return; 
    }

    setLoading(true);
    try {
        let queryStr = `/report/sales-report?filterType=${filterType}`;
        if (filterType === 'custom') {
            queryStr += `&startDate=${dates.startDate}&endDate=${dates.endDate}`;
        }

        const response = await api.get(queryStr);
        setOrders(response.data.orders || []);
    } catch (err) {
        toast.error("Failed to load reporting node registries.");
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  // Fetch system settings for logo
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await api.get('/settings/public');
        setSystemSettings(res.data);
      } catch (err) {
        console.error("Report branding fetch failed:", err);
      }
    };
    fetchBranding();
  }, []);

  // Auto-fetch data on filter changes
  useEffect(() => {
    fetchReportData();
  }, [filterType, dates.startDate, dates.endDate]);

  // --- Font Scaling Logic for Mobile ---
  useEffect(() => {
    const handleFontScale = () => {
      if (wrapperRef.current) {
        const availableWidth = wrapperRef.current.offsetWidth || window.innerWidth;
        const designWidth = 800; // Original Width

        if (availableWidth < designWidth) {
          const ratio = availableWidth / designWidth;
          setFontScale(ratio);
        } else {
          setFontScale(1);
        }
      }
    };
    handleFontScale();
    window.addEventListener("resize", handleFontScale);
    return () => window.removeEventListener("resize", handleFontScale);
  }, [orders]);

  // 🖨️ PDF Trigger Mechanism using react-to-print v3 API.
  // The `contentRef` prop is used as per the latest API specification,
  // which directly takes the ref object instead of a function.
  const handleDownloadPDF = useReactToPrint({
    contentRef: printComponentRef,
    documentTitle: `SalesReport_${filterType}_${new Date().toISOString().slice(0,10)}`,
  });

  return (
    <div ref={wrapperRef} className="p-[1.5rem] md:p-[2rem] max-w-[72rem] mx-auto min-h-screen relative">
      
      {/* --- SCREEN VIEW (This part is hidden during print) --- */}
      <div className="print:hidden flex flex-col gap-[1.5rem] md:gap-[2rem]">
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

        {/* Filter Layer - Sticky on Mobile for quick access */}
        <div className="sticky top-[80px] md:top-[90px] z-40 py-2 -my-2 md:py-0 md:my-0 bg-background/95 backdrop-blur-xl border-b border-border/40 md:border-none md:bg-transparent md:backdrop-blur-none mx-[-1.5rem] px-[1.5rem] md:mx-0 md:px-0 transition-all duration-300">
          <ReportFilters 
            filterType={filterType} setFilterType={setFilterType} 
            dates={dates} setDates={setDates} 
          />
        </div>

        {loading ? (
          <div className="py-[5rem] text-center flex flex-col items-center justify-center gap-[1rem]">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-[0.875rem] text-textMain/50 font-bold tracking-widest uppercase">Compiling Node Documents...</p>
          </div>
        ) : (
          /* Screen Report View */
          <div className="bg-card border border-border rounded-[2.5rem] space-y-[2rem] shadow-sm p-[2rem]">
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

      {/* --- PRINT-ONLY VIEW (This part is hidden on screen) --- */}
      {/* 
        💡 FIX: The component to be printed must exist in the DOM for the `ref` to be assigned. 
        Using `display: none` (via the `hidden` class) removes the element from the layout tree, causing the ref to be null.
        We now use absolute positioning to hide it off-screen, ensuring the ref is always available for `react-to-print`.
      */}
      <div className="absolute -left-[9999px] top-0 w-full flex justify-center print:static print:w-auto">
        {/* ROOT PRINT WRAPPER */}
        <div 
          ref={printComponentRef} 
          className="print-root-wrapper relative z-10 w-[800px] print:w-full bg-transparent"
          style={{ fontSize: `${fontScale * 16}px`, width: '50em' }}
        >
          
          {/* 🖨️ FIXED PRINT FOOTER (Hidden on screen. Sits at the absolute bottom of EVERY print page, but masked by the content above it) */}
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

          {/* 📝 QUOTATION CONTAINER (Masks the fixed footer on previous pages) */}
          <div className="quotation-container relative z-20 w-full bg-white text-black shadow-2xl overflow-hidden print:shadow-none print:m-0 origin-top print:!transform-none print:!bg-white print:!text-black flex flex-col">
            
          {/* Header Section (Like Quotation.jsx) */}
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
                <p className="text-[1.125em] font-mono font-black italic tracking-tighter capitalize">{filterType}</p>
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
                    <User size={14 * fontScale} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="p-[2.5em] space-y-[2rem] flex-grow">
            <ReportMetrics orders={orders} />
            {orders.length > 0 ? (
              <div className="mehera-table-print-fix">
                <ReportTable orders={orders} />
              </div>
            ) : (
              <div className="py-[3rem] text-center text-gray-400 font-bold italic text-[0.875rem] uppercase">
                No approved transactional records found for this scope.
              </div>
            )}
          </div>

          {/* SCREEN FOOTER (Hidden in print to prevent duplication, keeps screen view normal) */}
          <div className="mehera-print-footer mt-auto print:hidden">
            {/* Signature Footer */}
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

            {/* Final Footer */}
            <div className="bg-black py-[1rem]">
              <p className="text-[0.5em] text-gray-500 uppercase tracking-[0.4em] font-black text-center">
                Cloud Registry System • Mehera International • {new Date().getFullYear()}
              </p>
            </div>
          </div>

          {/* PRINT SPACER (Pushes table content up so it doesn't overlap the fixed footer. Also triggers a page break if space is tight) */}
          <div className="hidden print:block w-full bg-white h-[200px]"></div>
        </div>
      </div>
      </div>

      {/* --- Advanced Print Control Styles --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4; margin: 30mm 15mm 20mm 15mm; } /* 💡 2 වෙනි පිටුවේ ඉඳන් උඩින් 30mm ක ලස්සන ඉඩක් තියනවා */
          @page :first { margin-top: 15mm; } /* 💡 පළමු පිටුවේ උඩින් තියෙන 15mm ඉඩ ඒ විදිහටම තියාගන්නවා */
          /* 
            💡 FIX: This overrides the global 'body * { visibility: hidden }' from index.css,
            which conflicts with react-to-print's iframe-based printing.
            We make everything visible first, then rely on '.print\\:hidden' to hide screen-only elements.
          */
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
          .mehera-table-print-fix table {
            page-break-inside: auto !important;
          }
          .mehera-table-print-fix th, .mehera-table-print-fix td {
            page-break-inside: avoid !important;
            page-break-after: auto !important;
          }
          tr { 
            page-break-inside: avoid !important; 
            page-break-after: auto !important; 
          }
        }
      `}} />
    </div>
  );
};

export default SalesReport;