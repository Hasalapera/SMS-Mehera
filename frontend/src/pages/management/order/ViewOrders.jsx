import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, User, Hash, DollarSign } from 'lucide-react';

const ViewOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5001/api/orders/all', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(res.data);
            } catch (err) {
                console.error("Error fetching orders", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return (
        <div className="w-full py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b4a460] mx-auto"></div>
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing with server...</p>
        </div>
    );

    return (
        <div className="w-full px-4 pb-8 animate-in fade-in duration-700">
            {/* මුළු Table එක වටේටම යන Gold Border එක */}
            <div className="overflow-hidden border-2 border-[#b4a460] rounded-[2rem] bg-white shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        {/* Table Heading එක Gold කරලා අකුරු පැහැදිලි කළා */}
                        <tr className="bg-[#b4a460]">
                            <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-[#b4a460]">
                                <div className="flex items-center gap-2"><Hash size={14} strokeWidth={3}/> Reference</div>
                            </th>
                            <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-[#b4a460]">
                                <div className="flex items-center gap-2"><User size={14} strokeWidth={3}/> Client Details</div>
                            </th>
                            <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-[#b4a460]">
                                <div className="flex items-center gap-2"><Calendar size={14} strokeWidth={3}/> Date</div>
                            </th>
                            <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-[#b4a460]">
                                <div className="flex items-center gap-2"><DollarSign size={14} strokeWidth={3}/> Total Value</div>
                            </th>
                            <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-[#b4a460] text-right">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => (
                            <tr key={order.order_id} className="group hover:bg-gray-50 transition-all duration-200">
                                <td className="px-8 py-6">
                                    <span className="text-[12px] font-mono font-black text-black bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                                        #{order.order_id.substring(0, 8).toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-[13px] font-black text-black uppercase tracking-tight leading-none mb-1">{order.customer_name}</p>
                                    <p className="text-[11px] text-gray-500 font-bold">{order.phone || 'NO CONTACT'}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-[12px] font-black text-gray-600 uppercase">
                                        {new Date(order.created_at).toLocaleDateString('en-GB', {
                                            day: '2-digit', month: 'short', year: 'numeric'
                                        })}
                                    </p>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-[10px] font-black text-[#b4a460]">LKR</span>
                                        <span className="text-[15px] font-black text-black tracking-tighter">
                                            {parseFloat(order.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <span className={`inline-flex items-center px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-sm border-2 ${
                                        order.order_status === 'pending' 
                                        ? 'bg-white text-[#b4a460] border-[#b4a460]' 
                                        : 'bg-black text-white border-black'
                                    }`}>
                                        <span className={`w-2 h-2 rounded-full mr-2 ${order.order_status === 'pending' ? 'bg-[#b4a460]' : 'bg-white'}`}></span>
                                        {order.order_status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ViewOrders;