import React, { useState, useEffect, useRef } from 'react';
import SideBar from '../../components/SideBar';
import { useNavigate } from 'react-router-dom'; 
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-hot-toast';
import { 
  LayoutDashboard, Bell, ArrowUpRight, MoreVertical, Calendar,
  PlusCircle, SlidersHorizontal, Download, RefreshCw, Loader2, ArrowRight, Printer, FileText, Check, ChevronDown,
  FileSpreadsheet, FileDown, ReceiptText, User,
} from 'lucide-react';
import api from '../../api/axiosInstance';
import ReportMetrics from '../../components/ReportMetrics';
import ReportTable from '../../components/ReportTable';
import QuotationModal from '../../components/QuotationModal';
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // --- Filter States ---
  const [period, setPeriod] = useState('month'); // 'week', 'month', 'year', 'custom'
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [specificMonth, setSpecificMonth] = useState(new Date().toISOString().slice(0, 7));
  const [specificYear, setSpecificYear] = useState(new Date().getFullYear().toString());
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [compareType, setCompareType] = useState('prev'); // 'prev', 'custom'
  const [isCompareDropdownOpen, setIsCompareDropdownOpen] = useState(false);
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
  // const formatDate = (date) => date.toISOString().split('T')[0];
  // Date Helper Function (Timezone Safe)
  const formatDate = (date) => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

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
          
          // 1. මුලින්ම Start Date ඉඳන් End Date වෙනකම් හැම දවසක්ම 0 විදිහට හදාගන්නවා
          const [sYear, sMonth, sDay] = curStart.split('-');
          let currentLoopDate = new Date(sYear, sMonth - 1, sDay);
          
          const [eYear, eMonth, eDay] = curEnd.split('-');
          const endLoopDate = new Date(eYear, eMonth - 1, eDay);

          while (currentLoopDate <= endLoopDate) {
             const yyyy = currentLoopDate.getFullYear();
             const mm = String(currentLoopDate.getMonth() + 1).padStart(2, '0');
             const dd = String(currentLoopDate.getDate()).padStart(2, '0');
             const sortKey = `${yyyy}-${mm}-${dd}`;
             
             days[sortKey] = 0; // හැම දවසකටම මුලින් 0 යොදන්න
             
             currentLoopDate.setDate(currentLoopDate.getDate() + 1); // ඊළඟ දවසට යන්න
          }

          // 2. ඊට පස්සේ API එකෙන් ආපු Orders වල ගණන් ටික අදාළ දවස් වලට එකතු කරනවා
          curOrders.forEach(o => {
             const dateObj = new Date(o.created_at || o.createdAt);
             const yyyy = dateObj.getFullYear();
             const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
             const dd = String(dateObj.getDate()).padStart(2, '0');
             const sortKey = `${yyyy}-${mm}-${dd}`;
             
             if (days[sortKey] !== undefined) {
                 days[sortKey] += Number(o.total_amount || 0);
             } else {
                 days[sortKey] = Number(o.total_amount || 0);
             }
          });
          
          // 3. Graph එකට අවශ්‍ය විදිහට Array එකක් බවට පත් කරගන්නවා
          groupedData = Object.keys(days).sort().map(key => {
             // key එක (උදා: "2026-07-02") Timezone ප්‍රශ්න නැතුව ලංකාවේ වෙලාවට ගන්නවා
             const [y, m, d] = key.split('-');
             const dateObj = new Date(y, m - 1, d);
             const label = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
             
             return { label, value: days[key] };
          });
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

  const waitForPaint = () =>
    new Promise((resolve) => requestAnimationFrame(resolve));

  const sleep = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const isMobilePrintDevice = () => {
    return (
      window.innerWidth < 768 ||
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    );
  };

  const prepareForPdfCapture = async (element) => {
    if (!element) return;

    await waitForPaint();
    await sleep(250);

    if (document.fonts) {
      await document.fonts.ready;
    }

    const images = Array.from(element.querySelectorAll("img"));

    await Promise.all(
      images.map((img) => {
        const src = img.getAttribute("src");
        if (!src) return Promise.resolve();
        if (img.complete && img.naturalHeight !== 0) return Promise.resolve();

        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );
  };

  const downloadReportAsPdf = async (element, filename) => {
    if (!element) {
      toast.error("Report content not found.");
      return;
    }

    const toastId = toast.loading("Generating PDF...");
    let sandbox = null;

    try {
      const clonedElement = element.cloneNode(true);

      sandbox = document.createElement("div");
      sandbox.style.position = "fixed";
      sandbox.style.left = "-10000px";
      sandbox.style.top = "0";
      sandbox.style.width = "1120px";
      sandbox.style.background = "#ffffff";
      sandbox.style.zIndex = "-9999";
      sandbox.style.pointerEvents = "none";
      sandbox.style.overflow = "visible";

      const exportStyle = document.createElement("style");
      exportStyle.textContent = `
        .pdf-export-capture {
          width: 1120px !important;
          max-width: 1120px !important;
          min-height: 0 !important;
          height: auto !important;
          overflow: visible !important;
          transform: none !important;
          background: #ffffff !important;
          color: #111111 !important;
          box-sizing: border-box !important;
          font-size: 16px !important;
        }

        .pdf-export-capture * {
          box-sizing: border-box !important;
        }

        .pdf-export-capture .report-pagination-controls,
        .pdf-export-capture .report-order-modal,
        .pdf-export-capture [data-export-hide="true"] {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          overflow: hidden !important;
        }

        .pdf-export-capture .report-table-mobile {
          display: none !important;
        }

        .pdf-export-capture .report-table-desktop {
          display: block !important;
          overflow: visible !important;
          width: 100% !important;
        }

        .pdf-export-capture .mehera-table-print-fix,
        .pdf-export-capture .custom-scrollbar {
          overflow: visible !important;
          max-height: none !important;
        }

        .pdf-export-capture table.report-data-table {
          width: 100% !important;
          table-layout: fixed !important;
          border-collapse: collapse !important;
          border-spacing: 0 !important;
        }

        .pdf-export-capture thead {
          display: table-header-group !important;
        }

        .pdf-export-capture tbody {
          display: table-row-group !important;
        }

        .pdf-export-capture .report-table-row,
        .pdf-export-capture tbody tr,
        .pdf-export-capture .hidden.print\\:table-row {
          display: table-row !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        .pdf-export-capture th {
          background: #ffffff !important;
          color: #777777 !important;
          border-bottom: 1px solid #e5e7eb !important;
          padding: 14px 10px !important;
          font-size: 10px !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.16em !important;
          white-space: normal !important;
        }

        .pdf-export-capture td {
          background: #ffffff !important;
          color: #111111 !important;
          border-bottom: 1px solid #e5e7eb !important;
          border-top: 0 !important;
          border-left: 0 !important;
          border-right: 0 !important;
          border-radius: 0 !important;
          padding: 16px 10px !important;
          font-size: 12px !important;
          vertical-align: middle !important;
          overflow: visible !important;
        }

        .pdf-export-capture th:nth-child(1),
        .pdf-export-capture td:nth-child(1) {
          width: 19% !important;
        }

        .pdf-export-capture th:nth-child(2),
        .pdf-export-capture td:nth-child(2) {
          width: 24% !important;
        }

        .pdf-export-capture th:nth-child(3),
        .pdf-export-capture td:nth-child(3) {
          width: 18% !important;
        }

        .pdf-export-capture th:nth-child(4),
        .pdf-export-capture td:nth-child(4) {
          width: 27% !important;
        }

        .pdf-export-capture th:nth-child(5),
        .pdf-export-capture td:nth-child(5) {
          width: 12% !important;
          text-align: right !important;
        }

        .pdf-export-capture td p,
        .pdf-export-capture td span,
        .pdf-export-capture td div {
          overflow: visible !important;
          white-space: normal !important;
          text-overflow: clip !important;
          max-width: none !important;
        }

        .pdf-export-capture td:nth-child(4) > div {
          display: block !important;
        }

        .pdf-export-capture td:nth-child(4) > div > div {
          display: grid !important;
          grid-template-columns: 1fr 35px !important;
          gap: 8px !important;
          align-items: start !important;
          background: transparent !important;
          border: 0 !important;
          padding: 0 0 4px 0 !important;
          margin: 0 !important;
        }

        .pdf-export-capture td:nth-child(4) span {
          font-size: 11px !important;
          line-height: 1.35 !important;
        }

        .pdf-export-capture td:nth-child(5) {
          font-size: 13px !important;
          font-weight: 900 !important;
          white-space: nowrap !important;
        }
      `;

      clonedElement.classList.add("pdf-export-capture");

      clonedElement.style.width = "1120px";
      clonedElement.style.maxWidth = "1120px";
      clonedElement.style.minHeight = "0";
      clonedElement.style.height = "auto";
      clonedElement.style.fontSize = "16px";
      clonedElement.style.transform = "none";
      clonedElement.style.background = "#ffffff";
      clonedElement.style.overflow = "visible";

      sandbox.appendChild(exportStyle);
      sandbox.appendChild(clonedElement);
      document.body.appendChild(sandbox);

      // Remove pagination/modal/mobile cards from PDF clone
      clonedElement
        .querySelectorAll(
          ".report-pagination-controls, .report-order-modal, [data-export-hide='true']"
        )
        .forEach((el) => el.remove());

      clonedElement
        .querySelectorAll(".report-table-mobile")
        .forEach((el) => el.remove());

      // Force desktop table layout for mobile PDF
      clonedElement.querySelectorAll(".report-table-desktop").forEach((el) => {
        el.style.setProperty("display", "block", "important");
        el.style.setProperty("overflow", "visible", "important");
        el.style.setProperty("width", "100%", "important");
      });

      // Force all rows visible for export
      clonedElement.querySelectorAll("tbody tr").forEach((row) => {
        row.classList.remove("hidden");
        row.classList.add("report-table-row");
        row.setAttribute("data-pdf-row", "true");
        row.style.setProperty("display", "table-row", "important");
        row.style.setProperty("break-inside", "avoid", "important");
        row.style.setProperty("page-break-inside", "avoid", "important");
      });

      // Remove old desktop print footer from captured DOM
      clonedElement.querySelectorAll("*").forEach((el) => {
        const className = String(el.className || "");

        if (
          className.includes("print:block") &&
          className.includes("fixed") &&
          className.includes("bottom-0")
        ) {
          el.remove();
        }

        if (
          className.includes("print:block") &&
          className.includes("h-[200px]")
        ) {
          el.remove();
        }
      });

      await prepareForPdfCapture(clonedElement);
      await sleep(300);

      const rootRect = clonedElement.getBoundingClientRect();

      let contentBottom = 0;

      clonedElement.querySelectorAll("*").forEach((el) => {
        const style = window.getComputedStyle(el);

        if (style.display === "none" || style.visibility === "hidden") return;

        const rect = el.getBoundingClientRect();

        if (rect.width <= 0 || rect.height <= 0) return;

        contentBottom = Math.max(contentBottom, rect.bottom - rootRect.top);
      });

      const captureHeightCss = Math.ceil(contentBottom + 8);
      clonedElement.style.height = `${captureHeightCss}px`;

      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 1120,
        windowWidth: 1120,
        height: captureHeightCss,
        windowHeight: captureHeightCss,
        scrollX: 0,
        scrollY: 0,
        foreignObjectRendering: false,
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error("Empty canvas generated.");
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const pageCanvasHeight = Math.floor((pdfHeight * canvas.width) / pdfWidth);
      const cssToCanvasScale = canvas.width / rootRect.width;

      const finalFooterReservedPt = 120;
      const finalPageImageMaxHeight = pdfHeight - finalFooterReservedPt;

      const safetyGap = Math.floor(18 * cssToCanvasScale);
      const minProgress = Math.floor(pageCanvasHeight * 0.35);

      const rowBoxes = Array.from(
        clonedElement.querySelectorAll("[data-pdf-row='true']")
      )
        .map((row) => {
          const rect = row.getBoundingClientRect();

          return {
            top: Math.max(
              0,
              Math.floor((rect.top - rootRect.top) * cssToCanvasScale)
            ),
            bottom: Math.min(
              canvas.height,
              Math.ceil((rect.bottom - rootRect.top) * cssToCanvasScale)
            ),
          };
        })
        .filter((box) => box.bottom > box.top + 2);

      // Check whether a canvas slice is completely blank/white.
      // This prevents blank middle pages.
      const isBlankSlice = (sourceY, sourceHeight) => {
        if (sourceHeight <= 20) return true;

        const sampleCanvas = document.createElement("canvas");
        const sampleWidth = 80;
        const sampleHeight = Math.min(120, Math.max(20, Math.floor(sourceHeight / 12)));

        sampleCanvas.width = sampleWidth;
        sampleCanvas.height = sampleHeight;

        const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });

        sampleCtx.fillStyle = "#ffffff";
        sampleCtx.fillRect(0, 0, sampleWidth, sampleHeight);

        sampleCtx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sourceHeight,
          0,
          0,
          sampleWidth,
          sampleHeight
        );

        const pixels = sampleCtx.getImageData(0, 0, sampleWidth, sampleHeight).data;

        let nonWhitePixels = 0;
        const totalPixels = sampleWidth * sampleHeight;

        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];

          if (a > 20 && (r < 245 || g < 245 || b < 245)) {
            nonWhitePixels++;
          }
        }

        return nonWhitePixels / totalPixels < 0.002;
      };

      const addSlice = (
        sourceY,
        sourceHeight,
        isFirstPage,
        maxPdfImageHeight = null,
        allowBlank = false
      ) => {
        if (sourceHeight <= 20) return false;

        if (!allowBlank && isBlankSlice(sourceY, sourceHeight)) {
          return false;
        }

        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sourceHeight;

        const ctx = sliceCanvas.getContext("2d");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);

        ctx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sourceHeight,
          0,
          0,
          canvas.width,
          sourceHeight
        );

        if (!isFirstPage) {
          pdf.addPage();
        }

        const imgData = sliceCanvas.toDataURL("image/png");
        const naturalImgHeight = (sourceHeight * pdfWidth) / canvas.width;

        const imgHeight = maxPdfImageHeight
          ? Math.min(naturalImgHeight, maxPdfImageHeight)
          : naturalImgHeight;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);

        return true;
      };

      const drawFinalFooter = () => {
        pdf.setPage(pdf.getNumberOfPages());

        const blackFooterHeight = 34;
        const signatureAreaHeight = 82;

        const blackY = pdfHeight - blackFooterHeight;
        const signatureY = blackY - signatureAreaHeight;

        const marginX = 36;
        const gap = 45;
        const lineWidth = (pdfWidth - marginX * 2 - gap) / 2;

        const leftX = marginX;
        const rightX = marginX + lineWidth + gap;

        const lineY = signatureY + 38;
        const labelY = lineY + 15;

        // White signature area
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, signatureY, pdfWidth, signatureAreaHeight, "F");

        // Light top border
        pdf.setDrawColor(230, 230, 230);
        pdf.setLineWidth(0.5);
        pdf.line(0, signatureY, pdfWidth, signatureY);

        // Signature lines
        pdf.setDrawColor(17, 17, 17);
        pdf.setLineWidth(1.1);

        pdf.line(leftX, lineY, leftX + lineWidth, lineY);
        pdf.line(rightX, lineY, rightX + lineWidth, lineY);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.setTextColor(17, 17, 17);

        pdf.text("MANAGER'S SIGNATURE", leftX + lineWidth / 2, labelY, {
          align: "center",
        });

        pdf.text("AUTHORIZED SIGNATURE", rightX + lineWidth / 2, labelY, {
          align: "center",
        });

        // Black footer
        pdf.setFillColor(0, 0, 0);
        pdf.rect(0, blackY, pdfWidth, blackFooterHeight, "F");

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(6);
        pdf.setTextColor(90, 95, 105);

        pdf.text(
          `C L O U D   R E G I S T R Y   S Y S T E M   •   M E H E R A   I N T E R N A T I O N A L   •   ${new Date().getFullYear()}`,
          pdfWidth / 2,
          blackY + 21,
          { align: "center" }
        );
      };

      const findSafeEndY = (startY, desiredEndY) => {
        let endY = Math.min(desiredEndY, canvas.height);

        const crossingRow = rowBoxes.find(
          (box) => box.top < endY - safetyGap && box.bottom > endY - safetyGap
        );

        if (crossingRow && crossingRow.top > startY + minProgress) {
          endY = Math.max(startY + 1, crossingRow.top - safetyGap);
        }

        if (endY <= startY + 30) {
          endY = Math.min(startY + pageCanvasHeight, canvas.height);
        }

        return endY;
      };

      let startY = 0;
      let isFirstPage = true;
      let footerDrawn = false;

      while (startY < canvas.height - 2) {
        const remaining = canvas.height - startY;

        // Final page:
        // Put the remaining content above footer area.
        // If remaining is slightly taller, image is scaled down a little to avoid footer overlap.
        if (remaining <= pageCanvasHeight) {
          const added = addSlice(
            startY,
            remaining,
            isFirstPage,
            finalPageImageMaxHeight
          );

          if (added) {
            drawFinalFooter();
            footerDrawn = true;
            isFirstPage = false;
          } else if (!footerDrawn && pdf.getNumberOfPages() > 0) {
            drawFinalFooter();
            footerDrawn = true;
          }

          startY = canvas.height;
          break;
        }

        let desiredEndY = startY + pageCanvasHeight;
        let endY = findSafeEndY(startY, desiredEndY);

        // Prevent blank middle pages
        const sliceHeight = endY - startY;

        if (sliceHeight <= 30 || isBlankSlice(startY, sliceHeight)) {
          startY = endY;
          continue;
        }

        const added = addSlice(startY, sliceHeight, isFirstPage);

        if (added) {
          isFirstPage = false;
        }

        startY = endY;
      }

      // Edge case fallback
      if (!footerDrawn) {
        drawFinalFooter();
      }

      pdf.save(filename);

      toast.success("PDF downloaded successfully!", { id: toastId });
    } catch (error) {
      console.error("Mobile PDF generation failed:", error);
      toast.error("Failed to generate PDF.", { id: toastId });
    } finally {
      if (sandbox) {
        document.body.removeChild(sandbox);
      }
    }
  };

  const handleSmartReportDownload = async (ref, desktopPrintFn, filename) => {
    if (isMobilePrintDevice()) {
      await downloadReportAsPdf(ref.current, filename);
    } else {
      desktopPrintFn();
    }
  };

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

  const periodOptions = [
      { id: 'week', label: 'This Week' },
      { id: 'month', label: 'This Month' },
      { id: 'year', label: 'This Year' },
      { id: 'specific_month', label: 'Specific Month' },
      { id: 'specific_year', label: 'Specific Year' },
      { id: 'custom', label: 'Custom Date' }
  ];

  const compareOptions = [
      { id: 'prev', label: 'Previous Period' },
      { id: 'custom', label: 'Custom Range' },
      { id: 'specific_month', label: 'Specific Month' },
      { id: 'specific_year', label: 'Specific Year' }
  ];

  // --- QuickBooks CSV Export Logic ---
  // This CSV is aligned with the client's QuickBooks Desktop IIF list names.
  // It keeps the output as .csv, but uses QB account/item/terms/tax names from the uploaded IIF file.
  const QB_REF = {
    txnType: 'INVOICE',
    arAccount: 'Accounts Receivable',
    salesAccount: 'Sale of Cosmetics',
    discountAccount: 'Customers Discount',
    deliveryAccount: 'Sale of Cosmetics',
    roundingAccount: 'Other Income',
    inventoryAssetAccount: 'Inventory Asset',
    cogsAccount: 'Cost of Goods Sold',
    deliveryItem: 'Delivery',
    defaultDiscountItem: 'Discount 10%',
    discountItems: {
      5: 'Discount 5%',
      10: 'Discount 10%',
      25: 'Discount 25%',
    },
    roundingItem: 'ROU',
    taxCode: 'Tax',
    nonTaxCode: 'Non',
    terms: {
      online: 'Online transfer',
      cod: 'Cash On Deivery', // spelling exactly as found in client's QB IIF
      cash: 'Cash and credit',
      credit: 'Credit',
    },
    paymentMethods: {
      online: 'ONLINE',
      cash: 'Cash',
      bank: 'Bank dep',
      cheque: 'Check',
    },
    shipMethods: {
      pronto: 'PRONTO',
      dhl: 'DHL',
      pickup: 'PICKUP',
      bus: 'BUS',
      pickme: 'PICKME',
      defaultOnline: 'COURIER-FDE',
      defaultOffline: 'Delivered',
    },
    classes: {
      cosmetics1: 'COS-1',
      cosmetics2: 'COS-2',
      kaaral1: 'KAARAL01',
      kaaral2: 'KAARAL 02',
      kaaral3: 'KAARAL 03',
      studio17: 'STUDIO 17',
    }
  };

  const csvEscape = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value).replace(/\r?\n|\r/g, ' ').trim();
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const toMoney = (value) => {
    const num = Number(value || 0);
    return Number.isFinite(num) ? num.toFixed(2) : '0.00';
  };

  const toQty = (value) => {
    const num = Number(value || 0);
    return Number.isFinite(num) ? num : 0;
  };

  const formatQBDate = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    // QuickBooks Desktop commonly accepts MM/DD/YYYY in CSV imports.
    return `${mm}/${dd}/${yyyy}`;
  };

  const addDays = (value, days) => {
    const d = new Date(value || new Date());
    d.setDate(d.getDate() + days);
    return d;
  };

  const cleanName = (value, fallback = '') => {
    const cleaned = String(value || '').replace(/\s+/g, ' ').trim();
    return cleaned || fallback;
  };

  const getCustomerName = (order) => {
    // Prefer QB-specific name if the backend later provides it.
    return cleanName(
      order.customer?.qb_name ||
      order.customer?.quickbooks_name ||
      order.customer?.saloon_name ||
      order.customer_name ||
      order.customer?.name,
      'Direct Customer'
    );
  };

  const getInvoiceNo = (order) => {
    const existing = order.invoice_no || order.invoice_number || order.ref_no;
    if (existing) return cleanName(existing);
    return `SMS-${String(order.order_id || '').substring(0, 8).toUpperCase()}`;
  };

  const getTerms = (order) => {
    const paymentText = `${order.payment_method || order.payment_type || order.order_type || ''}`.toLowerCase();
    if (paymentText.includes('online') || order.order_type === 'online') return QB_REF.terms.online;
    if (paymentText.includes('credit')) return QB_REF.terms.credit;
    if (paymentText.includes('cash')) return QB_REF.terms.cash;
    return QB_REF.terms.cod;
  };

  const getPaymentMethod = (order) => {
    const paymentText = `${order.payment_method || order.payment_type || order.order_type || ''}`.toLowerCase();
    if (paymentText.includes('bank') || paymentText.includes('deposit')) return QB_REF.paymentMethods.bank;
    if (paymentText.includes('cheque') || paymentText.includes('check')) return QB_REF.paymentMethods.cheque;
    if (paymentText.includes('online') || order.order_type === 'online') return QB_REF.paymentMethods.online;
    return QB_REF.paymentMethods.cash;
  };

  const getShipMethod = (order) => {
    const raw = `${order.courier_name || order.delivery_method || order.shipping_method || ''}`.toLowerCase();
    if (raw.includes('pronto')) return QB_REF.shipMethods.pronto;
    if (raw.includes('dhl')) return QB_REF.shipMethods.dhl;
    if (raw.includes('pickup') || raw.includes('pick up')) return QB_REF.shipMethods.pickup;
    if (raw.includes('bus')) return QB_REF.shipMethods.bus;
    if (raw.includes('pickme')) return QB_REF.shipMethods.pickme;
    return order.order_type === 'online' ? QB_REF.shipMethods.defaultOnline : QB_REF.shipMethods.defaultOffline;
  };

  const getSalesRep = (order) => {
    // Match existing QB sales rep initials where possible. Backend can later send qb_initials.
    const explicit = order.sales_rep?.qb_initials || order.salesRep?.qb_initials || order.sales_rep_initials;
    if (explicit) return explicit;

    const name = `${order.sales_rep?.name || order.salesRep?.name || order.createdBy?.name || order.user?.name || ''}`.toLowerCase();
    if (name.includes('kavindu')) return 'KG';
    if (name.includes('lasantha')) return 'LK';
    if (name.includes('tharindu')) return 'TG';
    if (name.includes('thejadha') || name.includes('thejada')) return 'TR';
    return '';
  };

  const getQBClass = (item, order) => {
    const productName = `${item.variant?.product?.name || item.variant?.product?.product_name || item.product_name || ''}`.toLowerCase();
    const variantName = `${item.variant?.variant_name || item.variant_name || ''}`.toLowerCase();
    const orderClass = order.qb_class || order.quickbooks_class || '';
    if (orderClass) return orderClass;
    if (productName.includes('kaaral') || variantName.includes('kaaral')) return QB_REF.classes.kaaral1;
    if (productName.includes('studio 17') || productName.includes('studion 17') || productName.includes('s17')) return QB_REF.classes.studio17;
    return QB_REF.classes.cosmetics1;
  };

  const getQBItemName = (item) => {
    // Best practice: save this value in DB from the client's QuickBooks item list.
    const qbName =
      item.qb_item_name ||
      item.quickbooks_item_name ||
      item.variant?.qb_item_name ||
      item.variant?.quickbooks_item_name ||
      item.variant?.product?.qb_item_name ||
      item.variant?.product?.quickbooks_item_name;
    if (qbName) return cleanName(qbName);

    // If product/variant has SKU/code matching QB item names like S17BB833 or KAARAL:KBEYOS300ML, prefer it.
    const possibleCode =
      item.variant?.sku ||
      item.variant?.item_code ||
      item.variant?.variant_code ||
      item.variant?.product?.sku ||
      item.variant?.product?.item_code ||
      item.product_code;
    if (possibleCode) return cleanName(possibleCode);

    const productName = cleanName(item.variant?.product?.name || item.variant?.product?.product_name || item.product_name, 'Item');
    const variantName = cleanName(item.variant?.variant_name || item.variant_name || 'Std');
    return variantName && variantName !== 'Std' ? `${productName} - ${variantName}` : productName;
  };

  const getDiscountItem = (order) => {
    const percent = Number(order.discount_percentage || order.discount_percent || order.discount_rate || 0);
    if (percent && QB_REF.discountItems[Math.round(percent)]) {
      return QB_REF.discountItems[Math.round(percent)];
    }
    return QB_REF.defaultDiscountItem;
  };

  const pushCsvRow = (rows, row) => {
    rows.push(row.map(csvEscape).join(','));
  };

  const handleDownloadCSV = () => {
    if (ordersForExport.length === 0) {
      toast.error('No data available to export.');
      return;
    }

    // CSV columns designed for QuickBooks transaction import mapping.
    // They use exact QB list names found in the client's IIF: Accounts, Items, Terms, Tax Codes, Ship Methods, Payment Methods, Classes.
    const headers = [
      'TxnType',
      'RefNumber',
      'TxnDate',
      'Customer',
      'ARAccount',
      'Terms',
      'DueDate',
      'SalesRep',
      'Class',
      'ShipMethod',
      'PaymentMethod',
      'Memo',
      'Item',
      'ItemDescription',
      'Quantity',
      'Rate',
      'LineAmount',
      'IncomeAccount',
      'AssetAccount',
      'COGSAccount',
      'TaxCode',
      'TrackingNumber',
      'SystemOrderId',
      'OrderType',
      'LineType'
    ];

    const csvRows = [headers.map(csvEscape).join(',')];
    const skippedOrders = [];

    ordersForExport.forEach((order) => {
      const items = order.items || order.OrderItems || [];
      if (!items.length) {
        skippedOrders.push(getInvoiceNo(order));
        return;
      }

      const invoiceNo = getInvoiceNo(order);
      const customer = getCustomerName(order);
      const txnDateValue = order.created_at || order.createdAt || order.order_date || new Date();
      const txnDate = formatQBDate(txnDateValue);
      const dueDate = formatQBDate(order.due_date || addDays(txnDateValue, 0));
      const terms = getTerms(order);
      const salesRep = getSalesRep(order);
      const shipMethod = getShipMethod(order);
      const paymentMethod = getPaymentMethod(order);
      const trackingNo = order.tracking_id || order.tracking_number || '';
      const orderType = order.order_type || '';
      const memo = `SMS-Mehera Order ${invoiceNo}${trackingNo ? ` | Tracking: ${trackingNo}` : ''}`;

      let itemSubtotal = 0;

      items.forEach((item) => {
        const qty = toQty(item.quantity || item.qty || 0);
        const rate = Number(item.price || item.rate || item.unit_price || 0);
        const amount = qty * rate;
        itemSubtotal += amount;

        const qbItem = getQBItemName(item);
        const productName = cleanName(item.variant?.product?.name || item.variant?.product?.product_name || item.product_name, 'Product');
        const variantName = cleanName(item.variant?.variant_name || item.variant_name || 'Std');
        const description = variantName && variantName !== 'Std' ? `${productName} - ${variantName}` : productName;

        pushCsvRow(csvRows, [
          QB_REF.txnType,
          invoiceNo,
          txnDate,
          customer,
          QB_REF.arAccount,
          terms,
          dueDate,
          salesRep,
          getQBClass(item, order),
          shipMethod,
          paymentMethod,
          memo,
          qbItem,
          description,
          qty,
          toMoney(rate),
          toMoney(amount),
          QB_REF.salesAccount,
          QB_REF.inventoryAssetAccount,
          QB_REF.cogsAccount,
          item.taxable === true ? QB_REF.taxCode : QB_REF.nonTaxCode,
          trackingNo,
          order.order_id,
          orderType,
          'ITEM'
        ]);
      });

      const discountAmount = Number(order.discount_amount || order.discount || 0);
      if (discountAmount > 0) {
        pushCsvRow(csvRows, [
          QB_REF.txnType,
          invoiceNo,
          txnDate,
          customer,
          QB_REF.arAccount,
          terms,
          dueDate,
          salesRep,
          QB_REF.classes.cosmetics1,
          shipMethod,
          paymentMethod,
          memo,
          getDiscountItem(order),
          'Order Discount',
          1,
          toMoney(-discountAmount),
          toMoney(-discountAmount),
          QB_REF.discountAccount,
          '',
          '',
          QB_REF.taxCode,
          trackingNo,
          order.order_id,
          orderType,
          'DISCOUNT'
        ]);
      }

      const deliveryAmount = Number(
        order.delivery_fee ||
        order.delivery_charge ||
        order.shipping_fee ||
        order.shipping_charge ||
        order.courier_charge ||
        0
      );
      if (deliveryAmount > 0) {
        pushCsvRow(csvRows, [
          QB_REF.txnType,
          invoiceNo,
          txnDate,
          customer,
          QB_REF.arAccount,
          terms,
          dueDate,
          salesRep,
          QB_REF.classes.cosmetics1,
          shipMethod,
          paymentMethod,
          memo,
          QB_REF.deliveryItem,
          'Delivery',
          1,
          toMoney(deliveryAmount),
          toMoney(deliveryAmount),
          QB_REF.deliveryAccount,
          '',
          '',
          QB_REF.taxCode,
          trackingNo,
          order.order_id,
          orderType,
          'DELIVERY'
        ]);
      }

      // Balance line: if system total and item total differ because of rounding/adjustments, export ROU line.
      const orderTotal = Number(order.total_amount || 0);
      const calculatedTotal = itemSubtotal - discountAmount + deliveryAmount;
      const roundingAmount = Number((orderTotal - calculatedTotal).toFixed(2));
      if (Math.abs(roundingAmount) >= 0.01) {
        pushCsvRow(csvRows, [
          QB_REF.txnType,
          invoiceNo,
          txnDate,
          customer,
          QB_REF.arAccount,
          terms,
          dueDate,
          salesRep,
          QB_REF.classes.cosmetics1,
          shipMethod,
          paymentMethod,
          memo,
          QB_REF.roundingItem,
          'Rounding / Order Total Adjustment',
          1,
          toMoney(roundingAmount),
          toMoney(roundingAmount),
          QB_REF.roundingAccount,
          '',
          '',
          QB_REF.nonTaxCode,
          trackingNo,
          order.order_id,
          orderType,
          'ROUNDING'
        ]);
      }
    });

    const csvContent = `\uFEFF${csvRows.join('\r\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `QuickBooks_Sales_Import_${period}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (skippedOrders.length > 0) {
      toast.success(`QuickBooks CSV exported. ${skippedOrders.length} order(s) skipped because they had no items.`);
    } else {
      toast.success('QuickBooks CSV exported successfully!');
    }
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
      <main className={`w-full`} onClick={() => {
        setIsPeriodDropdownOpen(false);
        setIsCompareDropdownOpen(false);
      }}>
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-start gap-6 mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-textMain transition-colors duration-300 flex items-center gap-3">
              <div className="p-2 bg-primary transition-all duration-300 rounded-lg text-textMain transition-colors duration-300 shadow-sm">
                <LayoutDashboard size={24} />
              </div>
              System Dashboard
            </h2>
            <p className="text-textMain/50 transition-colors duration-300 text-xs md:text-sm mt-1 ml-2 md:ml-12">
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
              <button onClick={() =>
                  handleSmartReportDownload(
                    salesLedgerPrintRef,
                    handlePrintSalesLedger,
                    `SalesReport_${period}_${dateStamp}.pdf`
                  )
                } className="flex items-center justify-center gap-2 bg-primary text-black px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#b4a460]/20 hover:bg-[#9a8b50] transition-all">
                <FileDown size={14} /> PDF
              </button>
              <button onClick={() => setIsQuotationOpen(true)} className="col-span-2 md:col-auto flex items-center justify-center gap-2 bg-black text-primary px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg border border-primary/30 hover:border-primary transition-all">
                <ReceiptText size={14} /> Quotation
              </button>
            </div>
          </div>
        </header>

        {/* Action Buttons Bar (Filter, Customize, Export) */}
        <div className="bg-card p-3 md:p-4 rounded-2xl border border-border shadow-sm flex flex-wrap items-center justify-start gap-3 mb-8">
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button 
                type="button"
                onClick={() => {
                  setIsPeriodDropdownOpen(!isPeriodDropdownOpen);
                  setIsCompareDropdownOpen(false);
                }}
                className="bg-card border border-border text-primary hover:bg-primary/10 transition-all duration-300 w-full sm:w-auto px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 md:min-w-[180px] justify-between shadow-md active:scale-95"
              >
                <span className="truncate uppercase text-[9px] md:text-[10px] tracking-widest">
                  {periodOptions.find(o => o.id === period)?.label || 'Select Period'}
                </span>
                <ChevronDown size={16} className={`transition-transform duration-300 ${isPeriodDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isPeriodDropdownOpen && (
                <div className="absolute top-full mt-2 w-full bg-card rounded-2xl shadow-2xl border border-border py-2 z-[110] animate-in fade-in slide-in-from-top-2 max-h-44 overflow-y-auto custom-scrollbar">
                  {periodOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setPeriod(opt.id);
                        setIsPeriodDropdownOpen(false);
                      }}
                      className="w-full text-left pl-6 pr-4 py-2 text-[9px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary flex items-center justify-between"
                    >
                      {opt.label}
                      {period === opt.id && <Check size={14} className="text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {period === 'custom' && (
              <div className="flex items-center gap-2">
                <input type="date" value={customDates.start} onChange={e => setCustomDates({...customDates, start: e.target.value})} className="bg-background border border-border text-[11px] rounded-md px-2.5 py-1.5 outline-none text-textMain" />
                <span className="text-[11px] text-textMain/50">to</span>
                <input type="date" value={customDates.end} onChange={e => setCustomDates({...customDates, end: e.target.value})} className="bg-background border border-border text-[11px] rounded-md px-2.5 py-1.5 outline-none text-textMain" />
              </div>
            )}

            {period === 'specific_month' && (
              <div className="flex items-center gap-2">
                <input type="month" value={specificMonth} onChange={e => setSpecificMonth(e.target.value)} className="bg-background border border-border text-[11px] rounded-md px-2.5 py-1.5 outline-none text-textMain" />
              </div>
            )}

            {period === 'specific_year' && (
              <div className="flex items-center gap-2">
                <select value={specificYear} onChange={e => setSpecificYear(e.target.value)} className="bg-background border border-border text-[11px] rounded-md px-2.5 py-1.5 outline-none text-textMain cursor-pointer">
                  {Array.from({ length: 11 }, (_, i) => 2024 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:border-l border-border lg:pl-4">
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button 
                type="button"
                onClick={() => {
                  setIsCompareDropdownOpen(!isCompareDropdownOpen);
                  setIsPeriodDropdownOpen(false);
                }}
                className="bg-card border border-border text-primary hover:bg-primary/10 transition-all duration-300 w-full sm:w-auto px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 md:min-w-[180px] justify-between shadow-md active:scale-95"
              >
                <span className="truncate uppercase text-[9px] md:text-[10px] tracking-widest">
                  {compareOptions.find(o => o.id === compareType)?.label || 'Compare'}
                </span>
                <ChevronDown size={16} className={`transition-transform duration-300 ${isCompareDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCompareDropdownOpen && (
                <div className="absolute top-full mt-2 w-full bg-card rounded-2xl shadow-2xl border border-border py-2 z-[110] animate-in fade-in slide-in-from-top-2 max-h-44 overflow-y-auto custom-scrollbar">
                  {compareOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setCompareType(opt.id);
                        setIsCompareDropdownOpen(false);
                      }}
                      className="w-full text-left pl-6 pr-4 py-2 text-[9px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary flex items-center justify-between"
                    >
                      {opt.label}
                      {compareType === opt.id && <Check size={14} className="text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {compareType === 'custom' && (
              <div className="flex items-center gap-2">
                <input type="date" value={compareDates.start} onChange={e => setCompareDates({...compareDates, start: e.target.value})} className="bg-background border border-border text-[11px] rounded-md px-2.5 py-1.5 outline-none text-textMain" />
                <span className="text-[11px] text-textMain/50">to</span>
                <input type="date" value={compareDates.end} onChange={e => setCompareDates({...compareDates, end: e.target.value})} className="bg-background border border-border text-[11px] rounded-md px-2.5 py-1.5 outline-none text-textMain" />
              </div>
            )}

            {compareType === 'specific_month' && (
              <div className="flex items-center gap-2">
                <input type="month" value={compareMonth} onChange={e => setCompareMonth(e.target.value)} className="bg-background border border-border text-[11px] rounded-md px-2.5 py-1.5 outline-none text-textMain" />
              </div>
            )}

            {compareType === 'specific_year' && (
              <div className="flex items-center gap-2">
                <select value={compareYear} onChange={e => setCompareYear(e.target.value)} className="bg-background border border-border text-[11px] rounded-md px-2.5 py-1.5 outline-none text-textMain cursor-pointer">
                  <option value="">Select Year</option>
                  {Array.from({ length: 11 }, (_, i) => 2024 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Comparison Export Buttons */}
          <div className="flex flex-wrap items-center gap-3 lg:ml-auto lg:border-l border-border lg:pl-4">
             <button onClick={() =>
    handleSmartReportDownload(
      salesPrintRef,
      handlePrintSales,
      `SalesReport_${period}_${dateStamp}.pdf`
    )
  } className="flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-primary border border-primary transition-all duration-300 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-primary hover:text-black w-full sm:w-auto">
               <FileText size={14} /> Sales Comparison
             </button>
             <button onClick={() =>
    handleSmartReportDownload(
      ordersPrintRef,
      handlePrintOrders,
      `OrdersReport_${period}_${dateStamp}.pdf`
    )
  } className="flex items-center justify-center gap-2 px-4 py-2.5 bg-card text-textMain border border-border transition-all duration-300 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-sm hover:border-primary hover:text-primary w-full sm:w-auto">
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
              <h3 className="text-2xl md:text-3xl font-black text-textMain mb-1 tracking-tighter">LKR {metrics.sales.current.toLocaleString()}</h3>
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
              <h3 className="text-2xl md:text-3xl font-black text-textMain mb-1 tracking-tighter">{metrics.orders.current}</h3>
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
              <h3 className="text-2xl md:text-3xl font-black text-textMain mb-1 tracking-tighter">{metrics.customers}</h3>
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
                 <button onClick={() =>
    handleSmartReportDownload(
      trendingPrintRef,
      handlePrintTrending,
      `TrendingProducts_${period}_${dateStamp}.pdf`
    )
  } className="text-[10px] uppercase font-bold text-textMain/50 hover:text-primary transition-colors flex items-center gap-1"><Printer size={14}/> Export</button>
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
                 <button onClick={() =>
    handleSmartReportDownload(
      performersPrintRef,
      handlePrintPerformers,
      `TopPerformers_${period}_${dateStamp}.pdf`
    )
  } className="text-[10px] uppercase font-bold text-textMain/50 hover:text-primary transition-colors flex items-center gap-1"><Printer size={14}/> Export</button>
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
                      <ReportTable orders={ordersForExport} exportMode />
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