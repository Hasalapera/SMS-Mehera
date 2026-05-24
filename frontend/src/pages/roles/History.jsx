import React, { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
    MapPin, Package, Phone, User,
    Globe, Store, RefreshCw, Calendar, Loader2, CheckCircle, History as HistoryIcon
} from 'lucide-react';

const History = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('online');

    const fetchOrders = async (showLoader = true) => {
        if (!token) return;
        if (showLoader) setLoading(true);
        try {
            const res = await api.get('/orders/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // 🛡️ Filter only 'shipped' or 'delivered' orders
            const historyOrders = res.data.filter(o => ['shipped', 'delivered'].includes(o.order_status));
            setOrders(historyOrders);
        } catch (err) {
            console.error("Error fetching logistics history", err);
            toast.error('Failed to load dispatch history');
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, [token]);

    const onlineOrders = orders.filter(o => o.order_type === 'online');
    const offlineOrders = orders.filter(o => o.order_type === 'offline' || !o.order_type);
    const displayedOrders = activeTab === 'online' ? onlineOrders : offlineOrders;

    return (
        <div className="w-full mx-auto animate-in fade-in duration-500 pb-10">
            {/* Header Section */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-textMain transition-colors duration-300 uppercase tracking-tight flex items-center gap-3">
                        <div className="p-3 bg-black text-primary transition-all duration-300 rounded-2xl shadow-xl"><HistoryIcon size={28} /></div>
                        Logistics <span className="italic text-primary transition-all duration-300">History</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-textMain/50 transition-colors duration-300 mt-2 italic ml-16">
                        Past dispatched and delivered registry orders
                    </p>
                </div>
                <button onClick={() => fetchOrders()} className="p-3.5 bg-card border border-border rounded-xl text-textMain/50 hover:text-primary transition-all shadow-sm shrink-0 mt-4 md:mt-0">
                    <RefreshCw size={18} className={loading ? 'animate-spin text-primary' : ''} />
                </button>
            </div>

            {/* Tabs Layer */}
            <div className="flex flex-col sm:flex-row gap-2 bg-gray-100/50 p-1.5 rounded-2xl border border-border transition-colors duration-300 w-full shadow-sm mb-6">
                <button onClick={() => setActiveTab('online')} className={`flex-1 flex justify-center items-center gap-2 px-8 py-3.5 text-[11px] font-black uppercase tracking-widest transition-all rounded-xl ${activeTab === 'online' ? 'bg-black text-primary shadow-lg' : 'text-textMain/50 hover:text-textMain'}`}>
                    <Globe size={16} /> Online Orders <span className="ml-2 bg-primary/20 text-primary px-2 py-0.5 rounded-md">{onlineOrders.length}</span>
                </button>
                <button onClick={() => setActiveTab('offline')} className={`flex-1 flex justify-center items-center gap-2 px-8 py-3.5 text-[11px] font-black uppercase tracking-widest transition-all rounded-xl ${activeTab === 'offline' ? 'bg-black text-primary shadow-lg' : 'text-textMain/50 hover:text-textMain'}`}>
                    <Store size={16} /> Offline/Retail Orders <span className="ml-2 bg-primary/20 text-primary px-2 py-0.5 rounded-md">{offlineOrders.length}</span>
                </button>
            </div>

            {/* Orders Feed */}
            {loading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-primary" size={40} /><p className="text-xs font-black uppercase tracking-widest text-textMain/50">Syncing History...</p></div>
            ) : displayedOrders.length === 0 ? (
                <div className="py-24 text-center border border-dashed border-border rounded-[2rem] bg-card/30"><HistoryIcon className="mx-auto text-textMain/20 mb-4" size={48} /><h3 className="text-lg font-black text-textMain/50 uppercase tracking-widest">No History Found</h3><p className="text-xs font-medium text-textMain/40 mt-1">No shipped or delivered orders in this channel.</p></div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {displayedOrders.map(order => (
                        <div key={order.order_id} className="bg-card border border-border rounded-[2rem] p-6 md:p-8 shadow-sm flex flex-col gap-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                            <div className="flex justify-between items-center border-b border-border pb-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-textMain/50 mb-0.5">Dispatch Ref</p>
                                    <div className="flex items-center gap-2">
                                        <p className="font-mono font-black text-primary text-lg leading-none">#{order.order_id.substring(0, 8).toUpperCase()}</p>
                                        {order.tracking_id && (
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/20">
                                                Trk: {order.tracking_id}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border mb-2 ${order.order_status === 'delivered' ? 'bg-black text-white border-black' : 'bg-purple-50 text-purple-600 border-purple-200'}`}>
                                        {order.order_status}
                                    </span>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-textMain/50 flex items-center gap-1.5 justify-end"><Calendar size={12}/> Entry Date</p>
                                    <p className="font-bold text-textMain text-sm">{new Date(order.created_at).toLocaleDateString('en-GB')}</p>
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
                                    Net Value: <span className="text-primary text-xl tracking-tighter ml-2 whitespace-nowrap">LKR {Number(order.total_amount).toLocaleString()}</span>
                                </p>
                                {order.order_status === 'delivered' && (
                                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 shrink-0"><CheckCircle size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Process Completed</span></div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default History;