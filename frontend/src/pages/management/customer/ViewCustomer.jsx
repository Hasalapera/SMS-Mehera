import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, UserPlus, Building2,
    Phone, MapPin, ArrowRight, Users, Loader2, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

// Type badge colors
const typeBadge = {
  Saloon:    { bg: "bg-[#b4a460]/10", text: "text-[#8a7b42]", border: "border-[#b4a460]/20" },
  Wholesale: { bg: "bg-black/5",      text: "text-black",      border: "border-black/10" },
  Retail:    { bg: "bg-gray-100",     text: "text-gray-500",   border: "border-gray-200" },
};

export default function ViewCustomer() {
    const navigate    = useNavigate();
    const { token, logout } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search,    setSearch]    = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
 
  // Get logged in user role (for Add button visibility)
  const loggedInUser = JSON.parse(localStorage.getItem('user'));

    const fetchCustomers = async () => {
        if (!token) {
            navigate('/');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5001/api/customers/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const customerData = Array.isArray(res.data) ? res.data : (res.data.customers || []);
            setCustomers(customerData);
        } catch (err) {
            if (err.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                logout();
                return;
            }
            console.error('Failed to load customers:', err);
            toast.error('Failed to load customers');
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [token]);
 
  // Filter logic
    const filtered = customers.filter((c) => {
    const matchSearch =
            (c.saloon_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (c.owner_name || '').toLowerCase().includes(search.toLowerCase())  ||
            (c.district || '').toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || c.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="w-full min-h-screen bg-[#fcfcfc] animate-in fade-in duration-500">
            <Toaster position="top-right" />
 
      {/* Top Header Bar */}
        <div className="bg-[#f8f8f8] px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-5 border-b border-gray-100">
            <div className="flex items-center gap-5">
                <div className="p-3 bg-[#b4a460] rounded-2xl text-black">
                    <Users size={26} strokeWidth={2.5} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-black uppercase tracking-tight">
                    Customer Directory
                    </h1>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5">
                    Mehera International
                    </p>
                </div>
            </div>

            {/* Stats + Add button */}
            <div className="flex items-center gap-4">
                {/* Total count badge */}
                <div className="bg-white px-5 py-2.5 rounded-2xl border border-gray-100 flex items-center gap-3">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Total
                    </span>
                    <span className="text-lg font-black text-[#b4a460]">
                    {customers.length}
                    </span>
                </div>

                <button
                    onClick={fetchCustomers}
                    className="p-3 bg-white hover:bg-gray-50 text-gray-500 hover:text-black rounded-xl transition-all border border-gray-100"
                    title="Refresh customers"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>

                {/* Add Customer — visible to all roles (change canAdd later) */}
                {(() => {
                    const canAdd = ['admin', 'sales_rep'].includes(loggedInUser?.role);
                    return canAdd ? (
                    <button
                        onClick={() => navigate('/add-customer')}
                        className="flex items-center gap-2 bg-[#b4a460] hover:bg-[#9a8b50] text-black px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg transition-all active:scale-95"
                    >
                        <UserPlus size={16} /> Add Customer
                    </button>
                    ) : null;
                })()}
            </div>
        </div>

        <div className="p-6 md:p-8">
 
            {/* ── Search + Filter Bar ── */}
            <div className="bg-white border border-gray-100 rounded-[1.5rem] p-4 mb-8 shadow-sm flex flex-col lg:flex-row gap-4">
    
                {/* Search */}
                <div className="relative group flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="text-gray-300 group-focus-within:text-[#b4a460] transition-colors" size={18} />
                    </div>
                    <input
                    type="text"
                    placeholder="Search by name, owner or district..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-gray-50/50 border-none rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#b4a460]/20 outline-none transition-all"
                    />
                </div>
        
                {/* Type filter buttons */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-1.5 px-3 border-r border-gray-100 mr-1 text-gray-400">
                        <Filter size={13} />
                        <span className="text-[10px] font-black uppercase">Filter:</span>
                    </div>
                    {["All", "Saloon", "Wholesale", "Retail"].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTypeFilter(t)}
                        className={`px-4 py-2 rounded-lg text-[11px] font-black whitespace-nowrap transition-all border uppercase tracking-wider
                        ${typeFilter === t
                            ? "bg-[#b4a460] border-[#b4a460] text-black shadow-md"
                            : "bg-white border-gray-200 text-gray-400 hover:border-[#b4a460] hover:text-[#b4a460]"
                        }`}
                    >
                        {t}
                    </button>
                    ))}
                </div>
            </div>

            {/*  Results count  */}
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-5">
            Showing{" "}
            <span className="text-[#b4a460]">{filtered.length}</span>{" "}
            customer{filtered.length !== 1 ? "s" : ""}
            </p>
    
            {/* Customer Table */}
            <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
        
                        {/* Column headers */}
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                            {["Customer", "Type", "Contact", "District", "Note", "Actions"].map((h) => (
                                <th key={h} className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {h}
                                </th>
                            ))}
                            </tr>
                        </thead>
            
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center text-gray-400 text-sm">
                                <div className="inline-flex items-center gap-2">
                                  <Loader2 size={16} className="animate-spin" /> Loading customers...
                                </div>
                                </td>
                            </tr>
                            ) : (
                            <>
                            {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center text-gray-400 italic text-sm">
                                No customers found.
                                </td>
                            </tr>
                            ) : (
                            filtered.map((customer) => (
                                <tr
                                key={customer.customer_id}
                                className="hover:bg-[#faf8f0] transition-colors group"
                                >
                                {/* Customer name + ID */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                    {/* Avatar with initials */}
                                    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0">
                                        <span className="text-[#b4a460] text-xs font-black">
                                        {(customer.saloon_name || 'NA').slice(0, 2).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900">
                                        {customer.saloon_name}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                        <Building2 size={10} />
                                        {customer.owner_name} ·{" "}
                                        <span className="text-[#b4a460]">{customer.customer_display_id}</span>
                                        </p>
                                    </div>
                                    </div>
                                </td>
            
                                {/* Type badge */}
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg border uppercase tracking-wider
                                    ${typeBadge[customer.type]?.bg}
                                    ${typeBadge[customer.type]?.text}
                                    ${typeBadge[customer.type]?.border}`}
                                    >
                                    {customer.type}
                                    </span>
                                </td>
            
                                {/* Phone */}
                                <td className="px-6 py-4">
                                    <p className="text-sm text-gray-600 font-medium flex items-center gap-1.5">
                                    <Phone size={12} className="text-[#b4a460]" />
                                    {customer.phone1}
                                    </p>
                                </td>
            
                                {/* District */}
                                <td className="px-6 py-4">
                                    <p className="text-sm text-gray-600 font-medium flex items-center gap-1.5">
                                    <MapPin size={12} className="text-[#b4a460]" />
                                    {customer.district}
                                    </p>
                                </td>
            
                                {/* Note preview */}
                                <td className="px-6 py-4">
                                    <p className="text-[11px] text-gray-400 italic max-w-[160px] truncate">
                                    {customer.additional_note || "—"}
                                    </p>
                                </td>
            
                                {/* View button */}
                                <td className="px-6 py-4">
                                    <button
                                    onClick={() => navigate(`/customer/${customer.customer_id}`)}
                                    className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-gray-400 hover:text-[#b4a460] transition-colors group-hover:text-[#b4a460]"
                                    >
                                    View <ArrowRight size={13} />
                                    </button>
                                </td>
                                </tr>
                            ))
                            )}
                            </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
}
