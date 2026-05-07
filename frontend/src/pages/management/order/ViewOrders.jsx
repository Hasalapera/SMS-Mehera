import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Calendar, User, Hash, Filter, ShoppingBag, RefreshCw, 
    Loader2, Search, ArrowRight, ClipboardList, ChevronDown, 
    Trash2, MapPin, Truck, ShoppingCart 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';

const statusBadge = {
    pending:   { bg: "bg-[#b4a460]/10", text: "text-[#8a7b42]", border: "border-[#b4a460]/20" },
    completed: { bg: "bg-black/5",      text: "text-black",      border: "border-black/10" },
    cancelled: { bg: "bg-red-50",       text: "text-red-500",    border: "border-red-100" },
};

const ViewOrders = () => {
    const navigate = useNavigate();
    const { token, logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [expandedOrderId, setExpandedOrderId] = useState(null);

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

    return (
        <div className="w-full min-h-screen bg-[#fcfcfc] text-left">
            <Toaster position="top-right" />

            {/* Header Section */}
            <div className="bg-[#f8f8f8] px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-5 border-b border-gray-100">
                <div className="flex items-center gap-5">
                    <div className="p-3 bg-[#b4a460] rounded-2xl text-black">
                        <ShoppingBag size={26} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-black uppercase tracking-tight">Order Management</h1>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5">Mehera International</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-white px-5 py-2.5 rounded-2xl border border-gray-100 flex items-center gap-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Orders</span>
                        <span className="text-lg font-black text-[#b4a460]">{orders.length}</span>
                    </div>
                    <button onClick={fetchOrders} className="p-3 bg-white text-gray-500 rounded-xl border border-gray-100"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
                </div>
            </div>

            <div className="p-6 md:p-8">
                {/* Search & Filter Bar */}
                <div className="bg-white border border-gray-100 rounded-[1.5rem] p-4 mb-8 shadow-sm flex flex-col lg:flex-row gap-4">
                    <div className="relative group flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="text-gray-300" size={18} /></div>
                        <input type="text" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-gray-50/50 rounded-xl py-3 pl-11 pr-4 text-sm outline-none" />
                    </div>
                    <div className="flex items-center gap-2">
                        {["All", "Pending", "Completed", "Cancelled"].map((s) => (
                            <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-lg text-[11px] font-black border uppercase ${statusFilter === s ? "bg-[#b4a460] text-black" : "bg-white text-gray-400"}`}>{s}</button>
                        ))}
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                {["Reference", "Client", "Placed By", "Order Date", "Value (LKR)", "Status", "Actions"].map((h) => (
                                    <th key={h} className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={6} className="py-20 text-center font-black uppercase text-[10px] tracking-widest text-gray-400">Syncing with Registry...</td></tr>
                            ) : filtered.map((order) => (
                                <React.Fragment key={order.order_id}>
                                    <tr className="group hover:bg-[#faf8f0] transition-all duration-200 relative">
                                        <td className="px-6 py-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0">
                                                    <Hash size={16} className="text-[#b4a460]" />
                                                </div>
                                                <div>
                                                    <p className="text-[12px] font-mono font-black text-black">#{order.order_id.substring(0, 8).toUpperCase()}</p>
                                                    <p className="text-[9px] text-gray-400 font-black uppercase mt-0.5">Entry ID</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-8">
                                            <p className="text-sm font-black text-black uppercase">{order.customer_name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold">{order.phone}</p>
                                        </td>
                                        <td className="px-6 py-8">
                                            {order.creator ? (
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-black uppercase leading-none">
                                                        {order.creator.name}
                                                    </span>
                                                    <span className="text-[9px] text-[#b4a460] font-bold uppercase mt-1">
                                                        {order.creator.role.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-[9px] text-gray-300 font-bold italic uppercase">Registry Admin</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-8 text-sm font-bold text-gray-600">
                                            {new Date(order.created_at).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="px-6 py-8">
                                            <span className="text-[10px] font-black text-[#b4a460] mr-1">LKR</span>
                                            <span className="text-sm font-black text-black">{Number(order.total_amount).toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-8">
                                            <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest ${statusBadge[order.order_status?.toLowerCase()]?.bg || 'bg-gray-50'} ${statusBadge[order.order_status?.toLowerCase()]?.text || 'text-gray-500'} ${statusBadge[order.order_status?.toLowerCase()]?.border || 'border-gray-200'}`}>
                                                {order.order_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-8 text-right relative">
                                            <div className="flex items-center justify-end gap-3">
                                                <button className="p-2 text-gray-400 hover:text-black"><ClipboardList size={18} /></button>
                                                <button className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                                            </div>
                                            <div className="absolute inset-x-0 bottom-1 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                                <button onClick={(e) => { e.stopPropagation(); toggleRow(order.order_id); }} className="pointer-events-auto flex items-center gap-1.5 px-4 py-1 rounded-full bg-white border border-gray-100 text-[9px] font-black uppercase text-gray-400 hover:text-[#b4a460] hover:border-[#b4a460] shadow-sm transition-all">
                                                    {expandedOrderId === order.order_id ? 'Close Panel' : 'View Details'} <ChevronDown size={12} className={expandedOrderId === order.order_id ? 'rotate-180' : ''} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Expanded Detail Panel */}
                                    {expandedOrderId === order.order_id && (
                                        <tr className="bg-[#fafafa] animate-in slide-in-from-top-2 duration-300">
                                        <td colSpan={6} className="px-10 py-10 border-l-4 border-[#b4a460]">
                                            
                                            {/* --- Row 01: Shipping & Logistics (50/50 split) --- */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                                {/* Shipping Info */}
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-black uppercase text-[#b4a460] flex items-center gap-2 tracking-[0.2em]">
                                                        <MapPin size={14} /> Shipping Destination
                                                    </h4>
                                                    <p className="text-xs font-bold text-gray-500 bg-white p-5 rounded-[2rem] border border-gray-100 italic leading-relaxed shadow-sm">
                                                        {order.shipping_address}
                                                    </p>
                                                </div>

                                                {/* Logistics Info */}
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-black uppercase text-[#b4a460] flex items-center gap-2 tracking-[0.2em]">
                                                        <Truck size={14} /> Dispatch Logistics
                                                    </h4>
                                                    <div className="bg-white p-5 rounded-[2rem] border border-gray-100 space-y-3 shadow-sm">
                                                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase">Courier Service</span>
                                                            <span className="text-[11px] font-black text-black uppercase">{order.courier_name || 'Not Assigned'}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase">Tracking ID</span>
                                                            <span className="text-[11px] font-black text-[#b4a460] font-mono">{order.tracking_id || 'Pending Registry'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* --- Row 02: Items Manifest (Full Width) --- */}
                                            <div className="space-y-4 mb-8">
                                                <h4 className="text-[10px] font-black uppercase text-[#b4a460] flex items-center gap-2 tracking-[0.2em]">
                                                    <ShoppingCart size={14} /> Itemized Manifest
                                                </h4>
                                                <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                                                    <table className="w-full text-left text-[11px]">
                                                    <thead className="bg-gray-50/50 border-b border-gray-100">
                                                        <tr className="text-gray-400 font-black uppercase tracking-widest">
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
                                                            <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                                                            {/* Product Reference */}
                                                            <td className="px-8 py-5 font-mono font-black text-[#b4a460]">
                                                                #{item.product_id?.substring(0, 8).toUpperCase()}
                                                            </td>
                                                            
                                                            {/* Description (Product Name & Variant) */}
                                                            <td className="px-8 py-5 text-left">
                                                                <div className="flex flex-col">
                                                                <span className="text-[11px] font-black text-black uppercase leading-tight">
                                                                    {pName}
                                                                </span>
                                                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight italic mt-0.5">
                                                                    {vName}
                                                                </span>
                                                                </div>
                                                            </td>

                                                            <td className="px-8 py-5 text-center font-black text-sm">{item.qty}</td>
                                                            <td className="px-8 py-5 text-right text-gray-400 font-bold tabular-nums">
                                                                LKR {Number(item.price).toLocaleString()}
                                                            </td>
                                                            <td className="px-8 py-5 text-right font-black text-black tabular-nums">
                                                                LKR {(Number(item.qty) * Number(item.price)).toLocaleString()}
                                                            </td>
                                                            </tr>
                                                        );
                                                        })}
                                                    </tbody>
                                                    {/* Summary Footer */}
                                                    <tfoot className="bg-gray-50/30 border-t border-gray-100">
                                                        <tr>
                                                        <td colSpan="4" className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Grand Total Amount</td>
                                                        <td className="px-8 py-4 text-right font-black text-lg text-black tabular-nums">
                                                            LKR {Number(order.total_amount).toLocaleString()}
                                                        </td>
                                                        </tr>
                                                    </tfoot>
                                                    </table>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 border-t border-gray-100 pt-8">
                                            {/* Subtotal Card */}
                                            <div className="bg-white p-5 rounded-2xl border border-gray-50 shadow-sm flex flex-col justify-center">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Gross Subtotal</span>
                                                <p className="text-sm font-black text-black leading-none">
                                                    LKR {Number(order.subtotal || order.total_amount).toLocaleString()}
                                                </p>
                                            </div>

                                            {/* Discount Applied Card */}
                                            <div className="bg-[#b4a460]/5 p-5 rounded-2xl border border-[#b4a460]/10 shadow-sm flex flex-col justify-center">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[9px] font-black text-[#b4a460] uppercase tracking-widest">Discount Applied</span>
                                                    <span className="text-[10px] font-black text-[#b4a460]">{Number(order.discount_percentage || 0)}%</span>
                                                </div>
                                                <p className="text-sm font-black text-[#8a7b42] leading-none">
                                                    - LKR {Number(order.discount_amount || 0).toLocaleString()}
                                                </p>
                                            </div>

                                            {/* Net Payable Card */}
                                            <div className="bg-black p-5 rounded-2xl shadow-xl flex flex-col justify-center">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Net Payable Amount</span>
                                                <p className="text-xl font-black text-[#b4a460] leading-none tracking-tighter">
                                                    LKR {Number(order.total_amount).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                            {/* Final Action Row */}
                                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                                <button 
                                                onClick={() => navigate(`/order/${order.order_id}`, { state: { order } })} 
                                                className="flex items-center gap-2 text-[10px] font-black uppercase text-[#b4a460] hover:text-black hover:tracking-widest transition-all"
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
        </div>
    );
};

export default ViewOrders;