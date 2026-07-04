import React, { useState, useEffect, useRef } from 'react';
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import { useReactToPrint } from 'react-to-print';
import api from '../../../api/axiosInstance'; // 👈 Centralized API Instance
import { toast } from 'react-hot-toast';
import { FileDown, FileText, Loader2, User, FileSpreadsheet } from 'lucide-react';
import ReportFilters from '../../../components/ReportFilters';
import ReportMetrics from '../../../components/ReportMetrics';
import ReportTable from '../../../components/ReportTable';
import { useAuth } from '../../../pages/context/AuthContext';

const SalesReport = () => {
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('monthly');
  const [orders, setOrders] = useState([]);
  const [dates, setDates] = useState({ startDate: new Date().toISOString().slice(0, 10), endDate: '' });
  const { user } = useAuth(); // Get current user
  const [systemSettings, setSystemSettings] = useState(null); // For logo
  const printComponentRef = useRef(null); // Ref for printable component
  const wrapperRef = useRef(null); // Ref for scaling wrapper
  const [fontScale, setFontScale] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // Default: මේ මාසය ("2026-05")
  const [selectedRepId, setSelectedRepId] = useState(''); // සිලෙක්ට් කරන Sales Rep ගේ ID එක

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
        } else if (filterType === 'monthly' && dates.startDate) {
            queryStr += `&startDate=${dates.startDate.substring(0, 7)}`;
        } else if (filterType === 'yearly' && dates.startDate) {
            queryStr += `&startDate=${dates.startDate.substring(0, 4)}-01-01`;
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
    if (filterType === 'monthly' && dates.startDate) {
        setSelectedMonth(dates.startDate.substring(0, 7));
    }
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

  // 📊 QuickBooks (QB) CSV Export Generator
  const handleDownloadQB = () => {
    if (orders.length === 0) return;

    // QuickBooks Data Map Headers
    const headers = [
      "InvoiceNumber", "CustomerName", "Date", 
      "ItemName", "ItemDescription", "Quantity", "Rate", "Amount"
    ];

    const csvRows = [headers.join(",")];

    orders.forEach(order => {
      const invoiceNo = `ORD-${order.order_id.substring(0, 8).toUpperCase()}`;
      const customer = `"${order.customer?.saloon_name || order.customer_name || 'Direct Customer'}"`;
      const date = new Date(order.created_at || order.createdAt).toLocaleDateString('en-US'); // MM/DD/YYYY is standard for QB

      // Map all items
      const items = order.items || order.OrderItems || [];
      items.forEach(item => {
        const itemName = `"${item.variant?.product?.name || 'Item'} - ${item.variant?.variant_name || 'Std'}"`;
        const desc = `"${item.variant?.product?.name || 'Product'}"`;
        const qty = item.quantity || item.qty || 0;
        const rate = item.price || 0;
        const amount = qty * rate;
        csvRows.push([invoiceNo, customer, date, itemName, desc, qty, rate, amount].join(","));
      });

      // Add Discount as a separate line item (Negative Amount) to balance the total in QB
      const discountAmt = Number(order.discount_amount || 0);
      if (discountAmt > 0) {
        csvRows.push([invoiceNo, customer, date, '"Discount"', '"Order Discount"', 1, -discountAmt, -discountAmt].join(","));
      }
    });

    // Generate and Download the CSV File
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `QuickBooks_Export_${filterType}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QuickBooks CSV exported successfully!");
  };

  // ️ PDF Trigger Mechanism using react-to-print v3 API.
  // The `contentRef` prop is used as per the latest API specification,
  // which directly takes the ref object instead of a function.
  const handlePrintPDF = useReactToPrint({
  contentRef: printComponentRef,
  documentTitle: `SalesReport_${filterType}_${new Date().toISOString().slice(0, 10)}`,
});

const waitForPaint = () =>
  new Promise((resolve) => requestAnimationFrame(resolve));

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const isMobilePdfDevice = () => {
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

      .pdf-export-capture.print-root-wrapper,
      .pdf-export-capture .quotation-container {
        width: 1120px !important;
        max-width: 1120px !important;
        font-size: 16px !important;
        transform: none !important;
        box-shadow: none !important;
        overflow: visible !important;
      }

      .pdf-export-capture .mehera-print-footer,
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

    const quotationContainer = clonedElement.querySelector(".quotation-container");
    if (quotationContainer) {
      quotationContainer.style.setProperty("width", "1120px", "important");
      quotationContainer.style.setProperty("max-width", "1120px", "important");
      quotationContainer.style.setProperty("font-size", "16px", "important");
      quotationContainer.style.setProperty("transform", "none", "important");
      quotationContainer.style.setProperty("box-shadow", "none", "important");
      quotationContainer.style.setProperty("overflow", "visible", "important");
    }

    sandbox.appendChild(exportStyle);
    sandbox.appendChild(clonedElement);
    document.body.appendChild(sandbox);

    // Remove desktop fixed print footer and print spacer from mobile PDF clone
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

    // Remove normal screen footer; mobile PDF footer will be drawn by jsPDF
    clonedElement
      .querySelectorAll(".mehera-print-footer")
      .forEach((el) => el.remove());

    // Remove pagination / modal / mobile cards
    clonedElement
      .querySelectorAll(
        ".report-pagination-controls, .report-order-modal, [data-export-hide='true']"
      )
      .forEach((el) => el.remove());

    clonedElement
      .querySelectorAll(".report-table-mobile")
      .forEach((el) => el.remove());

    // Force desktop report table in mobile PDF
    clonedElement.querySelectorAll(".report-table-desktop").forEach((el) => {
      el.style.setProperty("display", "block", "important");
      el.style.setProperty("overflow", "visible", "important");
      el.style.setProperty("width", "100%", "important");
    });

    // Force all table rows visible
    clonedElement.querySelectorAll("tbody tr").forEach((row) => {
      row.classList.remove("hidden");
      row.classList.add("report-table-row");
      row.setAttribute("data-pdf-row", "true");
      row.style.setProperty("display", "table-row", "important");
      row.style.setProperty("break-inside", "avoid", "important");
      row.style.setProperty("page-break-inside", "avoid", "important");
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

    const captureHeightCss = Math.ceil(contentBottom + 4);
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

    const isBlankSlice = (sourceY, sourceHeight) => {
      if (sourceHeight <= 20) return true;

      const sampleCanvas = document.createElement("canvas");
      const sampleWidth = 80;
      const sampleHeight = Math.min(
        120,
        Math.max(20, Math.floor(sourceHeight / 12))
      );

      sampleCanvas.width = sampleWidth;
      sampleCanvas.height = sampleHeight;

      const sampleCtx = sampleCanvas.getContext("2d", {
        willReadFrequently: true,
      });

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

      const pixels = sampleCtx.getImageData(
        0,
        0,
        sampleWidth,
        sampleHeight
      ).data;

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

      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, signatureY, pdfWidth, signatureAreaHeight, "F");

      pdf.setDrawColor(230, 230, 230);
      pdf.setLineWidth(0.5);
      pdf.line(0, signatureY, pdfWidth, signatureY);

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
        endY = Math.min(desiredEndY, canvas.height);
      }

      return endY;
    };

    let startY = 0;
    let isFirstPage = true;
    let footerDrawn = false;

    while (startY < canvas.height - 2) {
      const remaining = canvas.height - startY;

      // Final page: remaining content is placed above final footer.
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

      const desiredEndY = startY + pageCanvasHeight;
      const endY = findSafeEndY(startY, desiredEndY);
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

const handleDownloadPDF = async () => {
  if (orders.length === 0) {
    toast.error("No data available to export.");
    return;
  }

  const filename = `SalesReport_${filterType}_${new Date()
    .toISOString()
    .slice(0, 10)}.pdf`;

  if (isMobilePdfDevice()) {
    await downloadReportAsPdf(printComponentRef.current, filename);
  } else {
    handlePrintPDF();
  }
};

  return (
    <div ref={wrapperRef} className="w-full max-w-[72rem] mx-auto relative animate-in fade-in duration-500 px-4 md:px-6 py-4 md:py-6 min-h-0 overflow-x-hidden">
      
      {/* --- SCREEN VIEW (This part is hidden during print) --- */}
      <div className="print:hidden flex flex-col gap-6">
        {/* Header Panel */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
          <div>
            <h2 className="text-2xl font-bold text-textMain transition-colors duration-300 flex items-center gap-3">
              <div className="p-2 bg-primary transition-all duration-300 rounded-lg text-textMain transition-colors duration-300">
                <FileText size={24} />
              </div>
              Executive Sales Ledger
            </h2>
            <p className="text-textMain/50 transition-colors duration-300 text-sm mt-1 ml-12">
              Compile certified accounting documentation for Mehera International distribution loops.
            </p>
          </div>
          
          {/* Export Button Actions */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownloadQB}
              disabled={orders.length === 0}
              className="bg-[#2ca01c] transition-all duration-300 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#2ca01c]/20 hover:bg-[#238016] hover:scale-105 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet size={18} /> Export QB
            </button>
            <button 
              onClick={handleDownloadPDF}
              disabled={orders.length === 0}
              className="bg-primary transition-all duration-300 text-textMain transition-colors duration-300 px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#b4a460]/20 hover:bg-[#9a8b50] hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FileDown size={18} /> Export PDF
            </button>
          </div>
        </div>

        {/* Filter Layer - Sticky on Mobile for quick access */}
        <div className="sticky md:static top-[80px] md:top-auto z-40 md:z-auto py-2 md:py-0 bg-background/95 backdrop-blur-xl border-b border-border/40 md:border-none md:bg-transparent md:backdrop-blur-none -mx-4 px-4 md:mx-0 md:px-0 transition-all duration-300 mb-6">
          <ReportFilters 
            filterType={filterType} setFilterType={setFilterType} 
            dates={dates} setDates={setDates} 
          />
        </div>

        {loading ? (
          <div className="py-12 text-center flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-sm text-textMain/50 font-bold tracking-widest uppercase">Compiling Node Documents...</p>
          </div>
        ) : (
          /* Screen Report View */
          <div className="bg-card border border-border rounded-[2rem] shadow-sm p-4 md:p-8 lg:p-12 space-y-6 md:space-y-8 transition-colors duration-300">
            {/* Header Metadata inside the printable area */}
            <div className="border-b border-border transition-colors duration-300 pb-6 flex justify-between items-end">
              <div>
                <h2 className="text-xl font-bold text-textMain transition-colors duration-300">MEHERA INTERNATIONAL (PVT) LTD</h2>
                <p className="text-xs uppercase tracking-widest font-black text-primary transition-all duration-300 mt-1">Official Distribution Audit Report</p>
              </div>
              <div className="text-right text-xs text-textMain/50 transition-colors duration-300 font-bold">
                <p>Generated: {new Date().toLocaleDateString('en-GB')}</p>
                <p className="uppercase tracking-widest font-black text-[10px] mt-1">Scope: {filterType}</p>
              </div>
            </div>

            {/* Metrics Layer */}
            <ReportMetrics 
              orders={orders}
              selectedMonth={selectedMonth}  // 👈 උඹ පාවිච්චි කරන ස්ටේට් නම දාන්න (Format: "2026-05")
              selectedRepId={selectedRepId}  // 👈 සිලෙක්ට් කරලා ඉන්න රෙප්ගේ ID එක
              token={user?.token || localStorage.getItem('token')} 
             />

            {/* Table Data Matrix */}
            {orders.length > 0 ? (
              <ReportTable orders={orders} />
            ) : (
              <div className="py-12 text-center text-textMain/40 transition-colors duration-300 font-bold italic text-sm uppercase">
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
          <div className="p-[2.5em] space-y-[2rem]">
            <ReportMetrics orders={orders} />
            {orders.length > 0 ? (
              <div className="mehera-table-print-fix">
                <ReportTable orders={orders} exportMode />
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