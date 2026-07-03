// src/pages/roles/LogisticsDashboard.jsx
import React, { useEffect, useState, useRef } from 'react';
import api from '../../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { MySwal } from '../utils/swalConfig';
import { useReactToPrint } from 'react-to-print';
import { 
    Truck, MapPin, Package, Phone, User,
    Globe, Store, RefreshCw, CheckCircle, Printer, ScanLine, QrCode, X,
    Calendar, Loader2, Info, AlertTriangle
} from 'lucide-react';
import jsPDF from 'jspdf'; // For creating PDF documents
import html2canvas from 'html2canvas-pro';
import QRCodeLib from 'qrcode'; // Use the 'qrcode' library for canvas-based generation

// --- PDF Generation Utilities ---

/**
 * A utility to wait for the next browser paint, ensuring the DOM is ready.
 * This is crucial for libraries like html2canvas that read from the DOM.
 */
const waitForPaint = () => new Promise(resolve => requestAnimationFrame(resolve));

/**
 * A utility to introduce a small delay.
 * @param {number} ms - Milliseconds to sleep.
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Waits for all media elements (images, SVGs) and fonts within a given element to be fully loaded.
 * This is essential for ensuring that html2canvas captures the complete and final state of the content.
 * @param {HTMLElement} element - The container element to check for media.
 */
const prepareForCanvasCapture = async (element) => {
    if (!element) return;

    // Wait for the next browser paint to ensure the DOM is up-to-date.
    await waitForPaint();

    // A small extra delay can help with complex layouts or SVGs rendered by React.
    await sleep(200);

    // Wait for all fonts to be loaded and ready.
    if (document.fonts) {
        await document.fonts.ready;
    }

    // Wait for all images to be loaded (if any).
    // Empty src images are skipped to avoid react-to-print/html2canvas preload warnings.
    const images = Array.from(element.querySelectorAll("img"));
    await Promise.all(
        images.map(img => {
            const src = img.getAttribute("src");
            if (!src) return Promise.resolve();
            if (img.complete && img.naturalHeight !== 0) return Promise.resolve();

            return new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve; // Don't block on failed images.
            });
        })
    );
};

const generateQrDataUrl = (value, size = 400) => {
    return QRCodeLib.toDataURL(value, {
        errorCorrectionLevel: 'H',
        width: size,
        margin: 1,
    });
};

/**
 * A robust QR Code component that renders to a canvas and displays as an image.
 * This avoids SVG and external URL issues with html2canvas.
 * @param {object} props - Component props.
 * @param {string} props.value - The value to encode in the QR code.
 * @param {number} [props.size=144] - The size of the QR code in pixels.
 * @param {string} [props.className=""] - Additional classes for the image element.
 */
const CanvasQRCode = ({ value, size = 144, className = "" }) => {
    const [dataUrl, setDataUrl] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        if (value) {
            QRCodeLib.toDataURL(value, {
                errorCorrectionLevel: 'H',
                width: size * 2, // Render at 2x resolution for better quality
                margin: 1,
            })
            .then(url => {
                setDataUrl(url);
                setError(false);
            })
            .catch(err => {
                console.error('QR Code generation failed:', err);
                setError(true);
            });
        }
    }, [value, size]);

    if (error) return <div style={{ width: size, height: size }} className="flex items-center justify-center bg-red-100 text-xs text-red-600 p-2 text-center">QR Gen Error</div>;
    if (!dataUrl) return <div style={{ width: size, height: size }} className="flex items-center justify-center bg-gray-100 text-xs">...</div>;

    return <img src={dataUrl} alt={`QR Code for ${value}`} width={size} height={size} className={className} />;
};

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

    const isMobileDevice = window.innerWidth < 768; // Mobile/Tablet check


    const fetchOrders = async (showLoader = true) => {
        if (!token) return;
        if (showLoader) setLoading(true);
        try {
            const res = await api.get('/orders/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const logisticsQueue = res.data.filter(o => ['approved', 'shipped', 'handed_over', 'handed_over_delivery'].includes(o.order_status));
            setOrders(logisticsQueue);
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
            title: `Confirm Status Shift?`,
            text: `Are you sure you want to transition this package to "${newStatus.replace('_', ' ').toUpperCase()}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Confirm Shift',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#000000',
            reverseButtons: true,
        });

        if (result.isDismissed) return;

        if (result.isConfirmed) {
            try {
                const res = await api.put(`/orders/update-order-status/${orderId}`, 
                    { status: newStatus }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                toast.success(`Status successfully updated to ${newStatus}!`);
                
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

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `ShippingLabel_${orderToPrint?.order_id?.substring(0,8) || 'Mehera'}`,
        pageStyle: `@page { size: 10cm 12cm; margin: 0; }`,
        onAfterPrint: () => setIsReadyToPrint(false)
    });

    // 💡 Mobile-safe PDF generation
    // First code UI/styles are preserved. Only the capture logic is hardened.
    const generatePdf = async (element, filename) => {
        if (!element) return;

        const toastId = toast.loading("Generating PDF...");
        try {
            // Wait until React DOM, fonts and QR image are fully ready.
            await prepareForCanvasCapture(element);
            await sleep(300);

            const isMobileDeviceNow = window.innerWidth < 768;

            const canvas = await html2canvas(element, {
                scale: isMobileDeviceNow ? 3 : 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff",
                logging: false,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
                // Important: mobile browsers can generate blank pages when this is true.
                foreignObjectRendering: !isMobileDeviceNow
            });

            if (!canvas || canvas.width === 0 || canvas.height === 0) {
                throw new Error("Canvas capture failed. Empty canvas generated.");
            }

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "cm",
                format: [10, 12]
            });

            pdf.addImage(imgData, "PNG", 0, 0, 10, 12);
            pdf.save(filename);

            toast.success("PDF Downloaded!", { id: toastId });
        } catch (err) {
            console.error("PDF Generation Error:", err);
            toast.error("Failed to generate PDF.", { id: toastId });
        }
    };

    const handlePrintQR = async (order) => {
        if (order.order_type === 'online' && !order.tracking_id) {
            const { value: formValues } = await MySwal.fire({
                title: '<span style="font-family:serif; font-style:italic; font-size:22px;">Logistics Allocation</span>',
                html: `
                    <div style="text-align: left; font-family: sans-serif; display: flex; flex-direction: column; gap: 12px; width: 100%;">
                        <div style="margin-bottom: 14px; width: 100%;">
                            <label style="font-size: 10px; font-weight: 900; text-transform: uppercase; tracking: 0.1em; color: #6b7280; display:block; margin-bottom:6px;">Select Courier Service</label>
                            <select id="swal-courier-name" style="width: 100%; border: 1px solid #e5e7eb; border-radius: 12px; font-size: 13px; outline: none; background: #fff; height: 45px; padding: 0 10px;">
                                <option value="Domex">Domex Logistics</option>
                                <option value="Pronto">Pronto Lanka</option>
                                <option value="Koombiyo">Koombiyo</option>
                            </select>
                        </div>
                        <div style="width: 100%;">
                            <label style="font-size: 10px; font-weight: 900; text-transform: uppercase; tracking: 0.1em; color: #6b7280; display:block; margin-bottom:6px;">Courier Tracking ID</label>
                            <input id="swal-tracking-id" placeholder="e.g. DPD-12345678" style="width: 100%; border: 1px solid #e5e7eb; border-radius: 12px; font-size: 13px; outline: none; height: 45px; padding: 0 12px; box-sizing: border-box;" />
                        </div>
                    </div>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Save & Print',
                confirmButtonColor: '#000000',
                customClass: { popup: 'rounded-[2rem] p-6' },
                preConfirm: () => {
                    const courier_name = document.getElementById('swal-courier-name').value;
                    const tracking_id = document.getElementById('swal-tracking-id').value.trim();
                    if (!tracking_id) { MySwal.showValidationMessage('Tracking ID is mandatory for online orders!'); return false; }
                    return { courier_name, tracking_id };
                }
            });

            if (formValues) {
                try {
                    await api.put(`/orders/update-tracking/${order.order_id}`, formValues, { headers: { Authorization: `Bearer ${token}` } });
                    await api.put(`/orders/update-order-status/${order.order_id}`, { status: 'shipped' }, { headers: { Authorization: `Bearer ${token}` } });
                    
                    toast.success("Logistics Ledger Updated!");
                    const updatedOrder = { ...order, tracking_id: formValues.tracking_id, courier_name: formValues.courier_name, order_status: 'shipped' };
                    
                    const qrUrl = await generateQrDataUrl(updatedOrder.order_id);
                    setOrderToPrint({ ...updatedOrder, qrDataUrl: qrUrl });

                    setIsReadyToPrint(true);
                    fetchOrders(false);
                } catch (err) { toast.error("Failed to save logistics details."); }
            }
        } else {
            const qrUrl = await generateQrDataUrl(order.order_id);
            setOrderToPrint({ ...order, qrDataUrl: qrUrl });
            setIsReadyToPrint(true);
        }
    };

    useEffect(() => {
        if (isReadyToPrint && orderToPrint) {
            const processPrint = async () => {
                // Give React time to render the hidden label and QR image.
                await sleep(300);
                await prepareForCanvasCapture(printRef.current);

                const isMobileDeviceNow = window.innerWidth < 768;

                if (isMobileDeviceNow) {
                    await generatePdf(
                        printRef.current,
                        `ShippingLabel_${orderToPrint?.order_id?.substring(0,8) || 'Mehera'}.pdf`
                    );
                    setIsReadyToPrint(false);
                } else {
                    handlePrint();
                }
            };

            processPrint();
        }
    }, [isReadyToPrint, orderToPrint, handlePrint]);

    const handleBulkPrintAction = useReactToPrint({
        contentRef: bulkPrintRef,
        documentTitle: `Bulk_ShippingLabels_${new Date().toISOString().slice(0,10)}`,
        pageStyle: `@page { size: A4 portrait; margin: 5mm; }`,
        onAfterPrint: () => setIsBulkReadyToPrint(false)
    });

    const generateBulkPdf = async (element, filename) => {
        if (!element) return;

        const toastId = toast.loading('Generating Bulk PDF...');
        try {
            await prepareForCanvasCapture(element);
            await sleep(300);

            const isMobileDeviceNow = window.innerWidth < 768;

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
                // Important for mobile: avoids blank pages with html2canvas/html2canvas-pro.
                foreignObjectRendering: !isMobileDeviceNow
            });

            if (!canvas || canvas.width === 0 || canvas.height === 0) {
                throw new Error("Canvas capture failed. Empty bulk canvas generated.");
            }

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
            const imgHeight = canvasHeight / ratio;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position -= pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
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
            const processBulkPrint = async () => {
                // Wait until all bulk labels and QR images are rendered.
                await sleep(300);
                await prepareForCanvasCapture(bulkPrintRef.current);

                const isMobileDeviceNow = window.innerWidth < 768;

                if (isMobileDeviceNow) {
                    await generateBulkPdf(
                        bulkPrintRef.current,
                        `Bulk_ShippingLabels_${new Date().toISOString().slice(0,10)}.pdf`
                    );
                    setIsBulkReadyToPrint(false);
                } else {
                    handleBulkPrintAction();
                }
            };

            processBulkPrint();
        }
    }, [isBulkReadyToPrint, bulkOrdersToPrint, handleBulkPrintAction]);

    const handleBulkPrint = async () => {
        const printableOrders = orders.filter(o => {
            if (o.order_type === 'online') return !!o.tracking_id;
            return true;
        });
        if (printableOrders.length === 0) {
            toast.error("No valid orders to print. Ensure online orders have a tracking ID.");
            return;
        }
        const toastId = toast.loading('Preparing bulk labels...');
        try {
            const ordersWithQr = await Promise.all(
                printableOrders.map(async (order) => {
                    const qrUrl = await generateQrDataUrl(order.order_id, 200); // Smaller size for bulk
                    return { ...order, qrDataUrl: qrUrl };
                })
            );
            setBulkOrdersToPrint(ordersWithQr); 
            setIsBulkReadyToPrint(true);
            toast.success('Labels ready for printing.', { id: toastId });
        } catch (error) {
            toast.error('Failed to generate QR codes for bulk print.', { id: toastId });
        }
    };

    useEffect(() => {
        let html5QrcodeScanner = null;
        if (isScannerOpen) {
            const initScanner = () => {
                html5QrcodeScanner = new window.Html5QrcodeScanner("mehera-qr-reader", { fps: 30, qrbox: { width: 250, height: 250 }, videoConstraints: { facingMode: "environment" } }, false);
                html5QrcodeScanner.render(onScanSuccess, () => {});
            };
            if (!window.Html5QrcodeScanner) {
                const script = document.createElement('script'); script.src = "https://unpkg.com/html5-qrcode"; script.async = true; script.onload = initScanner; document.body.appendChild(script);
            } else { initScanner(); }
        }
        return () => { if (html5QrcodeScanner) html5QrcodeScanner.clear().catch(e => console.error(e)); };
    }, [isScannerOpen]);

    // 📷 [🎯 ULTRA FIXED SCANNER DISPATCH ROUTER]: 
    const onScanSuccess = (decodedText) => {
        setIsScannerOpen(false);
        const orderExists = orders.find(o => o.order_id === decodedText);
        
        if (orderExists) {
            // 🚀 ඔයා ඉල්ලපු විදිහටම ඔන්ලයින් නම් Courier, සේල්ස් රෙප් නම් Delivery Person වෙන විදිහටම විතරක් මෙතනින් රූට් වෙනවා මචං!
            if (orderExists.order_type === 'online') {
                handleStatusUpdate(decodedText, 'handed_over');
            } else {
                handleStatusUpdate(decodedText, 'handed_over_delivery');
            }
        } else {
            toast.error("Scanned Order is not in your Dispatch Queue!");
        }
    };

    const onlineOrders = orders.filter(o => o.order_type === 'online');
    const offlineOrders = orders.filter(o => o.order_type === 'offline' || !o.order_type);
    const displayedOrders = activeTab === 'online' ? onlineOrders : offlineOrders;

    return (
        <div className="w-full mx-auto animate-in fade-in duration-500 pb-10 text-left">
            <style>{`
                #mehera-qr-reader span, #mehera-qr-reader a { color: #ffffff !important; opacity: 0.6; }
                #mehera-qr-reader #qr-reader__status_message { color: #ffffff !important; opacity: 1; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; }
                #mehera-qr-reader a[href='https://scanapp.org'] { display: none !important; }
            `}</style>
            
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-serif text-textMain uppercase tracking-tight flex items-center gap-3">
                        <div className="p-2 sm:p-3 bg-black text-primary rounded-2xl shadow-xl"><Truck size={24} /></div>
                        Logistics <span className="italic text-primary">Dispatch</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-textMain/50 mt-2 italic ml-4 sm:ml-16">Manage & dispatch approved registry orders</p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <button onClick={handleBulkPrint} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 bg-card text-textMain border border-border rounded-xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest shadow-sm hover:border-primary hover:text-primary"><Printer size={18} /> Bulk Print</button>
                    <button onClick={() => setIsScannerOpen(true)} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 bg-black text-primary border border-primary rounded-xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest shadow-lg hover:bg-primary hover:text-black"><ScanLine size={18} /> Open Scanner</button>
                    <button onClick={() => fetchOrders()} className="p-3.5 bg-card border border-border rounded-xl text-textMain/50 hover:text-primary shadow-sm shrink-0"><RefreshCw size={18} className={loading ? 'animate-spin text-primary' : ''} /></button>
                </div>
            </div>

            {/* Tabs Layer */}
            <div className="flex flex-col sm:flex-row gap-2 bg-card p-1.5 rounded-2xl border border-border w-full shadow-sm mb-6">
                <button onClick={() => setActiveTab('online')} className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 text-[10px] sm:text-[11px] font-black uppercase tracking-widest rounded-xl ${activeTab === 'online' ? 'bg-black text-primary shadow-lg' : 'text-textMain/50 hover:text-textMain'}`}><Globe size={16} /> Online Orders <span className="ml-2 bg-primary/20 text-primary px-2 py-0.5 rounded-md">{onlineOrders.length}</span></button>
                <button onClick={() => setActiveTab('offline')} className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 text-[10px] sm:text-[11px] font-black uppercase tracking-widest rounded-xl ${activeTab === 'offline' ? 'bg-black text-primary shadow-lg' : 'text-textMain/50 hover:text-textMain'}`}><Store size={16} /> Offline/Retail Orders <span className="ml-2 bg-primary/20 text-primary px-2 py-0.5 rounded-md">{offlineOrders.length}</span></button>
            </div>

            {/* Orders Feed */}
            {loading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-primary" size={40} /><p className="text-xs font-black uppercase tracking-widest text-textMain/50">Syncing Dispatch Queue...</p></div>
            ) : displayedOrders.length === 0 ? (
                <div className="py-24 text-center border border-dashed border-border rounded-[2rem] bg-card/30"><Package className="mx-auto text-textMain/20 mb-4" size={48} /><h3 className="text-lg font-black text-textMain/50 uppercase tracking-widest">Queue is Clear</h3></div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {displayedOrders.map(order => (
                        <div key={order.order_id} className="bg-card border border-border rounded-[2rem] p-5 sm:p-6 md:p-8 shadow-sm flex flex-col gap-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                            <div className="flex flex-wrap justify-between items-start gap-y-3 border-b border-border pb-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-textMain/50 mb-0.5">Dispatch Ref</p>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                        <p className="font-mono font-black text-primary text-base sm:text-lg leading-none">#{order.order_id.substring(0, 8).toUpperCase()}</p>
                                        <span className="text-[9px] font-black uppercase tracking-widest bg-card text-textMain/50 border border-border px-2 py-0.5 rounded">
                                            Stage: {order.order_status.replace(/_/g, ' ')}
                                        </span>
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

                            {/* 🕹️ ACTIONS HIGHWAY MATRIX PANEL */}
                            <div className="border-t border-border pt-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <p className="text-sm font-black text-textMain uppercase tracking-widest w-full sm:w-auto text-center sm:text-left">
                                    Net Value: <span className="text-primary text-lg sm:text-xl tracking-tighter ml-2 whitespace-nowrap">LKR {Number(order.total_amount).toLocaleString()}</span>
                                </p>
                                
                                <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                                    <button onClick={() => handlePrintQR(order)} className="w-full sm:w-auto px-5 py-3 bg-card text-textMain border border-border font-black text-[10px] sm:text-[11px] uppercase tracking-widest rounded-xl hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2">
                                        <Printer size={15}/> Print Label & QR
                                    </button>

                                    {/* 🔵 Online Orders: Stage 3 -> Stage 4 (Courier Handover) */}
                                    {order.order_status === 'shipped' && order.order_type === 'online' && (
                                        <button onClick={() => handleStatusUpdate(order.order_id, 'handed_over')} className="w-full sm:w-auto px-6 py-3 bg-black text-primary border border-primary/30 font-black text-[10px] sm:text-[11px] uppercase tracking-widest rounded-xl hover:bg-primary hover:text-black transition-all">
                                            Hand over to Courier
                                        </button>
                                    )}

                                    {/* 🟢 Offline / Sales Rep Orders: Stage 3 -> Stage 4 (Delivery Person Handover) */}
                                    {order.order_status === 'shipped' && order.order_type !== 'online' && (
                                        <button onClick={() => handleStatusUpdate(order.order_id, 'handed_over_delivery')} className="w-full sm:w-auto px-6 py-3 bg-black text-primary border border-primary/30 font-black text-[10px] sm:text-[11px] uppercase tracking-widest rounded-xl hover:bg-primary hover:text-black transition-all">
                                            Hand over to Delivery Person
                                        </button>
                                    )}

                                    {/* 🔵 Online Resolution Gateways */}
                                    {order.order_status === 'handed_over' && order.order_type === 'online' && (
                                        <div className="flex flex-wrap items-center gap-2 bg-background p-2 rounded-xl border border-border w-full sm:w-auto justify-center">
                                            <span className="text-[9px] font-black uppercase text-textMain/40 px-1">Admin Resolution:</span>
                                            <button onClick={() => handleStatusUpdate(order.order_id, 'delivered')} className="bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 hover:bg-green-500 hover:text-white transition-all">
                                                <CheckCircle size={12}/> Confirm Delivered
                                            </button>
                                            <button onClick={() => handleStatusUpdate(order.order_id, 'returned')} className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 hover:bg-red-500 hover:text-white transition-all">
                                                <AlertTriangle size={12}/> Mark Returned
                                            </button>
                                        </div>
                                    )}

                                    {/* 🟢 Offline / Sales Rep Resolution Gateway */}
                                    {order.order_status === 'handed_over_delivery' && order.order_type !== 'online' && (
                                        <button onClick={() => handleStatusUpdate(order.order_id, 'delivered')} className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-black text-[10px] sm:text-[11px] uppercase tracking-widest rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2">
                                            <CheckCircle size={15}/> Complete Delivery
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Scanner Modal Overlay */}
            {isScannerOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-border">
                        <div className="p-4 border-b border-border bg-background flex justify-between items-start gap-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0"><QrCode size={20} /></div>
                                <div>
                                    <h3 className="text-base font-black uppercase text-textMain tracking-tight">Scan Dispatch QR</h3>
                                    <p className="text-[10px] font-bold text-textMain/50 uppercase tracking-widest">Automated Logistics Router Mode</p>
                                </div>
                            </div>
                            <button onClick={() => setIsScannerOpen(false)} className="p-2 bg-card border border-border rounded-full text-textMain/50 hover:text-red-500 transition-all shrink-0"><X size={18} /></button>
                        </div>
                        <div className="p-4 bg-background">
                            <div id="mehera-qr-reader" className="w-full rounded-2xl overflow-hidden border-2 border-primary/30 shadow-inner bg-black min-h-[300px]"></div>
                            <div className="mt-4 flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                                <Info size={16} className="shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">Align the QR code from the printed shipping label within the frame. The system will auto-route the package status tracking ledger step.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Print Container */}
            <div className="fixed left-[-9999px] top-0 pointer-events-none" style={{ zIndex: -1 }}>
                <div ref={printRef} className="print-label-container bg-white text-black p-6 flex flex-col items-center justify-start border-2 border-dashed border-black" style={{ width: '10cm', minHeight: '12cm', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', boxSizing: 'border-box' }}>
                    {orderToPrint ? (
                        <>
                            <div className="w-full text-center border-b-2 border-black pb-2 mb-4">
                                <h2 className="text-xl font-black uppercase tracking-widest text-black">Mehera Dispatch</h2>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-black">Official Shipping Label</p>
                            </div>
                            
                            <div className="flex justify-center items-center w-full mb-4">
                                <img src={orderToPrint.qrDataUrl} alt="QR" className="w-36 h-36" />
                            </div>
                            
                            <p className="text-[10px] font-mono font-black tracking-widest mb-4 bg-black text-white px-3 py-1">
                                #{orderToPrint.order_id.substring(0, 8).toUpperCase()}
                            </p>
                            
                            <div className="w-full text-left space-y-1 mb-4 border-t border-black pt-2">
                                <p className="text-[8px] font-black uppercase text-gray-500">To:</p>
                                <p className="text-sm font-black uppercase text-black leading-tight">{orderToPrint.customer_name || orderToPrint.customer?.saloon_name}</p>
                                <p className="text-[10px] font-bold uppercase text-black mt-1 leading-snug">{orderToPrint.shipping_address}</p>
                            </div>
                            
                            <div className="w-full border-t-2 border-black mt-auto pt-2 text-center">
                                <p className="text-[8px] font-black uppercase text-gray-500">Net Value to Collect</p>
                                <p className="text-xl font-black text-black">LKR {Number(orderToPrint.total_amount).toLocaleString()}.00</p>
                            </div>
                            
                            {orderToPrint.tracking_id && (
                                <div className="mt-3 w-full bg-black text-white text-center py-1.5">
                                    <p className="text-[10px] font-mono font-black tracking-widest uppercase text-white">
                                        {orderToPrint.courier_name ? orderToPrint.courier_name.toUpperCase() : 'COURIER'}: {orderToPrint.tracking_id}
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-sm">Loading...</div>
                    )}
                </div>
            </div>

            {/* Hidden Bulk Print Component */}
            <div className="fixed left-[-9999px] top-0 pointer-events-none" style={{ zIndex: -1 }}>
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
                                        <img src={order.qrDataUrl} alt="QR" className="w-24 h-24" />
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
                                            <p className="text-[6px] font-mono font-black tracking-widest uppercase text-white">
                                                {order.courier_name ? order.courier_name.toUpperCase().substring(0,4) : 'TRK'}: {order.tracking_id}
                                            </p>
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

            {/* 🎯 [THE FINAL LOGISTICS PRINT SEGREGATOR ENGINE]: සිංගල් සහ බල්ක් වෙන වෙනම ප්‍රින්ට් එකට ෆෝස් කරන ලොජික් එක */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body * { visibility: hidden !important; }
                    ${isBulkReadyToPrint ? 
                      '.print-bulk-container, .print-bulk-container * { visibility: visible !important; } .print-bulk-container { position: absolute !important; left: 0 !important; top: 0 !important; width: 210mm !important; }' :
                      '.print-label-container, .print-label-container * { visibility: visible !important; } .print-label-container { position: absolute !important; left: 0 !important; top: 0 !important; width: 10cm !important; height: 12cm !important; }'
                    }
                }
            `}} />
        </div>
    );
};
export default LogisticsDashboard;