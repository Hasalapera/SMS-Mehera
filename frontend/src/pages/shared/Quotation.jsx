import React, { useRef, useState, useEffect} from "react";
import { useReactToPrint } from "react-to-print";
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
import axios from "axios";
import { useAuth } from "../../pages/context/AuthContext";

const Quotation = () => {
  const componentRef = useRef(null);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); // ලොග් වෙලා ඉන්න යූසර්ගේ විස්තර ගන්නවා
  const [fontScale, setFontScale] = useState(1);
  const [systemSettings, setSystemSettings] = useState(null);

  const orderData = location.state?.order;

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/settings/public');
        setSystemSettings(res.data);
      } catch (err) {
        console.error("Quotation branding fetch failed:", err);
      }
    };
    fetchBranding();
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
            Back to Registry
          </button>
        </div>
      </div>
    );
  }

  const itemsList = orderData.OrderItems || orderData.items || [];

  // 💰 Backend එකෙන් එන අගයන් කෙළින්ම ගමු (නැතිනම් පමණක් calculate කරමු)
  const subTotal = Number(orderData.subtotal) || itemsList.reduce((sum, item) => sum + (Number(item.qty) * Number(item.price)), 0);
  const discountVal = Number(orderData.discount_amount) || 0;
  const discountPercentage = Number(orderData.discount_percentage) || 0;
  const netTotal = Number(orderData.total_amount) || (subTotal - discountVal);

  return (
    <div className="min-h-screen bg-background text-textMain py-10 px-4 animate-in fade-in duration-500">
      {/* Action Bar */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-card border border-border rounded-xl text-xs font-black uppercase text-textMain/60 hover:text-textMain transition-all shadow-sm"
        >
          <ArrowLeft size={16} /> Back to Registry
        </button>
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-black text-[#b4a460] rounded-xl text-[0.625em] font-black uppercase tracking-widest hover:bg-[#b4a460] hover:text-white transition-all shadow-xl"
        >
          <Download size={16} /> Print / Download
        </button>
      </div>

      {/* Printable Quotation Wrapper - Mobile එකේදී scroll වෙන්න */}
      <div ref={wrapperRef} className="w-full max-w-4xl mx-auto flex justify-center print:!block print:!h-auto">
        <div
          ref={componentRef}
          className="quotation-container w-[800px] bg-card text-textMain shadow-2xl overflow-hidden print:shadow-none print:m-0 origin-top print:!transform-none print:!bg-white print:!text-black"
          style={{ 
            fontSize: `${fontScale * 16}px`, // 16px කියන්නේ Standard size එක. ඒක scale එකෙන් වැඩි කරනවා.
            width: '50em', // 800px වෙනුවට 50em පාවිච්චි කරන්න (16 * 50 = 800)
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
            <div className="mt-[1.5em] space-y-1 text-[0.5625em] text-textMain/60 print:text-gray-600 font-bold uppercase tracking-widest">
              <p className="flex items-center gap-2">
                <MapPin size={16 * fontScale} className="text-primary" /> No 182,
                Kuruppumulla Road, Panadura
              </p>
              <p className="flex items-center gap-2">
                <Phone size={10 * fontScale} className="text-primary" /> 0707 577 500 /
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
        <div className="p-[2.5em] border-b border-border bg-background/50">
          <div className="grid grid-cols-2 gap-[2.5em]">
            {/* 1. Created By (The person who originally placed the order) */}
            <div className="space-y-3">
              <h3 className="text-[0.5625em] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                <ShoppingCart size={24 * fontScale} /> Original Entry By:
              </h3>
              <div className="flex items-center gap-3 bg-card p-3 rounded-2xl border border-border shadow-sm">
                <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-textMain/50">
                  <User size={14 * fontScale} />
                </div>
                <div>
                  <p className="text-[0.625em] font-black text-textMain uppercase leading-tight">
                    {orderData.creator?.name || "System Record"}
                  </p>
                  <p className="text-[0.5em] text-textMain/60 font-bold uppercase italic">
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
                Quotation Issued By: <ClipboardList size={10 * fontScale} />
              </h3>
              <div className="flex items-center gap-3 bg-card p-3 rounded-2xl border border-border shadow-sm justify-end">
                <div className="text-right">
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
                // Backend එකෙන් එන දත්ත වල පිළිවෙළ අනුව name එක තෝරාගන්නවා
                const productName =
                  item.variant?.product?.product_name || "Stock Item";
                const variantName = item.variant?.variant_name || "Standard";

                return (
                  <tr key={idx}>
                    <td className="py-[1.25em] text-[0.75em] font-mono font-black text-primary">
                      #{item.product_id?.substring(0, 8)}
                    </td>
                    <td className="py-[1.25em]">
                      {/* මෙතන තමයි Product Name එක පෙන්වන්නේ */}
                      <p className="text-[0.6875em] font-black text-textMain print:text-black uppercase leading-none mb-1">
                        {productName}
                      </p>
                      <p className="text-[0.5625em] text-textMain/60 print:text-gray-500 font-bold uppercase tracking-tight italic">
                        Variant: {variantName}
                      </p>
                    </td>
                    <td className="py-[1.25em] text-center text-[0.6875em] font-black">
                      {item.qty}
                    </td>
                    <td className="py-[1.25em] text-right text-[0.625em] text-textMain/60 print:text-gray-500">
                      LKR {Number(item.price).toLocaleString()}
                    </td>
                    <td className="py-[1.25em] text-right text-[0.6875em] font-black text-textMain print:text-black">
                      LKR {(item.qty * item.price).toLocaleString()}
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

          {/* Order එකේදී ඇඩ් කරපු Discount එක පමණක් මෙතන පෙන්වයි */}
          {discountVal > 0 && (
            <div className="flex justify-between text-[0.625em] font-bold text-red-500 uppercase">
              <span>Discount ({discountPercentage}%)</span>
              <span>- LKR {discountVal.toLocaleString()}</span>
            </div>
          )}

          {/* අවසාන ගෙවිය යුතු මුදල */}
          <div className="flex justify-between items-center pt-[0.75em] border-t-2 border-textMain print:border-black">
            <span className="text-[0.6875em] font-black text-textMain print:text-black uppercase">Net Total</span>
            <span className="text-[1.25em] font-black text-textMain print:text-black tabular-nums">Rs. {netTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

        {/* Bank & Signature */}
        <div className="p-[2.5em] grid grid-cols-2 gap-[4em] text-left border-t border-border">
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
          <div className="flex flex-col justify-end items-center">
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
        <div className="bg-black py-6 mt-auto print:bg-black">
        <div className="flex flex-col items-center justify-center flex flex-col gap-[0.5em]">
          <p className="text-[0.5em] text-gray-500 uppercase tracking-[0.4em] font-black flex items-center gap-2">
            <span className="text-[#b4a460]">Order Entry:</span> 
            <span className="text-gray-300">{orderData.creator?.name || 'System'}</span>
            <span className="mx-2 text-gray-700">|</span>
            <span className="text-[#b4a460]">Issued By:</span> 
            <span className="text-gray-300">{user?.name || user?.full_name || 'Authorized Staff'}</span>
          </p>
          
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
            size: A4; 
            margin: 0; 
          }
          body {
            background: white !important; 
            margin: 0; 
            -webkit-print-color-adjust: exact;
          }
          .print\:hidden { display: none !important; }

          /* 🛡️ මෙන්න මෙතන තමයි මැජික් එක වෙන්නේ */
          .quotation-container {
            font-size: 16px !important; /* මොබයිල් එකේ scale එක reset කරනවා */
            width: 800px !important;    /* Original desktop width එක force කරනවා */
            height: auto !important;
            transform: none !important; /* මොනවා හරි transform තිබ්බොත් අයින් කරනවා */
            margin: 0 auto !important;
            box-shadow: none !important;
            display: block !important;
          }

          /* Table එකේ පේළි පිටු අතර කැඩෙන්නේ නැති වෙන්න */
          tr { page-break-inside: avoid; }
        }
      `,
        }}
      />
    </div>
  );
};

export default Quotation;
