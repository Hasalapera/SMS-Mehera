// src/pages/OrderVerificationHub.jsx
import React, { useState, useEffect, useRef } from 'react';
import { QrCode, ScanLine, EyeOff, CheckCircle, Search, Truck, Clock, Package, Smartphone, Award, Globe, Copy, Check } from 'lucide-react';
import api from '../api/axiosInstance';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast'; // 💡 ක්ලික් කලාම "Copied!" ඇලර්ට් එක දෙන්න
import StatNavBar from '../components/StatNavBar';
import Footer from '../components/Footer';

const OrderVerificationHub = () => {
  const customerScannerRef = useRef(null);
  const [activeTab, setActiveTab] = useState('verify'); 
  
  // Verification States
  const [isCustomerScannerOpen, setIsCustomerScannerOpen] = useState(false);
  const [scannedOrderId, setScannedOrderId] = useState('');
  const [verificationOtp, setVerificationOtp] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Status Check States
  const [searchOrderId, setSearchOrderId] = useState('');
  const [orderStatusData, setOrderStatusData] = useState(null);
  const [searching, setSearching] = useState(false);
  const [isCopied, setIsCopied] = useState(false); // 💡 කොපි අයිකන් එක මාරු කරන්න

  useEffect(() => {
    window.scrollTo(0, 0); 
  }, []);

  useEffect(() => {
    if (activeTab === 'verify' && isCustomerScannerOpen) {
      const initCustomerScanner = () => {
        customerScannerRef.current = new window.Html5QrcodeScanner(
          "mehera-hub-qr-reader", 
          { 
            fps: 30, 
            qrbox: function(viewfinderWidth, viewfinderHeight) {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              const edgeSize = Math.floor(minEdge * 0.65);
              return { width: edgeSize < 180 ? 180 : edgeSize, height: edgeSize < 180 ? 180 : edgeSize };
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
    Swal.fire({
      title: '<span style="font-family: serif; font-style: italic; font-size: 20px;">QR Scanned!</span>',
      html: '<p style="font-family: sans-serif; color: #10b981; font-size: 12px; font-weight: bold;">Order Reference Captured. Please enter OTP.</p>',
      icon: 'success',
      confirmButtonColor: '#000000'
    });
  };

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
          html: '<p style="font-family: sans-serif; color: #6b7280; font-size: 13px;">Thank you! Your order status has been updated to DELIVERED.</p>',
          icon: 'success',
          confirmButtonColor: '#000000',
          customClass: { popup: 'rounded-[2.5rem] p-8' }
        });
        setScannedOrderId('');
        setVerificationOtp('');
      }
    } catch (err) {
      Swal.fire({ title: 'Verification Failed', text: err.response?.data?.message || 'Invalid OTP.', icon: 'error', confirmButtonColor: '#000000' });
    } finally {
      setVerifying(false);
    }
  };

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    if (!searchOrderId.trim()) return;
    setSearching(true);
    setOrderStatusData(null);
    setIsCopied(false); // සර්ච් කරද්දි කොපි ස්ටේට් එක රීසෙට් කරනවා
    try {
      const res = await api.get(`/orders/${searchOrderId.trim()}`);
      setOrderStatusData(res.data);
    } catch (err) {
      Swal.fire({ title: 'Not Found', text: 'Could not find any details for this Order Reference.', icon: 'warning', confirmButtonColor: '#000000' });
    } finally {
      setSearching(false);
    }
  };

  // 🎯 [NEW]: Tracking ID එක Clipboard එකට Copy කරවන ශ්‍රිතය
  const handleCopyTrackingId = (text) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success('Tracking ID copied to clipboard!');
    
    // තත්පර 2කින් අයිකන් එක ආයෙත් පරණ තත්ත්වයට ගන්නවා මචං
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const getStatusBadge = (status) => {
    const base = "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ";
    if (status === 'requested') return <span className={`${base} bg-yellow-500/10 text-yellow-500 border border-yellow-500/20`}>Requested</span>;
    if (status === 'approved') return <span className={`${base} bg-blue-500/10 text-blue-500 border border-blue-500/20`}>Approved</span>;
    if (status === 'shipped') return <span className={`${base} bg-purple-500/10 text-purple-500 border border-purple-500/20`}>Shipped</span>;
    if (status === 'delivered') return <span className={`${base} bg-green-500/10 text-green-500 border border-green-500/20`}>Delivered</span>;
    return <span className={`${base} bg-gray-500/10 text-gray-500 border border-gray-500/20`}>{status}</span>;
  };

  const getOrderTypeBadge = (type) => {
    const base = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest mt-1.5 border ";
    if (type === 'online') {
      return (
        <span className={`${base} bg-sky-500/10 text-sky-500 border-sky-500/20 shadow-sm`}>
          <Globe size={11} /> Online Order
        </span>
      );
    }
    return (
      <span className={`${base} bg-[#b4a460]/10 text-primary border-primary/20 shadow-sm`}>
        <Award size={11} /> Professional Order
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background font-sans text-textMain pt-28 flex flex-col justify-between transition-all duration-500">
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

      {/* --- Main Page Content --- */}
      <main className="max-w-5xl w-full mx-auto px-6 py-12 flex-1 text-left space-y-8">
        
        {/* Page Top Intro */}
        <div className="flex items-center gap-4 border-b border-border pb-6">
          <div className="p-3.5 bg-black text-primary rounded-2xl shadow-xl"><QrCode size={26} /></div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif leading-none text-textMain">Customer <span className="italic text-primary">Operations Hub</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-textMain/40 mt-1.5">Verify package delivery and track live lifecycle states</p>
          </div>
        </div>

        {/* Dynamic Inner Box Container Layout */}
        <div className="bg-card border border-border rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col">
          
          {/* Responsive Tabs Switcher */}
          <div className="flex border-b border-border bg-background/50 sm:px-6 pt-2 gap-2 sm:gap-4 overflow-x-auto w-full no-scrollbar">
            <button
              type="button"
              onClick={() => { setActiveTab('verify'); setIsCustomerScannerOpen(false); }}
              className={`pb-3.5 px-6 text-[11px] sm:text-xs font-black uppercase tracking-widest transition-all border-b-2 text-center whitespace-nowrap ${activeTab === 'verify' ? 'border-primary text-primary' : 'border-transparent text-textMain/40 hover:text-textMain'}`}
            >
              Verify Secure Delivery
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('status'); setIsCustomerScannerOpen(false); }}
              className={`pb-3.5 px-6 text-[11px] sm:text-xs font-black uppercase tracking-widest transition-all border-b-2 text-center whitespace-nowrap ${activeTab === 'status' ? 'border-primary text-primary' : 'border-transparent text-textMain/40 hover:text-textMain'}`}
            >
              Trace Order Status
            </button>
          </div>

          {/* Form Content Wrapper */}
          <div className="p-6 sm:p-10 bg-card">
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
                        <h4 className="text-[10px] font-black text-textMain/40 uppercase tracking-widest mb-1.5">Manifest Status</h4>
                        {getStatusBadge(orderStatusData.order_status)}
                      </div>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="flex flex-col md:grid md:grid-cols-4 gap-6 md:gap-2 text-left md:text-center relative pt-2">
                      <div className="hidden md:block absolute top-6 left-[12.5%] right-[12.5%] h-[2px] bg-border z-0">
                        <div className="h-full bg-primary transition-all duration-500" style={{ width: orderStatusData.order_status === 'requested' ? '0%' : orderStatusData.order_status === 'approved' ? '33.3%' : orderStatusData.order_status === 'shipped' ? '66.6%' : '100%' }} />
                      </div>
                      
                      {[
                        { label: 'Requested', icon: Clock, key: 'requested' },
                        { label: 'Approved', icon: Package, key: 'approved' },
                        { label: 'Shipped', icon: Truck, key: 'shipped' },
                        { label: 'Delivered', icon: CheckCircle, key: 'delivered' }
                      ].map((step, idx) => {
                        const Icon = step.icon;
                        const orderStatusOrder = ['requested', 'approved', 'shipped', 'delivered'];
                        const currentIdx = orderStatusOrder.indexOf(orderStatusData.order_status);
                        const isDone = currentIdx >= idx;

                        return (
                          <div key={step.key} className="flex flex-row md:flex-col items-center md:justify-start gap-4 md:gap-0 z-10 relative">
                            {idx < 3 && <div className={`md:hidden absolute left-5 top-10 w-[2px] h-10 bg-border ${currentIdx > idx ? 'bg-primary' : ''}`} />}
                            <div className={`p-2.5 sm:p-3 rounded-full border transition-all ${isDone ? 'bg-black text-primary border-primary shadow-lg' : 'bg-card text-textMain/20 border-border'}`}><Icon size={14} /></div>
                            <span className={`text-[10px] font-black uppercase tracking-wider md:mt-3 ${isDone ? 'text-textMain' : 'text-textMain/30'}`}>{step.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* 🎯 [FIXED & ADDED COPY BUTTON AREA]: Courier Tracking ID එක ළඟින් Click-to-Copy බටන් එකක් හැදුවා මචං */}
                    {orderStatusData.tracking_id && (
                      <div className="bg-card p-4 rounded-xl border border-border flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
                        <span className="font-black text-textMain/40 uppercase tracking-widest text-[9px]">Courier Waybill Tracking:</span>
                        <div className="flex items-center gap-2 bg-background/50 pl-3 pr-2 py-1.5 rounded-lg border border-border w-full sm:w-auto justify-between sm:justify-start">
                          <span className="font-mono font-black text-primary text-sm tracking-wider truncate max-w-[200px]">
                            {orderStatusData.tracking_id}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyTrackingId(orderStatusData.tracking_id)}
                            className="p-1.5 hover:bg-primary/10 rounded-md text-textMain/60 hover:text-primary transition-all active:scale-90"
                            title="Copy Waybill Number"
                          >
                            {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                          </button>
                        </div>
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