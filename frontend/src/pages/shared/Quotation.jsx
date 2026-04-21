import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { 
  Download, ArrowLeft, Phone, MapPin, 
  Hash, Calendar, ShoppingCart, User 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../pages/context/AuthContext';


const Quotation = () => {
  const componentRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); // ලොග් වෙලා ඉන්න යූසර්ගේ විස්තර ගන්නවා
  
  const orderData = location.state?.order;

// quotation ID generation Function (Format: YYYYMMDDHHMM + OrderID Prefix)
const generateQuotationId = () => {
  const now = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day   = String(now.getDate()).padStart(2, '0');
  const hour  = String(now.getHours()).padStart(2, '0');
  const min   = String(now.getMinutes()).padStart(2, '0');
  
  // Last 2 digits — order_id එකේ පළමු අක්ෂර 2 (unique වෙන්න)
  const suffix = orderData?.order_id?.substring(0, 2).toUpperCase() || 'XX';
  
  return `${year}${month}${day}${hour}${min}${suffix}`;
};

const quotationId = generateQuotationId();

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Quotation_${orderData?.order_id || 'Mehera'}`,
  });

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc]">
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 italic">No Data Received from Registry</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-[9px] font-black uppercase underline">Back to Registry</button>
        </div>
      </div>
    );
  }

  const itemsList = orderData.OrderItems || orderData.items || [];
  const subTotal = itemsList.reduce((sum, item) => sum + (Number(item.qty) * Number(item.price)), 0);
  const discount = subTotal * 0.05; 
  const netTotal = subTotal - discount;

  return (
    <div className="min-h-screen bg-[#f3f4f6] py-10 px-4 animate-in fade-in duration-500">
      {/* Action Bar */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-black uppercase text-gray-500 hover:text-black transition-all">
          <ArrowLeft size={16} /> Back to Registry
        </button>
        <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2.5 bg-black text-[#b4a460] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#b4a460] hover:text-white transition-all shadow-xl">
          <Download size={16} /> Print / Download
        </button>
      </div>

      {/* Printable Quotation */}
      <div ref={componentRef} className="quotation-container max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden print:shadow-none print:m-0">
        
        {/* Header Section */}
        <div className="relative h-44 bg-black p-10 flex justify-between items-start text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#b4a460] rounded-full -mr-32 -mt-32 opacity-20 blur-2xl"></div>
          
          <div className="relative z-10 text-left">
            <h1 className="text-3xl font-serif tracking-[0.3em] uppercase mb-1">Mehera</h1>
            <p className="text-[9px] font-black tracking-[0.5em] text-[#b4a460] uppercase">International</p>
            <div className="mt-6 space-y-1 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
              <p className="flex items-center gap-2"><MapPin size={10} className="text-[#b4a460]" /> No 182, Kuruppumulla Road, Panadura</p>
              <p className="flex items-center gap-2"><Phone size={10} className="text-[#b4a460]" /> 0707 577 500 / 502</p>
            </div>
          </div>

          <div className="text-right relative z-10">
            <h2 className="text-5xl font-black uppercase tracking-tighter opacity-10 mb-2 leading-none">Quotation</h2>
            <div className="space-y-1">
              <p className="text-[9px] font-black text-[#b4a460] uppercase tracking-widest">Quotation ID</p>
              <p className="text-lg font-mono font-black italic tracking-tighter">#{quotationId}</p>
              <p className="text-[9px] font-bold text-gray-500 mt-2">Generated Date: {new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>
        </div>

        {/* Client & User Info */}
        <div className="p-10 grid grid-cols-2 gap-10 text-left border-b border-gray-50">
          <div className="space-y-3">
            <h3 className="text-[9px] font-black text-[#b4a460] uppercase tracking-widest">Bill To:</h3>
            <div className="space-y-1">
              <p className="text-md font-black text-black uppercase leading-tight">{orderData.customer_name}</p>
              <p className="text-[11px] font-bold text-gray-500 italic leading-snug">{orderData.shipping_address}</p>
              <p className="text-[10px] font-black text-black pt-1">PH: {orderData.phone}</p>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Registry Auth:</h3>
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <User size={12} className="text-[#b4a460]" />
                    <div className="text-right">
                        <p className="text-[10px] font-black text-black uppercase leading-none">{user?.full_name}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-black text-[#b4a460] text-[7px] font-black uppercase tracking-widest rounded-md">
                        {{
                            'admin':               'Administrator',
                            'sales_rep':           'Sales Representative',
                            'online_store_keeper': 'Online Store Keeper',
                            'manager':             'Manager',
                        }[user?.role] || user?.role}
                        </span>
                        <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">ID: {user?.user_id?.substring(0,8)}</p>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="px-10 py-8 min-h-[350px]">
          <table className="w-full text-left table-fixed">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="py-3 w-2/12 text-[9px] font-black uppercase text-gray-400">Item Ref</th>
                <th className="py-3 w-5/12 text-[9px] font-black uppercase text-black">Description / Variant</th>
                <th className="py-3 w-1/12 text-center text-[9px] font-black uppercase text-black">Qty</th>
                <th className="py-3 w-2/12 text-right text-[9px] font-black uppercase text-black">Unit Price</th>
                <th className="py-3 w-2/12 text-right text-[9px] font-black uppercase text-black">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {itemsList.map((item, idx) => {
                // Backend එකෙන් එන දත්ත වල පිළිවෙළ අනුව name එක තෝරාගන්නවා
                const productName = item.variant?.product?.product_name || "Stock Item";
                const variantName = item.variant?.variant_name || "Standard";

                return (
                <tr key={idx}>
                    <td className="py-5 text-xs font-mono font-black text-[#b4a460]">
                    #{item.product_id?.substring(0, 8)}
                    </td>
                    <td className="py-5">
                    {/* මෙතන තමයි Product Name එක පෙන්වන්නේ */}
                    <p className="text-[11px] font-black text-black uppercase leading-none mb-1">
                        {productName}
                    </p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight italic">
                        Variant: {variantName}
                    </p>
                    </td>
                    <td className="py-5 text-center text-[11px] font-black">{item.qty}</td>
                    <td className="py-5 text-right text-[10px] text-gray-400">
                    LKR {Number(item.price).toLocaleString()}
                    </td>
                    <td className="py-5 text-right text-[11px] font-black text-black">
                    LKR {(item.qty * item.price).toLocaleString()}
                    </td>
                </tr>
                );
            })}
            </tbody>
          </table>
        </div>

        {/* Calculation Section */}
        <div className="flex justify-between items-end p-10 bg-gray-50 border-t border-gray-100">
          <div className="text-[9px] font-bold text-gray-400 max-w-[300px] uppercase leading-relaxed">
            <p className="mb-1 font-black text-[#b4a460]">Official Terms:</p>
            <p>• Quotation valid for 30 days. Prices are subject to stock availability. Please settle payments to the bank details provided.</p>
          </div>
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
              <span>Gross Sub Total</span>
              <span>LKR {subTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-red-500 uppercase">
              <span>Discount (5%)</span>
              <span>- LKR {discount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t-2 border-black">
              <span className="text-[11px] font-black text-black uppercase">Net Total</span>
              <span className="text-xl font-black text-black tabular-nums">Rs. {netTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Bank & Signature */}
        <div className="p-10 grid grid-cols-2 gap-16 text-left border-t border-gray-50">
          <div className="p-5 bg-white border border-gray-100 rounded-2xl">
              <h4 className="text-[9px] font-black uppercase text-[#b4a460] mb-2 tracking-widest">Bank Details</h4>
              <p className="text-[10px] font-black text-black uppercase leading-tight">Mehera International (Pvt) Ltd</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase mt-1 italic">Comm. Bank • 1000429495 • Panadura Office</p>
          </div>
          <div className="flex flex-col justify-end items-center">
            <div className="w-full h-[1px] bg-black mb-2"></div>
            <p className="text-[9px] font-black uppercase tracking-widest text-black">Authorized Signature</p>
            <p className="text-[8px] text-gray-400 mt-1 uppercase font-bold tracking-widest italic">Registry Stamp Required</p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-black py-4 text-center">
          <p className="text-[8px] text-gray-500 uppercase tracking-[0.5em] font-black">
            Generated by {user?.full_name} • Cloud Registry System • 2026
          </p>
        </div>
      </div>
      
      {/* --- Advanced Print Control Styles --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { 
            size: A4; 
            margin: 0; 
          }
          body { 
            background: white; 
            margin: 0; 
          }
          .print\\:hidden { display: none !important; }
          .quotation-container {
            width: 100% !important;
            height: 100vh !important;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          /* කොච්චර items තිබ්බත් පිටුව ඇතුළට compress කරනවා */
          .quotation-container table {
             page-break-inside: auto;
          }
          .quotation-container tr {
             page-break-inside: avoid;
             page-break-after: auto;
          }
        }
      `}} />
    </div>
  );
};

export default Quotation;