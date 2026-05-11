import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Calendar, User, Hash, Filter, ShoppingBag, RefreshCw, 
    Loader2, Search, ArrowRight, ClipboardList, ChevronDown, ChevronLeft, ChevronRight,
    Trash2, MapPin, Truck, ShoppingCart 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import {MySwal} from '../../utils/swalConfig';

const statusBadge = {
    // pending:   { bg: "bg-primary/10 transition-all duration-300", text: "text-[#8a7b42]", border: "border-primary/20 transition-all duration-300" },
    // completed: { bg: "bg-black/5",      text: "text-textMain transition-colors duration-300",      border: "border-black/10" },
    // cancelled: { bg: "bg-red-50",       text: "text-red-500",    border: "border-red-100" },
    
    requested:  { label: "Requested", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
    approved:   { label: "Approved", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
    rejected:   { label: "Rejected", bg: "bg-red-50", text: "text-red-500", border: "border-red-200" },
    processing: { label: "Processing", bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
    shipped:    { label: "Shipped", bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
    delivered:  { label: "Delivered", bg: "bg-gray-900", text: "text-white", border: "border-border transition-colors duration-300" },
    cancelled:  { label: "Cancelled", bg: "bg-gray-100", text: "text-textMain/50 transition-colors duration-300", border: "border-border transition-colors duration-300" },

};

const ViewOrders = () => {
    const navigate = useNavigate();
    const { token, logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const loggedUser = JSON.parse(localStorage.getItem('user'));
    const isAdmin = loggedUser?.role === 'admin';
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;


    const fetchOrders = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5001/api/orders/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Order Data Check:", res.data);
            setOrders(res.data);
        } catch (err) {
            console.error("Error fetching orders", err);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, [token]);

    const toggleRow = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const filtered = orders.filter((o) => {
        const matchSearch = (o.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
                           (o.order_id || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "All" || o.order_status === statusFilter.toLowerCase();
        return matchSearch && matchStatus;
    });

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filtered.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filtered.length / rowsPerPage);

    // පේජ් මාරු කරන ෆන්ක්ෂන් එක
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleStatusUpdate = async (orderId, newStatus) => {
        const result = await MySwal.fire({
            title: 'Are you sure?',
            text: `You are about to mark this order as "${newStatus}". This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: `Yes, mark as ${newStatus}`,
            cancelButtonText: 'No, keep current status',
            reverseButtons: true,
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                // 💡 මෙන්න මේ Backend route එක උඹේ තිබිය යුතුයි. 
                // නැත්නම් එකක් හදාගන්න (router.put('/update-order-status/:id', ...))
                await axios.put(`http://localhost:5001/api/orders/update-order-status/${orderId}`, 
                    { status: newStatus }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                toast.success(`Order ${newStatus} successfully!`);
                fetchOrders(); 
            } catch (err) {
                console.error("Status Update Error:", err);
                toast.error("Failed to update status.");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="w-full mx-auto animate-in fade-in duration-500 pb-10">

            {/* Header Section */}
            <div className="bg-background transition-all duration-300 px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-5 border-b border-border transition-colors duration-300">
                <div className="flex items-center gap-5">
                    <div className="p-3 bg-primary transition-all duration-300 rounded-2xl text-textMain transition-colors duration-300">
                        <ShoppingBag size={26} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-textMain transition-colors duration-300 uppercase tracking-tight">Order Management</h1>
                        <p className="text-textMain/50 transition-colors duration-300 text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5">Mehera International</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-card transition-colors duration-300 px-5 py-2.5 rounded-2xl border border-border transition-colors duration-300 flex items-center gap-3">
                        <span className="text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest">Total Orders</span>
                        <span className="text-lg font-black text-primary transition-all duration-300">{orders.length}</span>
                    </div>
                    <button onClick={fetchOrders} className="p-3 bg-card transition-colors duration-300 text-textMain/50 transition-colors duration-300 rounded-xl border border-border transition-colors duration-300"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
                </div>
            </div>

            <div className="p-6 md:p-8">
                {/* Search & Filter Bar */}
                <div className="bg-card transition-colors duration-300 border border-border transition-colors duration-300 rounded-[1.5rem] p-4 mb-8 shadow-sm flex flex-col lg:flex-row gap-4">
                    <div className="relative group flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="text-textMain/50 transition-colors duration-300" size={18} /></div>
                        <input type="text" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-card/50 transition-colors duration-300 rounded-xl py-3 pl-11 pr-4 text-sm outline-none" />
                    </div>
                    <div className="flex items-center gap-2">
                        {["All", "Pending", "Completed", "Cancelled"].map((s) => (
                            <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-lg text-[11px] font-black border uppercase ${statusFilter === s ? "bg-primary transition-all duration-300 text-textMain transition-colors duration-300" : "bg-card transition-colors duration-300 text-textMain/50 transition-colors duration-300"}`}>{s}</button>
                        ))}
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-card transition-colors duration-300 rounded-[1.5rem] border border-border transition-colors duration-300 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto w-full custom-scrollbar"> 
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-card/50 transition-colors duration-300 border-b border-border transition-colors duration-300">
                                {["Reference", "Client", "Placed By", "Order Date", "Value (LKR)", "Order Status", "Payment Status", "Actions"].map((h) => (
                                    <th key={h} className="px-6 py-4 text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={8} className="py-20 text-center font-black uppercase text-[10px] tracking-widest text-textMain/50 transition-colors duration-300">Syncing with Registry...</td></tr>
                            ) : currentRows.map((order) => (
                                <React.Fragment key={order.order_id}>
                                    <tr className="group hover:bg-primary/10 transition-all duration-300 relative">
                                        <td className="px-6 py-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0">
                                                    <Hash size={16} className="text-primary transition-all duration-300" />
                                                </div>
                                                <div>
                                                    <p className="text-[12px] font-mono font-black text-textMain transition-colors duration-300">#{order.order_id.substring(0, 8).toUpperCase()}</p>
                                                    <p className="text-[9px] text-textMain/50 transition-colors duration-300 font-black uppercase mt-0.5">Entry ID</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-8">
                                            <p className="text-sm font-black text-textMain transition-colors duration-300 uppercase">{order.customer_name}</p>
                                            <p className="text-[10px] text-textMain/50 transition-colors duration-300 font-bold">{order.phone}</p>
                                        </td>
                                        <td className="px-6 py-8">
                                            {order.creator ? (
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-textMain transition-colors duration-300 uppercase leading-none">
                                                        {order.creator.name}
                                                    </span>
                                                    <span className="text-[9px] text-primary transition-all duration-300 font-bold uppercase mt-1">
                                                        {order.creator.role.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-[9px] text-textMain/50 transition-colors duration-300 font-bold italic uppercase">Registry Admin</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-8 text-sm font-bold text-textMain/50 transition-colors duration-300">
                                            {new Date(order.created_at).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="px-6 py-8">
                                            <span className="text-[10px] font-black text-primary transition-all duration-300 mr-1">LKR</span>
                                            <span className="text-sm font-black text-textMain transition-colors duration-300">{Number(order.total_amount).toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-8">
                                            <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest ${statusBadge[order.order_status?.toLowerCase()]?.bg || 'bg-card transition-colors duration-300'} ${statusBadge[order.order_status?.toLowerCase()]?.text || 'text-textMain/50 transition-colors duration-300'} ${statusBadge[order.order_status?.toLowerCase()]?.border || 'border-border transition-colors duration-300'}`}>
                                                {order.order_status}
                                            </span>
                                        </td>

                                        <td className="px-6 py-8">
                                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest ${
                                        order.payment_method?.toLowerCase() === 'credit' 
                                        ? 'bg-amber-50 border-amber-100 text-amber-600' 
                                         : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                    }`}>
                                         {order.payment_method || 'Cash'}
                                        </span>
                                        </td>


                                        <td className="px-6 py-8 text-right relative">
                                            <div className="flex items-center justify-end gap-3">
                                                <button className="p-2 text-textMain/50 transition-colors duration-300 hover:text-textMain transition-colors duration-300"><ClipboardList size={18} /></button>
                                                <button className="p-2 text-textMain/50 transition-colors duration-300 hover:text-red-500"><Trash2 size={18} /></button>
                                            </div>
                                            <div className="absolute inset-x-0 bottom-1 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                                <button onClick={(e) => { e.stopPropagation(); toggleRow(order.order_id); }} className="pointer-events-auto flex items-center gap-1.5 px-4 py-1 rounded-full bg-card transition-colors duration-300 border border-border transition-colors duration-300 text-[9px] font-black uppercase text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300 hover:border-primary transition-all duration-300 shadow-sm transition-all">
                                                    {expandedOrderId === order.order_id ? 'Close Panel' : 'View Details'} <ChevronDown size={12} className={expandedOrderId === order.order_id ? 'rotate-180' : ''} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Expanded Detail Panel */}
                                    {expandedOrderId === order.order_id && (
                                        <tr className="bg-background transition-all duration-300 animate-in slide-in-from-top-2 duration-300 ">
                                        <td colSpan={8} className="px-10 py-10 border-l-4 border-primary transition-all duration-300">
                                            
                                            {/* --- Row 01: Shipping & Logistics (50/50 split) --- */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                                {/* Shipping Info */}
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-black uppercase text-primary transition-all duration-300 flex items-center gap-2 tracking-[0.2em]">
                                                        <MapPin size={14} /> Shipping Destination
                                                    </h4>
                                                    <p className="text-xs font-bold text-textMain/50 transition-colors duration-300 bg-card transition-colors duration-300 p-5 rounded-[2rem] border border-border transition-colors duration-300 italic leading-relaxed shadow-sm">
                                                        {order.shipping_address}
                                                    </p>
                                                </div>



                                                {/* Logistics Info */}
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-black uppercase text-primary transition-all duration-300 flex items-center gap-2 tracking-[0.2em]">
                                                        <Truck size={14} /> Dispatch Logistics
                                                    </h4>
                                                    <div className="bg-card transition-colors duration-300 p-5 rounded-[2rem] border border-border transition-colors duration-300 space-y-3 shadow-sm">
                                                        <div className="flex justify-between items-center border-b border-border pb-2">
                                                            <span className="text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase">Courier Service</span>
                                                            <span className="text-[11px] font-black text-textMain transition-colors duration-300 uppercase">{order.courier_name || 'Not Assigned'}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase">Tracking ID</span>
                                                            <span className="text-[11px] font-black text-primary transition-all duration-300 font-mono">{order.tracking_id || 'Pending Registry'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                                                                            {/* Payment Method Badge */}


                                            {/* --- Row 02: Items Manifest (Full Width) --- */}
                                            <div className="space-y-4 mb-8">
                                                <h4 className="text-[10px] font-black uppercase text-primary transition-all duration-300 flex items-center gap-2 tracking-[0.2em]">
                                                    <ShoppingCart size={14} /> Itemized Manifest
                                                </h4>
                                                <div className="bg-card transition-colors duration-300 rounded-[2rem] border border-border transition-colors duration-300 overflow-hidden shadow-sm">
                                                    <table className="w-full text-left text-[11px]">
                                                    <thead className="bg-card/50 transition-colors duration-300 border-b border-border transition-colors duration-300">
                                                        <tr className="text-textMain/50 transition-colors duration-300 font-black uppercase tracking-widest">
                                                        <th className="px-8 py-4 w-2/12">Ref</th>
                                                        <th className="px-8 py-4 w-5/12">Description</th>
                                                        <th className="px-8 py-4 w-1/12 text-center">Qty</th>
                                                        <th className="px-8 py-4 w-2/12 text-right">Unit Price</th>
                                                        <th className="px-8 py-4 w-2/12 text-right">Subtotal</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {(order.OrderItems || order.items || []).map((item, idx) => {
                                                        
                                                        // 🛡️ Safe Data Access (Backend එකෙන් එන විවිධ නාමකරණයන් සඳහා)
                                                        const variant = item.variant || item.Variant || item.ProductVariant;
                                                        const product = variant?.product || variant?.Product;

                                                        // ✅ Product Name + Variant Name එකතුව
                                                        const pName = product?.product_name || "Registry Item";
                                                        const vName = variant?.variant_name || "Standard Edition";

                                                        return (
                                                            <tr key={idx} className="hover:bg-card/30 transition-colors duration-300">
                                                            {/* Product Reference */}
                                                            <td className="px-8 py-5 font-mono font-black text-primary transition-all duration-300">
                                                                #{item.product_id?.substring(0, 8).toUpperCase()}
                                                            </td>
                                                            
                                                            {/* Description (Product Name & Variant) */}
                                                            <td className="px-8 py-5 text-left">
                                                                <div className="flex flex-col">
                                                                <span className="text-[11px] font-black text-textMain transition-colors duration-300 uppercase leading-tight">
                                                                    {pName}
                                                                </span>
                                                                <span className="text-[9px] text-textMain/50 transition-colors duration-300 font-bold uppercase tracking-tight italic mt-0.5">
                                                                    {vName}
                                                                </span>
                                                                </div>
                                                            </td>

                                                            <td className="px-8 py-5 text-center font-black text-sm">{item.qty}</td>
                                                            <td className="px-8 py-5 text-right text-textMain/50 transition-colors duration-300 font-bold tabular-nums">
                                                                LKR {Number(item.price).toLocaleString()}
                                                            </td>
                                                            <td className="px-8 py-5 text-right font-black text-textMain transition-colors duration-300 tabular-nums">
                                                                LKR {(Number(item.qty) * Number(item.price)).toLocaleString()}
                                                            </td>
                                                            </tr>
                                                        );
                                                        })}
                                                    </tbody>
                                                    {/* Summary Footer */}
                                                    <tfoot className="bg-card/30 transition-colors duration-300 border-t border-border transition-colors duration-300">
                                                        <tr>
                                                        <td colSpan="4" className="px-8 py-4 text-right text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest">Grand Total Amount</td>
                                                        <td className="px-8 py-4 text-right font-black text-lg text-textMain transition-colors duration-300 tabular-nums">
                                                            LKR {Number(order.total_amount).toLocaleString()}
                                                        </td>
                                                        </tr>
                                                    </tfoot>
                                                    </table>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                {/* Settlement Mode Label with Gold Icon */}
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1 h-3 bg-primary transition-all duration-300 rounded-full"></div> {/* Gold indicator line */}
                                                    <p className="text-[10px] font-black uppercase text-textMain/50 transition-colors duration-300 tracking-widest flex items-center gap-1.5">
                                                    Settlement Mode
                                                    </p>
                                                </div>

                                                {/* Payment Method Badge - Highly Visible */}
                                                <div>
                                                    <span className={`px-4 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-[0.1em] border-2 shadow-sm transition-all flex items-center w-fit gap-2 ${
                                                    order.payment_method === 'credit' 
                                                        ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100/50' 
                                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100/50'
                                                    }`}>
                                                    {/* Icon based on method */}
                                                    <div className={`w-1.5 h-1.5 rounded-full ${order.payment_method === 'credit' ? 'bg-amber-600' : 'bg-emerald-600'}`}></div>
                                                    {order.payment_method}
                                                    </span>
                                                </div>
                                                </div>
                                                
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 border-t border-border transition-colors duration-300 pt-8">
                                            {/* Subtotal Card */}
                                            <div className="bg-card transition-colors duration-300 p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-center">
                                                <span className="text-[9px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest mb-1">Gross Subtotal</span>
                                                <p className="text-sm font-black text-textMain transition-colors duration-300 leading-none">
                                                    LKR {Number(order.subtotal || order.total_amount).toLocaleString()}
                                                </p>
                                            </div>

                                            {/* Discount Applied Card */}
                                            <div className="bg-primary/5 transition-all duration-300 p-5 rounded-2xl border border-primary/10 transition-all duration-300 shadow-sm flex flex-col justify-center">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[9px] font-black text-primary transition-all duration-300 uppercase tracking-widest">Discount Applied</span>
                                                    <span className="text-[10px] font-black text-primary transition-all duration-300">{Number(order.discount_percentage || 0)}%</span>
                                                </div>
                                                <p className="text-sm font-black text-[#8a7b42] leading-none">
                                                    - LKR {Number(order.discount_amount || 0).toLocaleString()}
                                                </p>
                                            </div>

                                            {/* Net Payable Card */}
                                            <div className="bg-black p-5 rounded-2xl shadow-xl flex flex-col justify-center">
                                                <span className="text-[9px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest mb-1">Net Payable Amount</span>
                                                <p className="text-xl font-black text-primary transition-all duration-300 leading-none tracking-tighter">
                                                    LKR {Number(order.total_amount).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                            {/* Final Action Row */}
                                            <div className="flex justify-between items-center pt-4 border-t border-border transition-colors duration-300">
                                                {/* ඇඩ්මින්ට විතරක් පේන Approve/Reject බටන් */}
                                                {isAdmin && order.order_status === 'requested' ? (
                                                    <div className="flex gap-3">
                                                        <button 
                                                            onClick={() => handleStatusUpdate(order.order_id, 'approved')}
                                                            className="px-6 py-2 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20"
                                                        >
                                                            Approve Order
                                                        </button>
                                                        <button 
                                                            onClick={() => handleStatusUpdate(order.order_id, 'rejected')}
                                                            className="px-6 py-2 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-md shadow-red-500/20"
                                                        >
                                                            Reject Order
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div /> 
                                                )}

                                                <button 
                                                    onClick={() => navigate(`/order/${order.order_id}`, { state: { order } })} 
                                                    className="flex items-center gap-2 text-[10px] font-black uppercase text-primary transition-all duration-300 hover:text-textMain transition-colors duration-300 hover:tracking-widest transition-all"
                                                >
                                                    Open Full Master File <ArrowRight size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
                {/* Pagination Controls */}
                <div className="flex items-center justify-between px-8 py-5 bg-card transition-colors duration-300 border-t border-border transition-colors duration-300 rounded-b-[1.5rem]">
                    <p className="text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest">
                        Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filtered.length)} of {filtered.length} Entries
                    </p>
                    
                    <div className="flex items-center gap-2">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => paginate(currentPage - 1)}
                            className="p-2 rounded-lg border border-border transition-colors duration-300 text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300 disabled:opacity-30 transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => paginate(i + 1)}
                                className={`w-8 h-8 rounded-lg text-[11px] font-black transition-all ${
                                    currentPage === i + 1 
                                    ? "bg-primary transition-all duration-300 text-textMain transition-colors duration-300 shadow-md shadow-[#b4a460]/20" 
                                    : "bg-card transition-colors duration-300 text-textMain/50 transition-colors duration-300 hover:bg-gray-100"
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => paginate(currentPage + 1)}
                            className="p-2 rounded-lg border border-border transition-colors duration-300 text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300 disabled:opacity-30 transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewOrders;