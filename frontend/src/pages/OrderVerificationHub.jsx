// src/pages/OrderVerificationHub.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QrCode, ScanLine, EyeOff, CheckCircle, Search, Truck, Clock, Package, Smartphone, Award, Globe, Copy, Check, ExternalLink, AlertTriangle, Printer } from 'lucide-react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast'; 
import { MySwal } from './utils/swalConfig';
import StatNavBar from '../components/StatNavBar';
import Footer from '../components/Footer';

const OrderVerificationHub = () => {
  const customerScannerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const initialTab = new URLSearchParams(location.search).get('tab') || 'verify';
  const [activeTab, setActiveTab] = useState(initialTab);

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
    const tabFromUrl = new URLSearchParams(location.search).get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [location, activeTab]);

  // HTML5 QR Scanner Lifecycle Router
  useEffect(() => {
    if (activeTab === 'verify' && isCustomerScannerOpen) {
      const initCustomerScanner = () => {
        customerScannerRef.current = new window.Html5QrcodeScanner(
          "mehera-hub-qr-reader", 
          { 
            fps: 30, 
            qrbox: function(viewfinderWidth, viewfinderHeight) {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              const size = minEdge < 300 ? Math.floor(minEdge * 0.7) : 230;
              return { width: size, height: size };
            },
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
    MySwal.fire({
      title: '<span style="font-family: serif; font-style: italic; font-size: 20px;">QR Scanned!</span>',
      html: '<p class="text-sm text-textMain/70">Reference captured. Please enter the 6-digit OTP code sent to the customer.</p>',
      icon: 'success',
      confirmButtonText: 'Okay',
      customClass: {
        popup: 'rounded-[2rem] p-4 md:p-6 bg-card border border-border',
        title: 'text-textMain',
        htmlContainer: 'text-textMain/70',
        confirmButton: 'bg-black text-primary rounded-xl px-10 py-3 text-xs font-bold uppercase shadow-lg',
      }
    });
  };

  const handleCustomerDeliveryVerify = async (e) => {
    e.preventDefault();
    if (!scannedOrderId || !verificationOtp) {
      MySwal.fire({
        title: 'Error', 
        text: 'Please scan the QR code and enter the OTP.', 
        icon: 'error',
        customClass: {
          popup: 'rounded-[2rem] p-4 md:p-6 bg-card border border-border',
          confirmButton: 'bg-black text-primary rounded-xl px-10 py-3 text-xs font-bold uppercase shadow-lg',
        }
      });
      return;
    }

    setVerifying(true);
    try {
      const res = await api.post(`/orders/confirm-delivery/${scannedOrderId}`, { otp: verificationOtp });
      if (res.data.success || res.status === 200) {
        MySwal.fire({
          title: '<span style="font-family: serif; font-style: italic; font-size: 24px;">Delivery Confirmed!</span>',
          html: '<p class="text-sm text-textMain/70">Thank you! Your order status has been successfully verified as DELIVERED.</p>',
          icon: 'success',
          confirmButtonText: 'Done',
          customClass: {
            popup: 'rounded-[2rem] p-4 md:p-6 bg-card border border-border',
            confirmButton: 'bg-black text-primary rounded-xl px-10 py-3 text-xs font-bold uppercase shadow-lg',
          }
        });
        setScannedOrderId('');
        setVerificationOtp('');
      }
    } catch (err) {
      MySwal.fire({
        title: 'Verification Failed',
        text: err.response?.data?.message || 'Invalid Secure Delivery OTP Code.',
        icon: 'error',
        confirmButtonText: 'Try Again',
        customClass: {
          popup: 'rounded-[2rem] p-4 md:p-6 bg-card border border-border',
          confirmButton: 'bg-black text-primary rounded-xl px-10 py-3 text-xs font-bold uppercase shadow-lg',
        }
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    const cleanOrderRef = searchOrderId.trim().replace(/^#/, "").replace(/^ORD-/i, "").replace(/^\/+|\/+$/g, "");

    if (!cleanOrderRef) {
      MySwal.fire({
        title: "Missing Order Reference",
        text: "Please enter a valid Order Reference Number.",
        icon: "warning",
        confirmButtonText: 'Okay',
        customClass: {
          popup: 'rounded-[2rem] p-4 md:p-6 bg-card border border-border',
          confirmButton: 'bg-black text-primary rounded-xl px-10 py-3 text-xs font-bold uppercase shadow-lg',
        }
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
      MySwal.fire({
        title: "Not Found",
        text: err.response?.data?.message || "Could not find any details for this Order Reference Number.",
        icon: "warning",
        confirmButtonText: 'Okay',
        customClass: {
          popup: 'rounded-[2rem] p-4 md:p-6 bg-card border border-border',
          confirmButton: 'bg-black text-primary rounded-xl px-10 py-3 text-xs font-bold uppercase shadow-lg',
        }
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

  const COURIER_URLS = new Map([
    ['domex', 'https://www.domex.lk/tracking.php'],      
    ['pronto', 'https://prontolanka.lk/tracking/'],      
    ['koombiyo', 'https://koombiyodelivery.lk/track'] 
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
    <div className="min-h-screen bg-background font-sans text-textMain pt-20 sm:pt-28 flex flex-col justify-between transition-all duration-500 text-left">
      <StatNavBar />
      
      <style>{`
        #mehera-hub-qr-reader button {
          background-color: #000000 !important; color: #b4a460 !important;
          border: 1px solid rgba(180, 164, 96, 0.4) !important;
          padding: 12px 24px !important; border-radius: 14px !important;
          font-size: 11px !important; font-weight: 900 !important; text-transform: uppercase !important;
          cursor: pointer !important; width: 100% !important; max-width: 220px !important; margin-top: 12px !important;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        #mehera-hub-qr-reader a { display: none !important; }
        #mehera-hub-qr-reader span { color: #ffffff !important; opacity: 0.6; font-size: 11px; }
        #mehera-hub-qr-reader video { border-radius: 20px !important; width: 100% !important; object-cover: cover; }
      `}</style>

      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 space-y-6 sm:space-y-8">
        {/* Top Header Title Panel */}
        <div className="flex items-center gap-3 sm:gap-4 border-b border-border pb-4 sm:pb-6">
          <div className="p-2.5 sm:p-3.5 bg-black text-primary rounded-xl sm:rounded-2xl shadow-xl shrink-0"><QrCode size={22} className="sm:w-[26px] sm:h-[26px]" /></div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-serif text-textMain tracking-tight">Customer <span className="italic text-primary">Operations Hub</span></h1>
            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-textMain/40 mt-1">Verify package delivery & trace live lifecycle states</p>
          </div>
        </div>

        {/* Dynamic Card Container Box */}
        <div className="bg-card border border-border rounded-3xl sm:rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col">
          {/* Tabs Switcher Component - Responsive Grid */}
          <div className="grid grid-cols-2 border-b border-border bg-background/50 w-full relative">
            <button type="button" onClick={() => { 
              setActiveTab('verify'); 
              setIsCustomerScannerOpen(false); 
              navigate('/verify-order?tab=verify'); 
            }} className={`pb-3.5 pt-4 px-3 sm:px-6 text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest border-b-2 text-center transition-all duration-300 ${activeTab === 'verify' ? 'border-primary text-primary bg-card/40' : 'border-transparent text-textMain/40 hover:text-textMain'}`}>Verify Delivery</button>
            <button type="button" onClick={() => { 
              setActiveTab('status'); 
              setIsCustomerScannerOpen(false); 
              navigate('/verify-order?tab=status'); 
            }} className={`pb-3.5 pt-4 px-3 sm:px-6 text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest border-b-2 text-center transition-all duration-300 ${activeTab === 'status' ? 'border-primary text-primary bg-card/40' : 'border-transparent text-textMain/40 hover:text-textMain'}`}>Trace Status</button>
          </div>

          <div className="p-4 sm:p-10 bg-card">
            {/* TAB 1: SECURE RECEIPT VALIDATION HUB */}
            {activeTab === 'verify' && (
              <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6 sm:gap-8">
                {/* Responsive Scanner Base Panel */}
                <div className="lg:col-span-2 bg-background p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-border flex flex-col items-center justify-center min-h-[260px] w-full shadow-inner">
                  {isCustomerScannerOpen ? (
                    <div id="mehera-hub-qr-reader" className="w-full max-w-sm aspect-square rounded-2xl overflow-hidden border border-primary/20 bg-black mx-auto"></div>
                  ) : (
                    <div className="text-center p-2 flex flex-col items-center space-y-4">
                      <div className="p-4 bg-card rounded-full border border-border shadow-sm"><ScanLine size={28} className="animate-pulse text-primary" /></div>
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-black text-textMain/40 uppercase tracking-widest">Scanner Offline</h4>
                        <p className="text-xs text-textMain/40 italic max-w-xs leading-relaxed mx-auto">Activate camera to scan the signature matrix code on your package shipping label.</p>
                      </div>
                      <button type="button" onClick={() => setIsCustomerScannerOpen(true)} className="bg-black text-primary border border-primary/30 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all shadow-md active:scale-95">Launch Camera</button>
                    </div>
                  )}
                  {isCustomerScannerOpen && (
                    <button type="button" onClick={() => setIsCustomerScannerOpen(false)} className="mt-4 text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5 hover:opacity-80"><EyeOff size={13} /> Disconnect Camera</button>
                  )}
                </div>

                {/* Form Elements Box */}
                <div className="lg:col-span-3 bg-background/40 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-border w-full flex flex-col justify-center shadow-inner">
                  <form onSubmit={handleCustomerDeliveryVerify} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-textMain/50 ml-1">Extracted Order ID</label>
                      <input type="text" readOnly value={scannedOrderId} placeholder="[ Auto-populated via QR Scanner ]" className="w-full p-3.5 sm:p-4 bg-card rounded-xl border border-border outline-none text-xs font-mono font-bold text-primary placeholder:text-textMain/30 shadow-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-textMain/50 ml-1">Secure Delivery OTP</label>
                      <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-textMain/30" size={16} />
                        <input type="text" required value={verificationOtp} onChange={(e) => setVerificationOtp(e.target.value)} placeholder="ENTER 6-DIGIT LEDGER OTP" className="w-full pl-12 pr-4 py-3.5 sm:p-4 bg-card rounded-xl border border-border outline-none text-xs sm:text-sm font-black tracking-[0.15em] sm:tracking-[0.2em] text-textMain placeholder:tracking-normal placeholder:font-bold placeholder:text-textMain/30 shadow-sm" />
                      </div>
                    </div>
                    <button type="submit" disabled={verifying || !scannedOrderId || !verificationOtp} className="w-full py-3.5 sm:py-4 bg-black text-primary font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-primary hover:text-black transition-all disabled:opacity-40 shadow-xl flex items-center justify-center gap-2 active:scale-[0.99]">
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
                    <input type="text" required value={searchOrderId} onChange={(e) => setSearchOrderId(e.target.value)} placeholder="Enter unique Order Hash Code Reference..." className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-background rounded-xl border border-border outline-none text-xs font-mono font-bold text-textMain shadow-inner" />
                  </div>
                  <button type="submit" disabled={searching} className="bg-black text-primary px-8 py-3.5 sm:py-4 rounded-xl font-black uppercase text-[10px] tracking-widest border border-primary/20 hover:bg-primary hover:text-black transition-all shadow-md active:scale-95">{searching ? 'Querying...' : 'Trace Order'}</button>
                </form>

                {orderStatusData && (
                  <div className="bg-background/40 rounded-2xl sm:rounded-3xl border border-border p-4 sm:p-6 space-y-6 animate-in fade-in duration-300 w-full shadow-inner">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                      <div className="flex flex-col items-start text-left">
                        <h4 className="text-[10px] font-black text-textMain/40 uppercase tracking-widest">Consignee Name</h4>
                        <p className="text-sm font-black text-textMain mt-0.5 uppercase tracking-tight">{orderStatusData.customer_name}</p>
                        {getOrderTypeBadge(orderStatusData.order_type)}
                      </div>
                      <div className="sm:text-right text-left shrink-0">
                        <h4 className="text-[10px] font-black text-textMain/40 uppercase tracking-widest mb-1">Fulfillment Status</h4>
                        {getStatusBadge(orderStatusData.order_status)}
                      </div>
                    </div>

                    {/* 🗺️ ADAPTIVE 5-STAGE PIPELINE TIMELINE - MOBILE VERTICAL & DESKTOP HORIZONTAL METRIC */}
                    <div className="relative flex flex-col md:grid md:grid-cols-5 gap-6 md:gap-2 pt-2 text-left md:text-center px-2 md:px-0">
                      
                      {/* Desktop Horizontal Line */}
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
                          <div key={step.key} className="flex flex-row md:flex-col items-center md:justify-start gap-4 md:gap-0 z-10 relative group">
                            {/* Mobile Vertical Dynamic Connector Line */}
                            {idx < arr.length - 1 && (
                              <div className={`md:hidden absolute left-5 top-10 w-[2px] h-[calc(100%+8px)] bg-border transition-colors duration-500 ${isDone ? 'bg-primary' : ''}`} />
                            )}
                            
                            <div className={`p-2.5 rounded-full border transition-all shrink-0 duration-300 ${isReturnedState ? 'bg-red-500 text-white border-red-600 shadow-lg scale-110' : isDone ? 'bg-black text-primary border-primary shadow-lg scale-105' : 'bg-card text-textMain/20 border-border'}`}>
                              <Icon size={14} />
                            </div>
                            
                            <div className="flex flex-col md:items-center text-left md:text-center">
                              <span className={`text-[10px] font-black uppercase tracking-wider md:mt-3 ${isReturnedState ? 'text-red-500' : isDone ? 'text-textMain' : 'text-textMain/30'}`}>
                                {step.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* External Courier Waybill Tracking Component - Responsive Adjustments */}
                    {orderStatusData.tracking_id && (
                      <div className="bg-card p-4 rounded-xl border border-border flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs mt-6 shadow-sm">
                        <div className="flex gap-6">
                          <div>
                            <span className="text-[9px] block text-textMain/40 uppercase font-black">Courier Partner</span>
                            <span className="font-bold text-textMain text-[11px] uppercase bg-background px-2.5 py-1 rounded border border-border mt-1 inline-block shadow-sm">{orderStatusData.courier_name}</span>
                          </div>
                          <div>
                            <span className="text-[9px] block text-textMain/40 uppercase font-black">Waybill Number</span>
                            <span className="font-mono font-black text-primary text-sm tracking-wide flex items-center gap-2 mt-1">
                              {orderStatusData.tracking_id} 
                              <button type="button" onClick={() => handleCopyTrackingId(orderStatusData.tracking_id)} className="text-textMain/50 hover:text-primary transition-all p-0.5 active:scale-95">
                                {isCopied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                              </button>
                            </span>
                          </div>
                        </div>
                        {['shipped', 'handed_over', 'handed_over_delivery', 'delivered'].includes(orderStatusData.order_status) && (
                          <a href={getCourierRedirectUrl(orderStatusData.courier_name, orderStatusData.tracking_id)} target="_blank" rel="noopener noreferrer" className="bg-black text-primary border border-primary/30 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 w-full sm:w-auto text-center"><ExternalLink size={13} /> Track Live Shipment</a>
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