// src/pages/OrderVerificationHub.jsx
import React, { useState, useEffect, useRef } from 'react';
import { QrCode, ScanLine, EyeOff, CheckCircle, Search, Truck, Clock, Package, Smartphone, Award, Globe, Copy, Check, ExternalLink, AlertTriangle, Printer } from 'lucide-react'; // 🎯 [FIXED]: Added Printer icon here
import api from '../api/axiosInstance';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast'; 
import StatNavBar from '../components/StatNavBar';
import Footer from '../components/Footer';

const OrderVerificationHub = () => {
  const customerScannerRef = useRef(null);
  const [activeTab, setActiveTab] = useState('verify'); 
  
  // Delivery Verification States
  const [isCustomerScannerOpen, setIsCustomerScannerOpen] = useState(false);
  const [scannedOrderId, setScannedOrderId] = useState('');
  const [verificationOtp, setVerificationOtp] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Live Status Check Tracing States
  const [searchOrderId, setSearchOrderId] = useState('');
  const [orderStatusData, setOrderStatusData] = useState(null);
  const [searching, setSearching] = useState(false);
  const [isCopied, setIsCopied] = useState(false); 

  useEffect(() => { 
    window.scrollTo(0, 0); 
  }, []);

  // HTML5 QR Scanner Lifecycle Router
  useEffect(() => {
    if (activeTab === 'verify' && isCustomerScannerOpen) {
      const initCustomerScanner = () => {
        customerScannerRef.current = new window.Html5QrcodeScanner(
          "mehera-hub-qr-reader", 
          { 
            fps: 30, 
            qrbox: { width: 200, height: 200 }, 
            videoConstraints: { facingMode: "environment" } 
          }, 
          false
        );
        customerScannerRef.current.render(onCustomerScanSuccess, () => {});
      };

      if (!window.Html5QrcodeScanner) {
        const script = document.createElement('script');
        script.src = "https://unpkg.com/html5-qrcode";
        script.async = true;
        script.onload = initCustomerScanner;
        document.body.appendChild(script);
      } else {
        initCustomerScanner();
      }
    }

    return () => {
      if (customerScannerRef.current) {
        customerScannerRef.current.clear().catch(e => console.error(e));
      }
    };
  }, [activeTab, isCustomerScannerOpen]);

  const onCustomerScanSuccess = (decodedText) => {
    setScannedOrderId(decodedText);
    setIsCustomerScannerOpen(false);
    Swal.fire({
      title: '<span style="font-family: serif; font-style: italic; font-size: 20px;">QR Scanned!</span>',
      html: '<p style="font-family: sans-serif; color: #10b981; font-size: 12px; font-weight: bold;">Reference captured. Enter your 6-digit OTP code.</p>',
      icon: 'success',
      confirmButtonColor: '#000000'
    });
  };

  // Handle Delivery Verification Secure OTP Submit
  const handleCustomerDeliveryVerify = async (e) => {
    e.preventDefault();
    if (!scannedOrderId || !verificationOtp) {
      Swal.fire('Error', 'Please scan the QR code and enter the OTP.', 'error');
      return;
    }

    setVerifying(true);
    try {
      const res = await api.post(`/orders/confirm-delivery/${scannedOrderId}`, { otp: verificationOtp });
      if (res.data.success || res.status === 200) {
        Swal.fire({
          title: '<span style="font-family: serif; font-style: italic; font-size: 24px;">Delivery Confirmed!</span>',
          html: '<p style="font-family: sans-serif; color: #6b7280; font-size: 13px;">Thank you! Your order status has been successfully verified as DELIVERED.</p>',
          icon: 'success',
          confirmButtonColor: '#000000'
        });
        setScannedOrderId('');
        setVerificationOtp('');
      }
    } catch (err) {
      Swal.fire({
        title: 'Verification Failed',
        text: err.response?.data?.message || 'Invalid Secure Delivery OTP Code.',
        icon: 'error',
        confirmButtonColor: '#000000'
      });
    } finally {
      setVerifying(false);
    }
  };

  // Handle Trace Status Query
  const handleCheckStatus = async (e) => {
    e.preventDefault();

    const cleanOrderRef = searchOrderId
      .trim()
      .replace(/^#/, "")
      .replace(/^ORD-/i, "")
      .replace(/^\/+|\/+$/g, "");

    if (!cleanOrderRef) {
      Swal.fire({
        title: "Missing Order Reference",
        text: "Please enter a valid Order Reference Number.",
        icon: "warning",
        confirmButtonColor: "#000000",
      });
      return;
    }

    setSearching(true);
    setOrderStatusData(null);
    setIsCopied(false);

    try {
      const res = await api.get(`/orders/${encodeURIComponent(cleanOrderRef)}`);
      setOrderStatusData(res.data);
    } catch (err) {
      Swal.fire({
        title: "Not Found",
        text:
          err.response?.data?.message ||
          "Could not find any details for this Order Reference Number.",
        icon: "warning",
        confirmButtonColor: "#000000",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleCopyTrackingId = (text) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success('Tracking ID copied to clipboard!');
    setTimeout(() => { setIsCopied(false); }, 2000);
  };

  // 🎯 [UPDATED] Tracking ID එක embed නොකර, courier සේවාවේ ප්‍රධාන tracking page එකට යොමු කිරීමට සකස් කරන ලදී.
  const COURIER_URLS = new Map([
    ['domex', 'https://www.domex.lk/tracking.php'],      // ✅ නිවැරදි tracking page එක.
    ['pronto', 'https://prontolanka.lk/tracking/'],      // ✅ නිවැරදි tracking page එක.
    ['koombiyo', 'https://koombiyodelivery.lk/track'] // ✅ ඔබ ලබාදුන් URL එකට අනුව යාවත්කාලීන කරන ලදී.
  ]);

  const getCourierRedirectUrl = (courierName, trackingId) => {
    if (!trackingId) return '#';
    
    const normalizedName = courierName?.toLowerCase().replace(/\s+/g, '') || '';
    const url = COURIER_URLS.get(normalizedName);

    if (url) return url;
    return `https://www.google.com/search?q=${courierName}+tracking+${trackingId}`;
  };

  const getStatusBadge = (status) => {
    const base = "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ";
    if (status === 'requested') return <span className={`${base} bg-yellow-500/10 text-yellow-500 border border-yellow-500/20`}>Requested</span>;
    if (status === 'approved') return <span className={`${base} bg-blue-500/10 text-blue-500 border border-blue-500/20`}>Approved</span>;
    if (status === 'shipped') return <span className={`${base} bg-indigo-500/10 text-indigo-500 border border-indigo-500/20`}>Manifest Shipped</span>;
    if (status === 'handed_over') return <span className={`${base} bg-purple-500/10 text-purple-500 border border-purple-500/20`}>Courier Handover</span>;
    if (status === 'handed_over_delivery') return <span className={`${base} bg-orange-500/10 text-orange-500 border border-orange-500/20`}>Delivery Handover</span>;
    if (status === 'delivered') return <span className={`${base} bg-green-500/10 text-green-500 border border-green-500/20`}>Delivered</span>;
    if (status === 'returned') return <span className={`${base} bg-red-500/10 text-red-500 border border-red-500/20`}>Returned</span>;
    return <span className={`${base} bg-gray-500/10 text-gray-500 border border-gray-500/20`}>{status}</span>;
  };

  const getOrderTypeBadge = (type) => {
    const base = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest mt-1.5 border ";
    if (type === 'online') {
      return <span className={`${base} bg-sky-500/10 text-sky-500 border-sky-500/20 shadow-sm`}><Globe size={11} /> Online Order</span>;
    }
    return <span className={`${base} bg-[#b4a460]/10 text-primary border-primary/20 shadow-sm`}><Award size={11} /> Professional Order</span>;
  };

  return (
    <div className="min-h-screen bg-background font-sans text-textMain pt-28 flex flex-col justify-between transition-all duration-500 text-left">
      <StatNavBar />
      
      <style>{`
        #mehera-hub-qr-reader button {
          background-color: #000000 !important; color: #b4a460 !important;
          border: 1px solid rgba(180, 164, 96, 0.4) !important;
          padding: 10px 20px !important; border-radius: 14px !important;
          font-size: 11px !important; font-weight: 900 !important; text-transform: uppercase !important;
          cursor: pointer !important; width: 100% !important; max-width: 200px !important; margin-top: 10px !important;
        }
        #mehera-hub-qr-reader a { display: none !important; }
        #mehera-hub-qr-reader span { color: #ffffff !important; opacity: 0.6; font-size: 11px; }
        #mehera-hub-qr-reader video { border-radius: 16px !important; }
      `}</style>

      <main className="max-w-5xl w-full mx-auto px-6 py-12 flex-1 space-y-8">
        {/* Top Header Title Panel */}
        <div className="flex items-center gap-4 border-b border-border pb-6">
          <div className="p-3.5 bg-black text-primary rounded-2xl shadow-xl"><QrCode size={26} /></div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif leading-none text-textMain">Customer <span className="italic text-primary">Operations Hub</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-textMain/40 mt-1.5">Verify package delivery and track live lifecycle states</p>
          </div>
        </div>

        {/* Dynamic Card Container Box */}
        <div className="bg-card border border-border rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col">
          {/* Tabs Switcher Component */}
          <div className="flex border-b border-border bg-background/50 sm:px-6 pt-2 gap-2 sm:gap-4 overflow-x-auto w-full no-scrollbar">
            <button type="button" onClick={() => { setActiveTab('verify'); setIsCustomerScannerOpen(false); }} className={`pb-3.5 px-6 text-[11px] sm:text-xs font-black uppercase tracking-widest border-b-2 text-center whitespace-nowrap ${activeTab === 'verify' ? 'border-primary text-primary' : 'border-transparent text-textMain/40 hover:text-textMain'}`}>Verify Secure Delivery</button>
            <button type="button" onClick={() => { setActiveTab('status'); setIsCustomerScannerOpen(false); }} className={`pb-3.5 px-6 text-[11px] sm:text-xs font-black uppercase tracking-widest border-b-2 text-center whitespace-nowrap ${activeTab === 'status' ? 'border-primary text-primary' : 'border-transparent text-textMain/40 hover:text-textMain'}`}>Trace Order Status</button>
          </div>

          <div className="p-6 sm:p-10 bg-card">
            {/* TAB 1: SECURE RECEIPT VALIDATION HUB */}
            {activeTab === 'verify' && (
              <div className="flex flex-col lg:grid lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 bg-background p-4 rounded-3xl border border-border flex flex-col items-center justify-center min-h-[240px] w-full">
                  {isCustomerScannerOpen ? (
                    <div id="mehera-hub-qr-reader" className="w-full rounded-2xl overflow-hidden border border-primary/20 bg-black"></div>
                  ) : (
                    <div className="text-center p-4 flex flex-col items-center space-y-3">
                      <ScanLine size={32} className="animate-pulse text-primary" />
                      <h4 className="text-[10px] font-black text-textMain/40 uppercase tracking-widest">Scanner Offline</h4>
                      <p className="text-xs text-textMain/40 italic max-w-xs leading-relaxed">Activate your camera link below to capture the signature matrix code on the label.</p>
                      <button type="button" onClick={() => setIsCustomerScannerOpen(true)} className="bg-black text-primary border border-primary/30 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all">Launch Camera</button>
                    </div>
                  )}
                  {isCustomerScannerOpen && (
                    <button type="button" onClick={() => setIsCustomerScannerOpen(false)} className="mt-4 text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1"><EyeOff size={12} /> Disconnect Camera</button>
                  )}
                </div>
                <div className="lg:col-span-3 bg-background/40 p-6 rounded-3xl border border-border w-full flex flex-col justify-center shadow-inner">
                  <form onSubmit={handleCustomerDeliveryVerify} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-textMain/50 ml-1">Extracted Order ID</label>
                      <input type="text" readOnly value={scannedOrderId} placeholder="[ Auto-populated via QR Scanner ]" className="w-full p-4 bg-card rounded-xl border border-border outline-none text-xs font-mono font-bold text-primary placeholder:text-textMain/30" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-textMain/50 ml-1">Secure Delivery OTP</label>
                      <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-textMain/30" size={16} />
                        <input type="text" required value={verificationOtp} onChange={(e) => setVerificationOtp(e.target.value)} placeholder="ENTER 6-DIGIT LEDGER OTP" className="w-full pl-12 pr-4 py-4 bg-card rounded-xl border border-border outline-none text-xs sm:text-sm font-black tracking-[0.2em] text-textMain placeholder:tracking-normal placeholder:font-bold placeholder:text-textMain/30" />
                      </div>
                    </div>
                    <button type="submit" disabled={verifying || !scannedOrderId || !verificationOtp} className="w-full py-4 bg-black text-primary font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-primary hover:text-black transition-all disabled:opacity-40 shadow-xl flex items-center justify-center gap-2">
                      {verifying ? 'Signing Security Ledger...' : 'Confirm Package Receipt'} <CheckCircle size={14} />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 2: LIVE HASH TRACING SYSTEM */}
            {activeTab === 'status' && (
              <div className="space-y-6 w-full">
                <form onSubmit={handleCheckStatus} className="flex flex-col sm:flex-row gap-3 w-full">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textMain/30" />
                    <input type="text" required value={searchOrderId} onChange={(e) => setSearchOrderId(e.target.value)} placeholder="Enter unique Order Hash Code Reference..." className="w-full pl-12 pr-4 py-4 bg-background rounded-xl border border-border outline-none text-xs font-mono font-bold text-textMain shadow-inner" />
                  </div>
                  <button type="submit" disabled={searching} className="bg-black text-primary px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest border border-primary/20 hover:bg-primary hover:text-black transition-all shadow-md">{searching ? 'Querying...' : 'Trace Order'}</button>
                </form>

                {orderStatusData && (
                  <div className="bg-background/40 rounded-3xl border border-border p-5 sm:p-6 space-y-6 animate-in fade-in duration-300 w-full shadow-inner">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                      <div className="flex flex-col items-start text-left">
                        <h4 className="text-[10px] font-black text-textMain/40 uppercase tracking-widest">Consignee Name</h4>
                        <p className="text-sm font-black text-textMain mt-0.5 uppercase tracking-tight">{orderStatusData.customer_name}</p>
                        {getOrderTypeBadge(orderStatusData.order_type)}
                      </div>
                      <div className="sm:text-right text-left">
                        <h4 className="text-[10px] font-black text-textMain/40 uppercase tracking-widest mb-1.5">Fulfillment Status</h4>
                        {getStatusBadge(orderStatusData.order_status)}
                      </div>
                    </div>

                    {/* 🗺️ DYNAMIC RESPONSIVE 5-STAGE PIPELINE TIMELINE CORE ENGINE */}
                    <div className="flex flex-col md:grid relative pt-2 gap-6 md:gap-2 grid-cols-5 text-center">
                      <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-[2px] bg-border z-0">
                        <div className={`h-full bg-primary transition-all duration-500 ${orderStatusData.order_status === 'returned' ? 'bg-red-500' : ''}`}
                          style={{
                            width: orderStatusData.order_status === 'requested' ? '0%' : 
                                   orderStatusData.order_status === 'approved' ? '25%' : 
                                   orderStatusData.order_status === 'shipped' ? '50%' : 
                                   ['handed_over', 'handed_over_delivery'].includes(orderStatusData.order_status) ? '75%' : '100%'
                          }}
                        />
                      </div>

                      {[
                        { label: 'Requested', key: 'requested', icon: Clock },
                        { label: 'Approved', key: 'approved', icon: Package },
                        { label: 'Shipped', key: 'shipped', icon: Printer },
                        { 
                          label: orderStatusData.order_type === 'online' ? 'Courier Handover' : 'Delivery Handover', 
                          key: orderStatusData.order_type === 'online' ? 'handed_over' : 'handed_over_delivery', 
                          icon: Truck 
                        },
                        { 
                          label: orderStatusData.order_status === 'returned' ? 'Returned' : 'Delivered', 
                          key: orderStatusData.order_status === 'returned' ? 'returned' : 'delivered', 
                          icon: orderStatusData.order_status === 'returned' ? AlertTriangle : CheckCircle 
                        }
                      ].map((step, idx, arr) => {
                        const Icon = step.icon;
                        const timelineKeysOrder = ['requested', 'approved', 'shipped', 'handed_over', 'handed_over_delivery', 'delivered', 'returned'];
                        
                        let currentIdx = timelineKeysOrder.indexOf(orderStatusData.order_status);
                        if (orderStatusData.order_status === 'handed_over_delivery' && idx === 3) currentIdx = 4; 
                        if (orderStatusData.order_status === 'delivered') currentIdx = 5;

                        const isDone = currentIdx >= (idx === 3 && orderStatusData.order_type !== 'online' ? 4 : idx === 4 ? 5 : idx);
                        const isReturnedState = step.key === 'returned' && orderStatusData.order_status === 'returned';

                        return (
                          <div key={step.key} className="flex flex-row md:flex-col items-center md:justify-start gap-4 md:gap-0 z-10 relative">
                            {idx < arr.length - 1 && <div className={`md:hidden absolute left-5 top-10 w-[2px] h-10 bg-border ${isDone ? 'bg-primary' : ''}`} />}
                            <div className={`p-2.5 rounded-full border transition-all ${isReturnedState ? 'bg-red-500 text-white border-red-600 shadow-lg' : isDone ? 'bg-black text-primary border-primary shadow-lg' : 'bg-card text-textMain/20 border-border'}`}><Icon size={14} /></div>
                            <span className={`text-[10px] font-black uppercase tracking-wider md:mt-3 ${isReturnedState ? 'text-red-500' : isDone ? 'text-textMain' : 'text-textMain/30'}`}>{step.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* External Courier Waybill Tracking Button Component Row */}
                    {orderStatusData.tracking_id && (
                      <div className="bg-card p-4 rounded-xl border border-border flex flex-col md:flex-row justify-between md:items-center gap-4 text-xs mt-4">
                        <div className="flex gap-4">
                          <div><span className="text-[9px] block text-textMain/40 uppercase font-black">Courier Partner</span><span className="font-bold text-textMain text-[11px] uppercase bg-background px-2 py-0.5 rounded border border-border mt-0.5 inline-block">{orderStatusData.courier_name}</span></div>
                          <div>
                            <span className="text-[9px] block text-textMain/40 uppercase font-black">Waybill Number</span>
                            <span className="font-mono font-black text-primary text-sm tracking-wide flex items-center gap-2 mt-0.5">
                              {orderStatusData.tracking_id} 
                              <button type="button" onClick={() => handleCopyTrackingId(orderStatusData.tracking_id)} className="text-textMain/50 hover:text-primary transition-all">
                                {isCopied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                              </button>
                            </span>
                          </div>
                        </div>
                        {['shipped', 'handed_over', 'handed_over_delivery', 'delivered'].includes(orderStatusData.order_status) && (
                          <a href={getCourierRedirectUrl(orderStatusData.courier_name, orderStatusData.tracking_id)} target="_blank" rel="noopener noreferrer" className="bg-black text-primary border border-primary/30 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black flex items-center justify-center gap-2 transition-all"><ExternalLink size={13} /> Track Live Shipment</a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderVerificationHub;