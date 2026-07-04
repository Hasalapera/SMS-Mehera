import React, { useRef, useState, useEffect} from "react";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import {
  Download,
  ArrowLeft,
  Phone,
  MapPin,
  Hash,
  Calendar,
  ShoppingCart,
  User,
  ClipboardList,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axiosInstance";
import { toast } from "react-hot-toast";
import { useAuth } from "../../pages/context/AuthContext";

const Quotation = () => {
  const componentRef = useRef(null);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); // ලොග් වෙලා ඉන්න යූසර්ගේ විස්තර ගන්නවා
  const [fontScale, setFontScale] = useState(1);
  const [systemSettings, setSystemSettings] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const orderData = location.state?.order;

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await api.get('/settings/public');
        setSystemSettings(res.data);
      } catch (err) {
        console.error("Quotation branding fetch failed:", err);
      }
    };
    fetchBranding();
  }, []);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // quotation ID generation Function (Format: YYYYMMDDHHMM + OrderID Prefix)
  const generateQuotationId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hour = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");

    // Last 2 digits — order_id එකේ පළමු අක්ෂර 2 (unique වෙන්න)
    const suffix = orderData?.order_id?.substring(0, 2).toUpperCase() || "XX";

    return `${year}${month}${day}${hour}${min}${suffix}`;
  };

  const quotationId = generateQuotationId();

  // --- Font Scaling Logic for Mobile ---
  useEffect(() => {
    const handleFontScale = () => {
      if (wrapperRef.current) {
        const availableWidth = wrapperRef.current.offsetWidth;
        const designWidth = 800; // Original Width

        if (availableWidth < designWidth) {
          // අකුරු පොඩි විය යුතු අනුපාතය ගණනය කරයි
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
  }, [orderData]);


  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Quotation_${orderData?.order_id || "Mehera"}`,
  });

  const formatMoney = (value) => {
    const number = Number(value) || 0;
    return `LKR ${number.toLocaleString("en-LK")}`;
  };

  const getItemInfo = (item) => {
    const qty = Number(
      item?.qty ??
      item?.quantity ??
      item?.order_qty ??
      item?.OrderItem?.qty ??
      item?.OrderItem?.quantity ??
      0
    );

    const price = Number(
      item?.price ??
      item?.unit_price ??
      item?.selling_price ??
      item?.variant?.price ??
      item?.Variant?.price ??
      0
    );

    const productName =
      item?.variant?.product?.product_name ||
      item?.Variant?.Product?.product_name ||
      item?.product?.product_name ||
      item?.Product?.product_name ||
      item?.product_name ||
      item?.name ||
      "Stock Item";

    const variantName =
      item?.variant?.variant_name ||
      item?.Variant?.variant_name ||
      item?.variant_name ||
      item?.shade_no ||
      item?.shade ||
      "Standard";

    const refValue =
      item?.product_id ||
      item?.variant?.product_id ||
      item?.Variant?.product_id ||
      item?.variant_id ||
      item?.id ||
      "N/A";

    return {
      ref: String(refValue).substring(0, 8).toUpperCase(),
      productName,
      variantName,
      qty,
      price,
      amount: qty * price,
    };
  };

  const imageUrlToDataUrl = async (url) => {
    if (!url) return null;

    try {
      const response = await fetch(url, { mode: "cors" });
      if (!response.ok) return null;

      const blob = await response.blob();

      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn("Logo could not be loaded for PDF:", error);
      return null;
    }
  };

  const addContainedImage = (pdf, imageData, x, y, maxW, maxH) => {
    if (!imageData) return false;

    try {
      const props = pdf.getImageProperties(imageData);
      const ratio = Math.min(maxW / props.width, maxH / props.height);
      const imgW = props.width * ratio;
      const imgH = props.height * ratio;
      pdf.addImage(imageData, props.fileType || "PNG", x, y, imgW, imgH);
      return true;
    } catch (error) {
      console.warn("PDF logo render failed:", error);
      return false;
    }
  };

  const handleDownloadPdf = async () => {
    if (!orderData) {
      toast.error("Quotation data not found.");
      return;
    }

    const toastId = toast.loading("Generating quotation PDF...");

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 34;
      const contentWidth = pageWidth - margin * 2;

      // Screenshot-matched brand colors. These are RGB/hex-safe for jsPDF.
      const gold = [180, 164, 96];
      const goldDark = [150, 134, 70];
      const goldSoft = [248, 245, 232];
      const black = [0, 0, 0];
      const darkTitle = [20, 20, 20];
      const text = [22, 24, 30];
      const muted = [105, 108, 116];
      const lightMuted = [150, 153, 160];
      const border = [226, 228, 232];
      const softBorder = [238, 239, 242];
      const pageBg = [250, 250, 249];
      const white = [255, 255, 255];
      const sectionBg = [248, 248, 247];
      const danger = [220, 38, 38];

      const setFill = (color) => pdf.setFillColor(color[0], color[1], color[2]);
      const setDraw = (color) => pdf.setDrawColor(color[0], color[1], color[2]);
      const setText = (color) => pdf.setTextColor(color[0], color[1], color[2]);

      const logoData = await imageUrlToDataUrl(systemSettings?.dark_logo_url);

      const customerName =
        orderData.customer?.saloon_name ||
        orderData.customer_name ||
        "Walk-in Customer";

      const customerAddress =
        orderData.customer?.district ||
        orderData.shipping_address ||
        orderData.district ||
        "Unspecified";

      const createdByName = orderData.creator?.name || "System Record";
      const createdByRole = orderData.creator?.role?.replace("_", " ") || "Authorized Staff";
      const issuedByName = user?.name || user?.full_name || "Guest Access";
      const issuedByRole = user?.role?.replace("_", " ") || "External Auth";

      const normalizedItems = itemsList.map(getItemInfo);
      const calculatedSubTotal = normalizedItems.reduce((sum, item) => sum + item.amount, 0);
      const pdfSubTotal = Number(orderData.subtotal) || calculatedSubTotal;
      const pdfDiscountAmount = Number(orderData.discount_amount) || 0;
      const pdfDiscountPercentage = Number(orderData.discount_percentage) || 0;
      const pdfNetTotal = Number(orderData.total_amount) || Math.max(0, pdfSubTotal - pdfDiscountAmount);

      const drawLabel = (label, x, y, align = "left") => {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(6.4);
        setText(muted);
        pdf.text(String(label).toUpperCase(), x, y, {
          align,
          charSpace: 1.6,
        });
      };

      const drawGoldText = (label, x, y, align = "left") => {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(6.4);
        setText(gold);
        pdf.text(String(label).toUpperCase(), x, y, {
          align,
          charSpace: 1.5,
        });
      };

      const drawSoftCard = (x, y, w, h, r = 14) => {
        setFill([242, 242, 240]);
        pdf.roundedRect(x + 1.4, y + 1.8, w, h, r, r, "F");
        setFill(white);
        setDraw(border);
        pdf.setLineWidth(0.6);
        pdf.roundedRect(x, y, w, h, r, r, "FD");
      };

      const drawPersonIcon = (x, y, size = 29, dark = true) => {
        setFill(dark ? black : goldSoft);
        pdf.circle(x, y, size / 2, "F");
        pdf.setLineWidth(0.7);
        setDraw(gold);
        pdf.circle(x, y - 3, 3.2, "S");
        pdf.line(x, y + 2, x, y + 6.4);
        pdf.ellipse(x, y + 8, 6, 3, "S");
      };

      const drawClipboardIcon = (x, y) => {
        setDraw(gold);
        pdf.setLineWidth(0.7);
        pdf.roundedRect(x - 4, y - 6, 8, 10, 1.5, 1.5, "S");
        pdf.line(x - 2.5, y - 2, x + 2.5, y - 2);
        pdf.line(x - 2.5, y + 1.5, x + 2.5, y + 1.5);
      };

      const drawSmallCartIcon = (x, y) => {
        setDraw(gold);
        pdf.setLineWidth(0.8);
        pdf.line(x - 5, y - 5, x - 3, y + 1);
        pdf.line(x - 3, y + 1, x + 6, y + 1);
        pdf.line(x - 1.5, y + 1, x - 0.5, y + 5);
        pdf.line(x + 5, y + 1, x + 4, y + 5);
        pdf.circle(x, y + 7, 1.2, "S");
        pdf.circle(x + 6, y + 7, 1.2, "S");
      };

      const drawPageBg = () => {
        setFill(pageBg);
        pdf.rect(0, 0, pageWidth, pageHeight, "F");
      };

      const drawFooter = (pageNo, totalPages) => {
        // Clean black footer strip. Kept compact so the signature section can fit on page 1.
        setFill(black);
        pdf.rect(0, pageHeight - 30, pageWidth, 30, "F");

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(5.2);
        pdf.setTextColor(105, 108, 116);
        pdf.text(
          "C L O U D   R E G I S T R Y   S Y S T E M   •   M E H E R A   I N T E R N A T I O N A L   •   2 0 2 6",
          pageWidth / 2,
          pageHeight - 14,
          { align: "center" }
        );

        if (totalPages > 1) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(5.8);
          pdf.setTextColor(120, 120, 120);
          pdf.text(`Page ${pageNo} of ${totalPages}`, pageWidth - margin, pageHeight - 14, {
            align: "right",
          });
        }
      };

      const drawHeader = () => {
        drawPageBg();

        setFill(black);
        pdf.rect(0, 0, pageWidth, 132, "F");

        // Very subtle gold glow on the right, like the reference image.
        setFill([28, 27, 18]);
        pdf.circle(pageWidth + 30, 10, 125, "F");

        const logoAdded = addContainedImage(pdf, logoData, margin, 35, 98, 34);
        if (!logoAdded) {
          pdf.setFont("times", "bold");
          pdf.setFontSize(20);
          pdf.setTextColor(255, 255, 255);
          pdf.text("Mehera", margin, 49);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(5.8);
          pdf.setTextColor(255, 255, 255);
          pdf.text("INTERNATIONAL (PVT) LTD", margin + 2, 61);
        }

        // Left contact information.
        setDraw(gold);
        pdf.setLineWidth(0.8);
        pdf.circle(margin + 5, 81, 3.6, "S");
        pdf.line(margin + 5, 84.5, margin + 5, 89);
        pdf.circle(margin + 5, 89.5, 1.3, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(6.7);
        pdf.setTextColor(245, 245, 245);
        pdf.text("NO 182, KURUPPUMULLA ROAD, PANADURA", margin + 17, 84, { charSpace: 1 });

        pdf.setLineWidth(0.8);
        pdf.line(margin + 2, 101, margin + 8, 107);
        pdf.line(margin + 8, 101, margin + 2, 107);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(6.7);
        pdf.setTextColor(245, 245, 245);
        pdf.text("0707 577 500 / 502", margin + 17, 106, { charSpace: 1 });

        // Right title block: dark subtle QUOTATION word exactly like reference.
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(35);
        pdf.setTextColor(darkTitle[0], darkTitle[1], darkTitle[2]);
        pdf.text("QUOTATION", pageWidth - margin, 61, { align: "right" });

        drawGoldText("Quotation ID", pageWidth - margin, 88, "right");

        pdf.setFont("helvetica", "bolditalic");
        pdf.setFontSize(15);
        pdf.setTextColor(255, 255, 255);
        pdf.text(`#${quotationId}`, pageWidth - margin, 108, { align: "right" });

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(5.8);
        pdf.setTextColor(20, 20, 20);
        pdf.text(`Generated Date: ${new Date().toLocaleDateString("en-GB")}`, pageWidth - margin, 124, { align: "right" });
      };

      const drawContinuedHeader = () => {
        drawPageBg();
        setFill(black);
        pdf.rect(0, 0, pageWidth, 50, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(13);
        pdf.setTextColor(255, 255, 255);
        pdf.text("MEHERA", margin, 31);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(5.8);
        setText(gold);
        pdf.text(`QUOTATION #${quotationId} • CONTINUED`, pageWidth - margin, 31, {
          align: "right",
          charSpace: 1.2,
          maxWidth: 360,
        });
        return 74;
      };

      const drawInfoArea = () => {
        let y = 163;

        // Bill-to card.
        drawSoftCard(margin, y, contentWidth, 68, 13);
        drawLabel("Quotation For / Bill To:", margin + 16, y + 25);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10.5);
        setText(text);
        pdf.text(String(customerName).toUpperCase(), margin + 16, y + 41, { maxWidth: contentWidth - 95 });
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(6.7);
        setText(muted);
        pdf.text(String(customerAddress).toUpperCase(), margin + 16, y + 55, { charSpace: 1.5, maxWidth: contentWidth - 95 });

        setFill(goldSoft);
        pdf.roundedRect(pageWidth - margin - 49, y + 18, 34, 34, 8, 8, "F");
        drawPersonIcon(pageWidth - margin - 32, y + 36, 16, false);

        y += 91;
        setDraw(softBorder);
        pdf.setLineWidth(0.8);
        pdf.line(margin, y, pageWidth - margin, y);

        y += 31;
        drawSmallCartIcon(margin + 5, y - 2);
        drawLabel("Original Entry By:", margin + 20, y);
        // Keep the icon outside the text area so it does not touch/overlap the label.
        drawClipboardIcon(pageWidth - margin - 5, y - 1);
        drawLabel("Quotation Issued By:", pageWidth - margin - 30, y, "right");

        y += 13;
        const cardW = 255;
        const cardH = 43;
        const rightX = pageWidth - margin - cardW;
        drawSoftCard(margin, y, cardW, cardH, 12);
        drawSoftCard(rightX, y, cardW, cardH, 12);

        drawPersonIcon(margin + 22, y + 22, 28, true);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7.4);
        setText(text);
        pdf.text(String(createdByName).toUpperCase(), margin + 42, y + 21, { maxWidth: cardW - 55 });
        pdf.setFont("helvetica", "bolditalic");
        pdf.setFontSize(5.7);
        setText(gold);
        pdf.text(`Role: ${createdByRole}`.toUpperCase(), margin + 42, y + 32, { maxWidth: cardW - 55 });

        // Issued-by card is right aligned, matching the screenshot.
        drawPersonIcon(rightX + cardW - 22, y + 22, 28, true);
        const rightTextX = rightX + cardW - 42;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7.4);
        setText(text);
        pdf.text(String(issuedByName).toUpperCase(), rightTextX, y + 21, { align: "right", maxWidth: cardW - 55 });
        pdf.setFont("helvetica", "bolditalic");
        pdf.setFontSize(5.7);
        setText(gold);
        pdf.text(`Current Session: ${issuedByRole}`.toUpperCase(), rightTextX, y + 32, { align: "right", maxWidth: cardW - 55 });

        return y + cardH + 39;
      };

      const columns = {
        ref: margin,
        desc: margin + 89,
        qty: margin + 333,
        unit: margin + 438,
        amount: pageWidth - margin,
      };

      const drawTableHeader = (y) => {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(6.5);
        setText(muted);
        pdf.text("ITEM REF", columns.ref, y, { charSpace: 0.4 });
        setText(text);
        pdf.text("DESCRIPTION / VARIANT", columns.desc, y, { charSpace: 0.2 });
        pdf.text("QTY", columns.qty, y, { align: "center" });
        pdf.text("UNIT PRICE", columns.unit, y, { align: "right" });
        pdf.text("AMOUNT", columns.amount, y, { align: "right" });

        setDraw(text);
        pdf.setLineWidth(1.1);
        pdf.line(margin, y + 14, pageWidth - margin, y + 14);
        return y + 34;
      };

      const ensureSpace = (requiredHeight, y, includeTableHeader = false) => {
        // Footer starts at pageHeight - 30, so keep a small safety gap above it.
        const bottomLimit = pageHeight - 42;
        if (y + requiredHeight <= bottomLimit) return y;

        pdf.addPage();
        let nextY = drawContinuedHeader();
        if (includeTableHeader) nextY = drawTableHeader(nextY);
        return nextY;
      };

      drawHeader();
      let y = drawInfoArea();
      y = drawTableHeader(y);

      if (normalizedItems.length === 0) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        setText(muted);
        pdf.text("No items found for this quotation.", pageWidth / 2, y + 35, { align: "center" });
        y += 76;
      } else {
        normalizedItems.forEach((item, index) => {
          const productLines = pdf.splitTextToSize(String(item.productName).toUpperCase(), 230);
          const variantLines = pdf.splitTextToSize(`VARIANT: ${item.variantName}`, 230);
          const rowHeight = Math.max(52, productLines.length * 11 + variantLines.length * 8 + 24);

          y = ensureSpace(rowHeight, y, true);

          if (index > 0) {
            setDraw(softBorder);
            pdf.setLineWidth(0.7);
            pdf.line(margin, y - 3, pageWidth - margin, y - 3);
          }

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(8.3);
          setText(goldDark);
          pdf.text(`#${item.ref || "N/A"}`, columns.ref, y + 21);

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(8.4);
          setText(text);
          pdf.text(productLines, columns.desc, y + 16);

          pdf.setFont("helvetica", "bolditalic");
          pdf.setFontSize(6.6);
          setText(muted);
          pdf.text(variantLines, columns.desc, y + 30 + (productLines.length - 1) * 9);

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(8.4);
          setText(text);
          pdf.text(String(item.qty), columns.qty, y + 22, { align: "center" });

          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(7.7);
          setText(muted);
          pdf.text(formatMoney(item.price), columns.unit, y + 22, { align: "right" });

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(8.4);
          setText(text);
          pdf.text(formatMoney(item.amount), columns.amount, y + 22, { align: "right" });

          y += rowHeight;
        });
      }

      // In the reference screenshot, a short order leaves a clean large table area.
      if (pdf.internal.getNumberOfPages() === 1) {
        y = Math.max(y, 570);
      }

      // Keep terms, totals, bank details, and signature together when possible.
      // This prevents a short quotation from pushing only the signature/bank area to page 2.
      const termsHeight = 112;
      const bankSectionHeight = 92;
      const combinedClosingHeight = termsHeight + bankSectionHeight;
      y = ensureSpace(combinedClosingHeight, y + 10, false);

      // Terms + totals section.
      setFill(sectionBg);
      setDraw(softBorder);
      pdf.rect(0, y, pageWidth, termsHeight, "FD");

      const termsX = margin;
      const termsY = y + 34;
      drawGoldText("Official Terms:", termsX, termsY);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(5.8);
      setText(muted);
      const termsLines = pdf.splitTextToSize(
        "• Quotation valid for 30 days. Prices are subject to stock availability. Please settle payments to the bank details provided.",
        250
      );
      pdf.text(termsLines.map((line) => line.toUpperCase()), termsX, termsY + 15, {
        lineHeightFactor: 1.35,
      });

      const totalsX = pageWidth - margin - 190;
      const totalsRight = pageWidth - margin;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6.8);
      setText(muted);
      pdf.text("GROSS SUB TOTAL", totalsX, y + 45, { charSpace: 0.5 });
      pdf.text(formatMoney(pdfSubTotal), totalsRight, y + 45, { align: "right" });

      let totalLineY = y + 60;
      if (pdfDiscountAmount > 0) {
        pdf.setTextColor(danger[0], danger[1], danger[2]);
        pdf.text(`DISCOUNT (${pdfDiscountPercentage}%)`, totalsX, totalLineY, { charSpace: 0.5 });
        pdf.text(`- ${formatMoney(pdfDiscountAmount)}`, totalsRight, totalLineY, { align: "right" });
        totalLineY += 14;
      }

      setDraw(text);
      pdf.setLineWidth(1.2);
      pdf.line(totalsX, totalLineY, totalsRight, totalLineY);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.2);
      setText(text);
      pdf.text("NET TOTAL", totalsX, totalLineY + 25);
      pdf.setFontSize(16);
      pdf.text(`Rs. ${pdfNetTotal.toLocaleString("en-LK")}`, totalsRight, totalLineY + 25, {
        align: "right",
      });

      y += termsHeight;

      // Bank + signature section - compact and aligned to stay above the footer.
      if (y + bankSectionHeight > pageHeight - 42) {
        pdf.addPage();
        y = drawContinuedHeader();
      }

      setFill(white);
      setDraw(softBorder);
      pdf.rect(0, y, pageWidth, bankSectionHeight, "FD");

      const bankX = margin;
      const bankY = y + 20;
      drawSoftCard(bankX, bankY, 245, 54, 12);
      drawGoldText("Bank Details", bankX + 16, bankY + 20);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.4);
      setText(text);
      pdf.text("MEHERA INTERNATIONAL (PVT) LTD", bankX + 16, bankY + 36);
      pdf.setFont("helvetica", "bolditalic");
      pdf.setFontSize(6.2);
      setText(muted);
      pdf.text("COMM. BANK • 1000429495 • PANADURA OFFICE", bankX + 16, bankY + 49);

      const signLeft = pageWidth - margin - 246;
      const signRight = pageWidth - margin;
      const signY = y + 48;
      setDraw(text);
      pdf.setLineWidth(0.8);
      pdf.line(signLeft, signY, signRight, signY);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6.7);
      setText(text);
      pdf.text("AUTHORIZED SIGNATURE", (signLeft + signRight) / 2, signY + 18, {
        align: "center",
        charSpace: 1.8,
      });
      pdf.setFont("helvetica", "bolditalic");
      pdf.setFontSize(5.5);
      setText(muted);
      pdf.text("REGISTRY STAMP REQUIRED", (signLeft + signRight) / 2, signY + 31, {
        align: "center",
        charSpace: 1.3,
      });

      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i += 1) {
        pdf.setPage(i);
        drawFooter(i, pageCount);
      }

      pdf.save(`Quotation_${orderData?.quotation_no || orderData?.order_id || "Mehera"}.pdf`);
      toast.success("Quotation PDF downloaded!", { id: toastId });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate quotation PDF.", { id: toastId });
    }
  };


  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-textMain">
        <div className="text-center">
          <p className="text-[0.625em] font-black uppercase tracking-[0.2em] text-red-500 italic">
            No Data Received from Registry
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-[0.5625em] font-black uppercase underline hover:text-primary"
          >
            Back 
          </button>
        </div>
      </div>
    );
  }

  const itemsList = orderData.OrderItems || orderData.items || [];

  //get values directly from backend
  const subTotal = Number(orderData.subtotal) || itemsList.reduce((sum, item) => {
    const itemInfo = getItemInfo(item);
    return sum + itemInfo.amount;
  }, 0);
  const discountVal = Number(orderData.discount_amount) || 0;
  const discountPercentage = Number(orderData.discount_percentage) || 0;
  const netTotal = Number(orderData.total_amount) || Math.max(0, subTotal - discountVal);

  return (
    <div className="min-h-screen bg-background text-textMain py-10 px-4 animate-in fade-in duration-500">
      {/* Action Bar */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-card border border-border rounded-xl text-xs font-black uppercase text-textMain/60 hover:text-textMain transition-all shadow-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={handleDownloadPdf}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-black text-[#b4a460] rounded-xl text-[0.625em] font-black uppercase tracking-widest hover:bg-[#b4a460] hover:text-white transition-all shadow-xl"
        >
          <Download size={16} /> Download Quotation PDF
        </button>
      </div>

      {/* Printable Quotation Wrapper -scroll when Mobile */}
      <div ref={wrapperRef} className="w-full max-w-4xl mx-auto flex justify-center print:!block print:!h-auto">
        <div
          ref={componentRef}
          className="quotation-container w-[800px] bg-card text-textMain shadow-2xl overflow-hidden print:shadow-none print:m-0 origin-top print:!transform-none print:!bg-white print:!text-black"
          style={{ 
            fontSize: `${fontScale * 16}px`, 
            width: '50em', 
          }}
        >
        {/* Header Section */}
        <div className="relative h-[11em] bg-black p-[2.5em] flex justify-between items-start text-white overflow-hidden print:bg-black">
          <div className="absolute top-0 right-0 w-[16em] h-[16em] bg-[#b4a460] rounded-full -mr-32 -mt-32 opacity-20 blur-2xl"></div>

          <div className="relative z-10 text-left">
            {systemSettings?.dark_logo_url ? (
              <img 
                src={systemSettings.dark_logo_url} 
                alt="Mehera International" 
                className="h-[2.5em] object-contain"
              />
            ) : (
              <>
                <h1 className="text-[1.875em] font-serif tracking-[0.3em] uppercase mb-1">Mehera</h1>
                <p className="text-[0.5625em] font-black tracking-[0.5em] text-primary uppercase">International</p>
              </>
            )}
            <div className="mt-[1.5em] space-y-1 text-[0.5625em] text-gray-300 print:text-gray-600 font-bold uppercase tracking-widest">
              <p className="flex items-center gap-2">
                <MapPin size={16 * fontScale} className="text-primary" /> No 182,
                Kuruppumulla Road, Panadura
              </p>
              <p className="flex items-center gap-2">
                <Phone size={14 * fontScale} className="text-primary" /> 0707 577 500 /
                502
              </p>
            </div>
          </div>

          <div className="text-right relative z-10">
            <h2 className="text-[3em] font-black uppercase tracking-tighter opacity-10 mb-2 leading-none">
              Quotation
            </h2>
            <div className="space-y-1">
              <p className="text-[0.5625em] font-black text-primary uppercase tracking-widest">
                Quotation ID
              </p>
              <p className="text-[1.125em] font-mono font-black italic tracking-tighter">
                #{quotationId}
              </p>
              <p className="text-[0.5625em] font-bold text-textMain/50 print:text-gray-500 mt-2">
                Generated Date: {new Date().toLocaleDateString("en-GB")}
              </p>
            </div>
          </div>
        </div>

        {/* Client & User Info */}
        <div className="p-[2.5em] border-b border-border bg-background/50 space-y-[1.5em]">
          
          {/* 1. Customer Info (Newly Added Without Breaking Styles) */}
          <div className="flex justify-between items-center bg-card p-[1.25em] rounded-[1.25rem] border border-border shadow-sm">
             <div>
                <h3 className="text-[0.5625em] font-black text-textMain/60 uppercase tracking-widest mb-[0.25em]">Quotation For / Bill To:</h3>
                <p className="text-[0.875em] font-black text-textMain uppercase">{orderData.customer?.saloon_name || orderData.customer_name || "Walk-in Customer"}</p>
                <p className="text-[0.5625em] text-textMain/60 font-bold uppercase tracking-widest mt-[0.25em]">
                   {orderData.customer?.district || orderData.shipping_address || orderData.district || "Unspecified Location"} 
                   {orderData.phone ? ` • ${orderData.phone}` : ''}
                </p>
             </div>
             <div className="p-[0.75em] bg-primary/10 rounded-xl text-primary">
                <User size={20 * fontScale} />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-[2.5em] pt-[1.5em] border-t border-border">
            {/* 1. Created By (The person who originally placed the order) */}
            <div className="space-y-3">
              <h3 className="text-[0.5625em] font-black text-textMain/60 uppercase tracking-widest flex items-center gap-2">
                <ShoppingCart size={14 * fontScale} className="text-primary" /> Original Entry By:
              </h3>
              <div className="flex items-center gap-3 bg-card p-3 rounded-2xl border border-border shadow-sm">
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-[#b4a460]">
                  <User size={14 * fontScale} />
                </div>
                <div>
                  <p className="text-[0.625em] font-black text-textMain uppercase leading-tight">
                    {orderData.creator?.name || "System Record"}
                  </p>
                  <p className="text-[0.5em] text-primary font-bold uppercase italic">
                    Role:{" "}
                    {orderData.creator?.role?.replace("_", " ") ||
                      "Authorized Staff"}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Issued By (The person who is currently generating the quotation) */}
            <div className="space-y-3 text-right">
              <h3 className="text-[0.5625em] font-black text-textMain/60 uppercase tracking-widest flex items-center gap-2 justify-end">
                Quotation Issued By: <ClipboardList size={14 * fontScale} className="text-primary" />
              </h3>
              <div className="flex items-center gap-3 bg-card p-3 rounded-2xl border border-border shadow-sm justify-end text-right">
                <div className="text-right flex-1">
                  <p className="text-[0.625em] font-black text-textMain uppercase leading-tight">
                    {user?.name || user?.full_name || "Guest Access"}
                  </p>
                  <p className="text-[0.5em] text-primary font-bold uppercase italic">
                    Current Session:{" "}
                    {user?.role?.replace("_", " ") || "External Auth"}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-[#b4a460]">
                  <User size={14 * fontScale} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="px-[2.5em] py-[2em] min-h-[350px]">
          <table className="w-full text-left table-fixed">
            <thead>
              <tr className="border-b-2 border-textMain print:border-black">
                <th className="py-3 w-2/12 text-[0.5625em] font-black uppercase text-textMain/60 print:text-gray-500">
                  Item Ref
                </th>
                <th className="py-3 w-5/12 text-[0.5625em] font-black uppercase text-textMain print:text-black">
                  Description / Variant
                </th>
                <th className="py-3 w-1/12 text-center text-[0.5625em] font-black uppercase text-textMain print:text-black">
                  Qty
                </th>
                <th className="py-3 w-2/12 text-right text-[0.5625em] font-black uppercase text-textMain print:text-black">
                  Unit Price
                </th>
                <th className="py-3 w-2/12 text-right text-[0.5625em] font-black uppercase text-textMain print:text-black">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {itemsList.map((item, idx) => {
                const itemInfo = getItemInfo(item);

                return (
                  <tr key={idx}>
                    <td className="py-[1.25em] text-[0.75em] font-mono font-black text-primary">
                      #{itemInfo.ref}
                    </td>
                    <td className="py-[1.25em]">
                      <p className="text-[0.6875em] font-black text-textMain print:text-black uppercase leading-none mb-1">
                        {itemInfo.productName}
                      </p>
                      <p className="text-[0.5625em] text-textMain/60 print:text-gray-500 font-bold uppercase tracking-tight italic">
                        Variant: {itemInfo.variantName}
                      </p>
                    </td>
                    <td className="py-[1.25em] text-center text-[0.6875em] font-black">
                      {itemInfo.qty}
                    </td>
                    <td className="py-[1.25em] text-right text-[0.625em] text-textMain/60 print:text-gray-500">
                      {formatMoney(itemInfo.price)}
                    </td>
                    <td className="py-[1.25em] text-right text-[0.6875em] font-black text-textMain print:text-black">
                      {formatMoney(itemInfo.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Calculation Section */}
        <div className="flex justify-between items-end p-[2.5em] bg-background border-t border-border">
          <div className="text-[0.5625em] font-bold text-textMain/60 print:text-gray-500 max-w-[18.75em] uppercase leading-relaxed text-left">
            <p className="mb-[0.25em] font-black text-primary">Official Terms:</p>
            <p>• Quotation valid for 30 days. Prices are subject to stock availability. Please settle payments to the bank details provided.</p>
        </div>
        
        <div className="w-[16em] flex flex-col gap-[0.5em]">
          {/* Gross Subtotal */}
          <div className="flex justify-between text-[0.625em] font-bold text-textMain/60 print:text-gray-600 uppercase">
            <span>Gross Sub Total</span>
            <span>LKR {subTotal.toLocaleString()}</span>
          </div>

          {/* discount*/}
          {discountVal > 0 && (
            <div className="flex justify-between text-[0.625em] font-bold text-red-500 uppercase">
              <span>Discount ({discountPercentage}%)</span>
              <span>- LKR {discountVal.toLocaleString()}</span>
            </div>
          )}

          {/* final payable amount */}
          <div className="flex justify-between items-center pt-[0.75em] border-t-2 border-textMain print:border-black">
            <span className="text-[0.6875em] font-black text-textMain print:text-black uppercase">Net Total</span>
            <span className="text-[1.25em] font-black text-textMain print:text-black tabular-nums">Rs. {netTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

        {/* Bank & Signature */}
        <div className="p-[2em] grid grid-cols-2 gap-[4em] text-left border-t border-border">
          <div className="p-[1.25em] bg-card print:bg-white border border-border print:border-gray-100 rounded-2xl">
            <h4 className="text-[0.5625em] font-black uppercase text-primary mb-2 tracking-widest">
              Bank Details
            </h4>
            <p className="text-[0.625em] font-black text-textMain print:text-black uppercase leading-tight">
              Mehera International (Pvt) Ltd
            </p>
            <p className="text-[0.625em] font-bold text-textMain/60 print:text-gray-500 uppercase mt-1 italic">
              Comm. Bank • 1000429495 • Panadura Office
            </p>
          </div>
          <div className="flex flex-col justify-center items-center pt-[1.5em]">
            <div className="w-full h-[1px] bg-textMain print:bg-black mb-2"></div>
            <p className="text-[0.5625em] font-black uppercase tracking-widest text-textMain print:text-black">
              Authorized Signature
            </p>
            <p className="text-[0.5em] text-textMain/60 print:text-gray-500 mt-1 uppercase font-bold tracking-widest italic">
              Registry Stamp Required
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-black py-5 mt-auto print:bg-black">
        <div className="flex flex-col items-center justify-center gap-[0.5em]">
          {/* <p className="text-[0.5em] text-gray-500 uppercase tracking-[0.4em] font-black flex items-center gap-2">
            <span className="text-[#b4a460]">Order Entry:</span> 
            <span className="text-gray-300">{orderData.creator?.name || 'System'}</span>
            <span className="mx-2 text-gray-700">|</span>
            <span className="text-[#b4a460]">Issued By:</span> 
            <span className="text-gray-300">{user?.name || user?.full_name || 'Authorized Staff'}</span>
          </p> */}
          
          <div className="flex items-center gap-4">
              <p className="text-[0.4375em] text-gray-600 uppercase tracking-[0.6em] font-bold">
                Cloud Registry System • Mehera International • 2026
              </p>
          </div>
        </div>
      </div>
      </div>
      </div>

      {/* --- Advanced Print Control Styles --- */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }

          /* 1. Hide everything on the page by default */
          body * {
            visibility: hidden;
          }

          /* 2. Then, make the print container and everything inside it visible */
          .quotation-container, .quotation-container * {
            visibility: visible;
          }

          html, body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          .print\:hidden { display: none !important; }

          .quotation-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: auto !important;
            min-height: 100%;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            display: block !important;
            box-sizing: border-box !important;
            transform: none !important;
            font-size: 16px !important;
          }

          tr {
            page-break-inside: avoid;
          }
        }
      `,
        }}
      />
    </div>
  );
};

export default Quotation;
