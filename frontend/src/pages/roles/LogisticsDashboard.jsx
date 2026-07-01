import React, { useEffect, useState, useRef } from 'react';
import api from '../../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { MySwal } from '../utils/swalConfig';
import { useReactToPrint } from 'react-to-print';
import { 
    Truck, MapPin, Package, Phone, User,
    Globe, Store, RefreshCw, CheckCircle, Printer, ScanLine, QrCode, X,
    Calendar, Loader2, Info
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const LogisticsDashboard = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('online');
    
    const [orderToPrint, setOrderToPrint] = useState(null);
    const [isReadyToPrint, setIsReadyToPrint] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const printRef = useRef(null);
    
    const [bulkOrdersToPrint, setBulkOrdersToPrint] = useState([]);
    const [isBulkReadyToPrint, setIsBulkReadyToPrint] = useState(false);
    const bulkPrintRef = useRef(null);

    const fetchOrders = async (showLoader = true) => {
        if (!token) return;
        if (showLoader) setLoading(true);
        try {
            const res = await api.get('/orders/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // 🛡️ Filter only 'approved' orders
            const approvedOrders = res.data.filter(o => o.order_status === 'approved');
            setOrders(approvedOrders);
        } catch (err) {
            console.error("Error fetching logistics orders", err);
            toast.error('Failed to load dispatch queue');
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, [token]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        const result = await MySwal.fire({
            title: 'Confirm Dispatch?',
            text: `Marking this order as "${newStatus}" will remove it from the pending dispatch queue. Proceed?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Dispatch Order',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        });

        // 🛡️ Explicitly handle cancellation
        if (result.isDismissed) {
            return; // Stop execution if the user cancels
        }

        if (result.isConfirmed) {
            try {
                const res = await api.put(`/orders/update-order-status/${orderId}`, 
                    { status: newStatus }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                toast.success(`Order successfully marked as ${newStatus}!`);
                
                if (res.data.whatsappUrl) {
                    MySwal.fire({
                        title: 'Send Notification',
                        text: 'Open WhatsApp to send the tracking & OTP link to the customer.',
                        icon: 'success',
                        showCancelButton: true,
                        confirmButtonText: 'Open WhatsApp',
                        cancelButtonText: 'Cancel',
                        allowOutsideClick: false
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.open(res.data.whatsappUrl, '_blank');
                        }
                    });
                }
                
                fetchOrders(false); 
            } catch (err) {
                toast.error(err.response?.data?.message || "Failed to update status.");
            }
        }
    };

    const triggerPrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `ShippingLabel_${orderToPrint?.order_id?.substring(0,8) || 'Mehera'}`,
        pageStyle: `@page { size: 10cm 12cm; margin: 0; }`,
        onAfterPrint: () => setIsReadyToPrint(false)
    });

    // 💡 PDF Generation for Mobile
    const generatePdf = async (element, filename) => {
        if (!element) return;
        const toastId = toast.loading('Generating PDF...');
        try {
            const canvas = await html2canvas(element, {
                scale: 2, // Higher quality for crisp text
                useCORS: true,
                backgroundColor: '#ffffff',
                foreignObjectRendering: true // Fix for modern CSS color functions like oklch()
            });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'cm',
                format: [10, 12] // Match the print CSS size
            });

            pdf.addImage(imgData, 'PNG', 0, 0, 10, 12);
            pdf.save(filename);
            toast.success('PDF downloaded!', { id: toastId });
        } catch (error) {
            console.error("Error generating PDF", error);
            toast.error('Failed to generate PDF.', { id: toastId });
        }
    };

    // ⏳ State එක අප්ඩේට් වෙලා QR එක Load වෙනකම් ඉඳලා Print එක Trigger කිරීම
    useEffect(() => {
        if (isReadyToPrint && orderToPrint) {
            const isMobileDevice = window.innerWidth < 768; // Mobile/Tablet check
            const timer = setTimeout(() => {
                if (isMobileDevice) {
                    // 📱 Mobile: Download as PDF
                    generatePdf(printRef.current, `ShippingLabel_${orderToPrint?.order_id?.substring(0,8) || 'Mehera'}.pdf`);
                    setIsReadyToPrint(false); // Reset state
                } else {
                    // 🖥️ Desktop: Open print dialog
                    triggerPrint();
                }
            }, 800); // Wait for QR code to load
            return () => clearTimeout(timer);
        }
    }, [isReadyToPrint, orderToPrint, triggerPrint]);

    // 🖨️ Bulk Print Trigger
    const triggerBulkPrint = useReactToPrint({
        contentRef: bulkPrintRef,
        documentTitle: `Bulk_ShippingLabels_${new Date().toISOString().slice(0,10)}`,
        pageStyle: `@page { size: A4 portrait; margin: 5mm; }`,
        onAfterPrint: () => setIsBulkReadyToPrint(false)
    });

    // 💡 Bulk PDF Generation for Mobile
    const generateBulkPdf = async (element, filename) => {
        if (!element) return;
        const toastId = toast.loading('Generating Bulk PDF...');
        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
                foreignObjectRendering: true // Fix for modern CSS color functions like oklch()
            });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / pdfWidth;
            const calculatedHeight = canvasHeight / ratio;

            let heightLeft = calculatedHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, calculatedHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position -= pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, calculatedHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save(filename);
            toast.success('Bulk PDF downloaded!', { id: toastId });
        } catch (error) {
            console.error("Error generating bulk PDF", error);
            toast.error('Failed to generate bulk PDF.', { id: toastId });
        }
    };

    useEffect(() => {
        if (isBulkReadyToPrint && bulkOrdersToPrint.length > 0) {
            const isMobileDevice = window.innerWidth < 768; // Mobile/Tablet check
            const timer = setTimeout(() => {
                if (isMobileDevice) {
                    // 📱 Mobile: Download as PDF
                    generateBulkPdf(bulkPrintRef.current, `Bulk_ShippingLabels_${new Date().toISOString().slice(0,10)}.pdf`);
                    setIsBulkReadyToPrint(false); // Reset state
                } else {
                    // 🖥️ Desktop: Open print dialog
                    triggerBulkPrint();
                }
            }, 800); // Wait for QR codes to load
            return () => clearTimeout(timer);
        }
    }, [isBulkReadyToPrint, bulkOrdersToPrint, triggerBulkPrint]);

    // 📦 Handle Bulk Print
    const handleBulkPrint = () => {
        const printableOrders = orders.filter(o => {
            if (o.order_type === 'online') return !!o.tracking_id;
            return true;
        });

        if (printableOrders.length === 0) {
            toast.error("No valid orders to print. Ensure online orders have a tracking ID.");
            return;
        }
        setBulkOrdersToPrint(printableOrders);
        setIsBulkReadyToPrint(true);
    };

    // ️ Handle Print & Tracking ID
    const handlePrintQR = async (order) => {
        if (order.order_type === 'online' && !order.tracking_id) {
            const { value: trackingId } = await MySwal.fire({
                title: 'Enter Courier Tracking ID',
                input: 'text',
                inputLabel: 'Required for online dispatch labels',
                inputPlaceholder: 'e.g. DPD-12345678',
                showCancelButton: true,
                confirmButtonText: 'Save & Print Label',
                inputValidator: (value) => {
                    if (!value) return 'Tracking ID is mandatory for online orders!';
                }
            });

            if (trackingId) {
                try {
                    await api.put(`/orders/update-tracking/${order.order_id}`, 
                        { tracking_id: trackingId }, 
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    toast.success("Tracking ID Updated!");
                    const updatedOrder = { ...order, tracking_id: trackingId };
                    setOrderToPrint(updatedOrder);
                    setIsReadyToPrint(true);
                    fetchOrders(false);
                } catch (err) {
                    toast.error("Failed to save tracking ID.");
                }
            }
        } else {
            setOrderToPrint(order);
            setIsReadyToPrint(true);
        }
    };

    // 📷 Dynamic QR Scanner Initialization
    useEffect(() => {
        let html5QrcodeScanner = null;
        if (isScannerOpen) {
            const initScanner = () => {
                html5QrcodeScanner = new window.Html5QrcodeScanner(
                    "mehera-qr-reader", { fps: 30, qrbox: { width: 250, height: 250 } }, false
                );
                html5QrcodeScanner.render(onScanSuccess, () => {});
            };

            if (!window.Html5QrcodeScanner) {
                const script = document.createElement('script');
                script.src = "https://unpkg.com/html5-qrcode";
                script.async = true;
                script.onload = initScanner;
                document.body.appendChild(script);
            } else {
                initScanner();
            }
        }
        return () => {
            if (html5QrcodeScanner) html5QrcodeScanner.clear().catch(e => console.error("Scanner clear error", e));
        };
    }, [isScannerOpen]);

    const onScanSuccess = (decodedText) => {
        setIsScannerOpen(false);
        const orderExists = orders.find(o => o.order_id === decodedText);
        if (orderExists) {
            handleStatusUpdate(decodedText, 'shipped');
        } else {
            toast.error("Scanned Order is not in your Dispatch Queue!");
        }
    };

    const onlineOrders = orders.filter(o => o.order_type === 'online');
    const offlineOrders = orders.filter(o => o.order_type === 'offline' || !o.order_type);
    const displayedOrders = activeTab === 'online' ? onlineOrders : offlineOrders;

    return (
        <div className="w-full mx-auto animate-in fade-in duration-500 pb-10">
            {/* 💅 Scanner UI Override Styles */}
            <style>{`
                #mehera-qr-reader span, 
                #mehera-qr-reader a {
                    color: var(--color-text) !important;
                    opacity: 0.6;
                }
                #mehera-qr-reader #qr-reader__status_message {
                    color: var(--color-text) !important;
                    opacity: 1;
                    font-weight: 700;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }
                #mehera-qr-reader a[href='https://scanapp.org'] {
                    display: none !important;
                }
            `}</style>
            {/* Header Section */}
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-serif text-textMain transition-colors duration-300 uppercase tracking-tight flex items-center gap-3">
                        <div className="p-2 sm:p-3 bg-black text-primary transition-all duration-300 rounded-2xl shadow-xl"><Truck size={24} sm:size={28} /></div>
                        Logistics <span className="italic text-primary transition-all duration-300">Dispatch</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-textMain/50 transition-colors duration-300 mt-2 italic ml-4 sm:ml-16">
                        Manage & dispatch approved registry orders
                    </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <button onClick={handleBulkPrint} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 sm:px-6 sm:py-3.5 bg-card text-textMain border border-border transition-all duration-300 rounded-xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest shadow-sm hover:border-primary hover:text-primary">
                        <Printer size={18} /> Bulk Print
                    </button>
                    <button onClick={() => setIsScannerOpen(true)} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 sm:px-6 sm:py-3.5 bg-black text-primary border border-primary transition-all duration-300 rounded-xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest shadow-lg hover:bg-primary hover:text-black">
                        <ScanLine size={18} /> Open Scanner
                    </button>
                    <button onClick={() => fetchOrders()} className="p-3.5 bg-card border border-border rounded-xl text-textMain/50 hover:text-primary transition-all shadow-sm shrink-0">
                        <RefreshCw size={18} className={loading ? 'animate-spin text-primary' : ''} />
                    </button>
                </div>
            </div>

            {/* Tabs Layer */}
            <div className="flex flex-col sm:flex-row gap-2 bg-card p-1.5 rounded-2xl border border-border transition-colors duration-300 w-full shadow-sm mb-6">
                <button onClick={() => setActiveTab('online')} className={`flex-1 flex justify-center items-center gap-2 px-4 sm:px-8 py-3 text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all rounded-xl ${activeTab === 'online' ? 'bg-black text-primary shadow-lg' : 'text-textMain/50 hover:text-textMain'}`}>
                    <Globe size={16} /> Online Orders <span className="ml-2 bg-primary/20 text-primary px-2 py-0.5 rounded-md">{onlineOrders.length}</span>
                </button>
                <button onClick={() => setActiveTab('offline')} className={`flex-1 flex justify-center items-center gap-2 px-4 sm:px-8 py-3 text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all rounded-xl ${activeTab === 'offline' ? 'bg-black text-primary shadow-lg' : 'text-textMain/50 hover:text-textMain'}`}>
                    <Store size={16} /> Offline/Retail Orders <span className="ml-2 bg-primary/20 text-primary px-2 py-0.5 rounded-md">{offlineOrders.length}</span>
                </button>
            </div>

            {/* Orders Feed */}
            {loading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-primary" size={40} /><p className="text-xs font-black uppercase tracking-widest text-textMain/50">Syncing Dispatch Queue...</p></div>
            ) : displayedOrders.length === 0 ? (
                <div className="py-24 text-center border border-dashed border-border rounded-[2rem] bg-card/30"><Package className="mx-auto text-textMain/20 mb-4" size={48} /><h3 className="text-lg font-black text-textMain/50 uppercase tracking-widest">Queue is Clear</h3><p className="text-xs font-medium text-textMain/40 mt-1">No approved orders pending for dispatch in this channel.</p></div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {displayedOrders.map(order => (
                        <div key={order.order_id} className="bg-card border border-border rounded-[2rem] p-5 sm:p-6 md:p-8 shadow-sm flex flex-col gap-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                            <div className="flex flex-wrap justify-between items-start gap-y-3 border-b border-border pb-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-textMain/50 mb-0.5">Dispatch Ref</p>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                        <p className="font-mono font-black text-primary text-base sm:text-lg leading-none">#{order.order_id.substring(0, 8).toUpperCase()}</p>
                                        {order.tracking_id && (
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/20">
                                                Trk: {order.tracking_id}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-left sm:text-right shrink-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-textMain/50 flex items-center gap-1.5 sm:justify-end"><Calendar size={12}/> Entry Date</p>
                                    <p className="font-bold text-textMain text-sm mt-0.5">{new Date(order.created_at).toLocaleDateString('en-GB')}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                                <div className="flex flex-col space-y-3">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2"><User size={14}/> Destination Profile</p>
                                    <div className="bg-background p-5 rounded-2xl border border-border flex-1 shadow-inner flex flex-col justify-center">
                                        <p className="font-black text-base text-textMain mb-2 truncate">{order.customer_name || order.customer?.saloon_name}</p>
                                        <p className="text-xs text-textMain/60 font-bold mt-1.5 flex items-center gap-2"><Phone size={14} className="text-primary shrink-0"/> <span className="truncate">{order.phone || order.customer?.phone1 || 'No Contact'}</span></p>
                                        <p className="text-xs text-textMain/60 font-bold mt-1.5 flex items-start gap-2 leading-relaxed"><MapPin size={14} className="text-primary shrink-0 mt-0.5"/> <span className="line-clamp-2">{order.shipping_address || 'Address not specified'}</span></p>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-3">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2"><Package size={14}/> Goods Manifest</p>
                                    <div className="bg-background p-4 rounded-2xl border border-border flex-1 max-h-[160px] lg:max-h-[180px] overflow-y-auto custom-scrollbar shadow-inner">
                                        {(order.OrderItems || order.items || []).map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-xs font-bold border-b border-border/60 last:border-0 py-2.5 px-2">
                                                <span className="text-textMain/80 truncate pr-2">{item.variant?.product?.product_name || 'Product'} <span className="text-primary italic ml-1">({item.variant?.variant_name || 'Std'})</span></span>
                                                <span className="bg-card px-2.5 py-1 rounded-md border border-border shrink-0">x{item.qty || item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-border pt-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <p className="text-sm font-black text-textMain uppercase tracking-widest w-full sm:w-auto text-center sm:text-left">
                                    Net Value: <span className="text-primary text-lg sm:text-xl tracking-tighter ml-2 whitespace-nowrap">LKR {Number(order.total_amount).toLocaleString()}</span>
                                </p>
                                <button onClick={() => handlePrintQR(order)} className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-3.5 bg-primary text-black font-black text-[10px] sm:text-[11px] uppercase tracking-widest rounded-xl hover:bg-[#9a8b50] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#b4a460]/20 active:scale-95 shrink-0">
                                    <Printer size={16} sm:size={18}/> Print Label & QR
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 📷 Scanner Modal */}
            {isScannerOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-border">
                        <div className="p-4 sm:p-6 border-b border-border bg-background flex justify-between items-start gap-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0"><QrCode size={20} sm:size={24} /></div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-black uppercase text-textMain tracking-tight">Scan Dispatch QR</h3>
                                    <p className="text-[10px] font-bold text-textMain/50 uppercase tracking-widest">Scan label to mark as shipped</p>
                                </div>
                            </div>
                            <button onClick={() => setIsScannerOpen(false)} className="p-2 bg-card border border-border rounded-full text-textMain/50 hover:text-red-500 transition-all shrink-0"><X size={18} sm:size={20} /></button>
                        </div>
                        <div className="p-4 sm:p-6 bg-background">
                            <div id="mehera-qr-reader" className="w-full rounded-2xl overflow-hidden border-2 border-primary/30 shadow-inner bg-black min-h-[300px]"></div>
                            <div className="mt-4 flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                                <Info size={16} className="shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">Align the QR code from the printed shipping label within the frame. The order will automatically be marked as Shipped.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 🖨️ Hidden Print Component */}
            <div className="absolute -left-[9999px] top-0 opacity-0 pointer-events-none">
                <div ref={printRef} className="print-label-container bg-white text-black p-6 flex flex-col items-center justify-start border-2 border-dashed border-black" style={{ width: '10cm', minHeight: '12cm', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', boxSizing: 'border-box' }}>
                    {orderToPrint ? (
                        <>
                            {/* Header - Fixed Width */}
                            <div className="w-full text-center border-b-2 border-black pb-2 mb-4">
                                <h2 className="text-xl font-black uppercase tracking-widest text-black">Mehera Dispatch</h2>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-black">Official Shipping Label</p>
                            </div>
                            
                            {/* QR Code - Perfectly Centered */}
                            <div className="flex justify-center items-center w-full mb-4">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${orderToPrint.order_id}&margin=0`} alt="QR" className="w-36 h-36" />
                            </div>
                            
                            {/* Order ID */}
                            <p className="text-[10px] font-mono font-black tracking-widest mb-4 bg-black text-white px-3 py-1">
                                #{orderToPrint.order_id.substring(0, 8).toUpperCase()}
                            </p>
                            
                            {/* Customer Details - Left Aligned */}
                            <div className="w-full text-left space-y-1 mb-4 border-t border-black pt-2">
                                <p className="text-[8px] font-black uppercase text-gray-500">To:</p>
                                <p className="text-sm font-black uppercase text-black leading-tight">{orderToPrint.customer_name || orderToPrint.customer?.saloon_name}</p>
                                <p className="text-[10px] font-bold uppercase text-black mt-1 leading-snug">{orderToPrint.shipping_address}</p>
                            </div>
                            
                            {/* Value Section - Bottom Aligned */}
                            <div className="w-full border-t-2 border-black mt-auto pt-2 text-center">
                                <p className="text-[8px] font-black uppercase text-gray-500">Net Value to Collect</p>
                                <p className="text-xl font-black text-black">LKR {Number(orderToPrint.total_amount).toLocaleString()}.00</p>
                            </div>
                            
                            {/* Tracking ID - Full Width */}
                            {orderToPrint.tracking_id && (
                                <div className="mt-3 w-full bg-black text-white text-center py-1.5">
                                    <p className="text-[10px] font-mono font-black tracking-widest uppercase text-white">TRACKING: {orderToPrint.tracking_id}</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-sm">Loading...</div>
                    )}
                </div>
            </div>

            {/* 🖨️ Hidden Bulk Print Component (3x3 Grid) */}
            <div className="absolute -left-[9999px] top-0 opacity-0 pointer-events-none">
                <div ref={bulkPrintRef} className="print-bulk-container bg-white text-black p-2" style={{ width: '210mm', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', boxSizing: 'border-box' }}>
                    {bulkOrdersToPrint.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                            {bulkOrdersToPrint.map((order, idx) => (
                                <div key={idx} className="border-2 border-dashed border-black p-2 flex flex-col items-center justify-start text-center" style={{ height: '94mm', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                                    <div className="w-full text-center border-b border-black pb-1 mb-2">
                                        <h2 className="text-sm font-black uppercase tracking-widest text-black">Mehera Dispatch</h2>
                                        <p className="text-[6px] font-bold uppercase tracking-widest text-black">Official Shipping Label</p>
                                    </div>
                                    
                                    <div className="flex justify-center items-center w-full mb-2">
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${order.order_id}&margin=0`} alt="QR" className="w-24 h-24" />
                                    </div>
                                    
                                    <p className="text-[7px] font-mono font-black tracking-widest mb-2 bg-black text-white px-2 py-0.5">
                                        #{order.order_id.substring(0, 8).toUpperCase()}
                                    </p>
                                    
                                    <div className="w-full text-left space-y-0.5 mb-2 border-t border-black pt-1 flex-1">
                                        <p className="text-[5px] font-black uppercase text-gray-500">To:</p>
                                        <p className="text-[9px] font-black uppercase text-black leading-tight line-clamp-1">{order.customer_name || order.customer?.saloon_name}</p>
                                        <p className="text-[7px] font-bold uppercase text-black leading-tight line-clamp-2">{order.shipping_address}</p>
                                    </div>
                                    
                                    <div className="w-full border-t-2 border-black mt-auto pt-1 text-center">
                                        <p className="text-[5px] font-black uppercase text-gray-500">Net Value to Collect</p>
                                        <p className="text-sm font-black text-black">LKR {Number(order.total_amount).toLocaleString()}.00</p>
                                    </div>
                                    
                                    {order.tracking_id && (
                                        <div className="mt-1 w-full bg-black text-white text-center py-0.5">
                                            <p className="text-[6px] font-mono font-black tracking-widest uppercase text-white">TRK: {order.tracking_id}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-sm text-black">Loading Bulk Labels...</div>
                    )}
                </div>
            </div>

            {/* --- Advanced Print Styles --- */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body * { visibility: hidden !important; }
                    .print-label-container, .print-label-container * { visibility: visible !important; }
                    .print-label-container { position: absolute !important; left: 0 !important; top: 0 !important; }
                    .print-bulk-container, .print-bulk-container * { visibility: visible !important; }
                    .print-bulk-container { position: absolute !important; left: 0 !important; top: 0 !important; }
                }
            `}} />
        </div>
    );
};
export default LogisticsDashboard;