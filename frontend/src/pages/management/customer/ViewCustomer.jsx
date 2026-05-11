import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, UserPlus, Building2,
  Phone, MapPin, ArrowRight, Users, Loader2, RefreshCw, UserCircle,
  ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

// Type badge colors
const typeBadge = {
  Saloon:    { bg: "bg-primary/10 transition-all duration-500 ease-in-out", text: "text-[#8a7b42]", border: "border-primary/20 transition-all duration-500 ease-in-out" },
  Wholesale: { bg: "bg-primary/10 transition-all duration-500 ease-in-out", text: "text-[#8a7b42]", border: "border-primary/20 transition-all duration-500 ease-in-out" },
  Retail:    { bg: "bg-primary/10 transition-all duration-500 ease-in-out", text: "text-[#8a7b42]", border: "border-primary/20 transition-all duration-500 ease-in-out" },
};

export default function ViewCustomer() {
    const navigate    = useNavigate();
    const { token, logout } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search,    setSearch]    = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
 
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

  // Pagination Logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filtered.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="w-full bg-background transition-all duration-500 ease-in-out animate-in fade-in">
 
      {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 mb-8 transition-all duration-500 ease-in-out">
            <div className="flex items-center gap-5">
                <div className="p-3 bg-primary transition-all duration-500 ease-in-out rounded-2xl text-textMain">
                    <Users size={26} strokeWidth={2.5} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-textMain transition-colors duration-500 uppercase tracking-tight">
                    Customer Directory
                    </h1>
                    <p className="text-textMain/50 transition-colors duration-300 text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5">
                    Mehera International
                    </p>
                </div>
            </div>

            {/* Stats + Add button */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {/* Total count badge */}
                <div className="hidden sm:flex bg-card transition-colors duration-300 px-5 py-2.5 rounded-2xl border border-border transition-colors duration-300 items-center gap-3">
                    <span className="text-[9px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest">
                    Total
                    </span>
                    <span className="text-lg font-black text-primary transition-all duration-300">
                    {customers.length}
                    </span>
                </div>

                <button
                    onClick={fetchCustomers}
                    className="p-3.5 bg-card transition-colors duration-300 hover:bg-card transition-colors duration-300 text-textMain/50 transition-colors duration-300 hover:text-textMain transition-colors duration-300 rounded-2xl transition-all border border-border transition-colors duration-300"
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
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary transition-all duration-300 hover:bg-[#9a8b50] text-textMain transition-colors duration-300 px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/10 transition-all active:scale-95"
                    >
                        <UserPlus size={16} /> <span className="hidden xs:inline">Add Customer</span>
                    </button>
                    ) : null;
                })()}
            </div>
        </div>

        <div className="">
 
            {/* ── Search + Filter Bar ── */}
            <div className="bg-card transition-colors duration-300 border border-border transition-colors duration-300 rounded-[1.5rem] p-4 mb-8 shadow-sm flex flex-col lg:flex-row gap-4">
    
                {/* Search */}
                <div className="relative group flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="text-textMain/50 transition-colors duration-300 group-focus-within:text-primary transition-all duration-300" size={18} />
                    </div>
                    <input
                    type="text"
                    placeholder="Search by name, owner or district..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-background transition-colors duration-300 border-none rounded-xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#b4a460]/20 outline-none transition-all text-textMain"
                    />
                </div>
        
                {/* Type filter buttons */}
                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center gap-1.5 px-3 border-r border-border transition-colors duration-300 mr-1 text-textMain/50 transition-colors duration-300">
                        <Filter size={13} />
                        <span className="text-[10px] font-black uppercase">Filter:</span>
                    </div>
                    {/* Desktop Filters */}
                    <div className="hidden lg:flex items-center gap-2">
                        {["All", "Saloon", "Wholesale", "Retail"].map((t) => (
                        <button key={t} onClick={() => setTypeFilter(t)} className={`px-4 py-2 rounded-lg text-[11px] font-black whitespace-nowrap transition-all border uppercase tracking-wider ${typeFilter === t ? "bg-primary transition-all duration-300 border-primary transition-all duration-300 text-textMain transition-colors duration-300 shadow-md" : "bg-card transition-colors duration-300 border-border transition-colors duration-300 text-textMain/50 transition-colors duration-300 hover:border-primary transition-all duration-300 hover:text-primary transition-all duration-300"}`}>{t}</button>
                        ))}
                    </div>
                    {/* Mobile Filter */}
                    <div className="lg:hidden relative flex-1">
                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full appearance-none bg-background border border-border rounded-xl py-3.5 px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none">
                            {["All", "Saloon", "Wholesale", "Retail"].map((t) => (<option key={t} value={t}>{t === 'All' ? 'All Customer Types' : t}</option>))}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-textMain/50" />
                    </div>
                </div>
            </div>

            {/*  Results count  */}
            <p className="text-[11px] text-textMain/50 transition-colors duration-300 font-bold uppercase tracking-widest mb-5">
            Showing <span className="text-primary transition-all duration-300">{currentRows.length}</span> of <span className="text-primary transition-all duration-300">{filtered.length}</span> customer{filtered.length !== 1 ? "s" : ""}
            </p>
    
            {/* Customer Table */}
            <div className="bg-card transition-colors duration-300 rounded-[2rem] border border-border transition-colors duration-300 shadow-sm overflow-hidden hidden md:block">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
        
                        {/* Column headers */}
                        <thead>
                            <tr className="bg-card/50 transition-colors duration-300 border-b border-border transition-colors duration-300">
                            {["Customer", "Type", "Contact", "District", "Note", "Actions"].map((h) => (
                                <th key={h} className="px-6 py-4 text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest">
                                {h}
                                </th>
                            ))}
                            </tr>
                        </thead>
            
                        <tbody className="divide-y divide-border transition-colors duration-300">
                            {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center text-textMain/50 transition-colors duration-300 text-sm">
                                <div className="inline-flex items-center gap-2">
                                  <Loader2 size={16} className="animate-spin" /> Loading customers...
                                </div>
                                </td>
                            </tr>
                            ) : (
                            <>
                            {currentRows.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center text-textMain/50 transition-colors duration-300 italic text-sm">
                                No customers found.
                                </td>
                            </tr>
                            ) : (
                            currentRows.map((customer) => (
                                <tr
                                key={customer.customer_id}
                                className="hover:bg-primary/5 transition-all duration-300 group"
                                >
                                {/* Customer name + ID */}
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                    {/* Avatar with initials */}
                                    <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 group-hover:bg-primary transition-all duration-300 group-hover:border-primary">
                                        <span className="text-primary group-hover:text-white transition-all duration-300 text-xs font-black">
                                        {(customer.saloon_name || 'NA').slice(0, 2).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-textMain transition-colors duration-300">
                                        {customer.saloon_name}
                                        </p>
                                        <p className="text-[10px] text-textMain/50 transition-colors duration-300 font-bold flex items-center gap-1">
                                        <Building2 size={10} className="text-primary" />
                                        {customer.owner_name} ·{" "}
                                        <span className="text-primary transition-all duration-300">{customer.customer_display_id}</span>
                                        </p>
                                    </div>
                                    </div>
                                </td>
            
                                {/* Type badge */}
                                <td className="px-6 py-5">
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg border uppercase tracking-wider
                                    ${typeBadge[customer.type]?.bg}
                                    ${typeBadge[customer.type]?.text}
                                    ${typeBadge[customer.type]?.border}`}
                                    >
                                    {customer.type}
                                    </span>
                                </td>
            
                                {/* Phone */}
                                <td className="px-6 py-5">
                                    <p className="text-sm text-textMain/50 transition-colors duration-300 font-medium flex items-center gap-1.5">
                                    <Phone size={12} className="text-primary transition-all duration-300" />
                                    {customer.phone1}
                                    </p>
                                </td>
            
                                {/* District */}
                                <td className="px-6 py-5">
                                    <p className="text-sm text-textMain/50 transition-colors duration-300 font-medium flex items-center gap-1.5">
                                    <MapPin size={12} className="text-primary transition-all duration-300" />
                                    {customer.district}
                                    </p>
                                </td>
            
                                {/* Note preview */}
                                <td className="px-6 py-5">
                                    <p className="text-[11px] text-textMain/40 transition-colors duration-300 italic max-w-[160px] truncate">
                                    {customer.additional_note || "—"}
                                    </p>
                                </td>
            
                                {/* View button */}
                                <td className="px-6 py-5">
                                    <button
                                    onClick={() => navigate(`/customer/${customer.customer_id}`)}
                                    className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300 group-hover:text-primary transition-all duration-300"
                                    >
                                    View <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
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
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 bg-card transition-colors duration-300 border-t border-border transition-colors duration-300">
                        <p className="text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest text-center md:text-left">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)} className="p-2 rounded-lg border border-border transition-colors duration-300 text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300 disabled:opacity-30 transition-all"><ChevronLeft size={18} /></button>
                            {[...Array(totalPages)].map((_, i) => (<button key={i + 1} onClick={() => paginate(i + 1)} className={`w-8 h-8 rounded-lg text-[11px] font-black transition-all ${currentPage === i + 1 ? "bg-primary transition-all duration-300 text-textMain transition-colors duration-300 shadow-md shadow-[#b4a460]/20" : "bg-background text-textMain/50 hover:bg-primary/10"}`}>{i + 1}</button>))}
                            <button disabled={currentPage === totalPages} onClick={() => paginate(currentPage + 1)} className="p-2 rounded-lg border border-border transition-colors duration-300 text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300 disabled:opacity-30 transition-all"><ChevronRight size={18} /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Customer Cards for Mobile */}
            <div className="md:hidden space-y-4">
              {loading ? (
                <div className="text-center py-20 text-textMain/50 text-sm">
                  <Loader2 size={20} className="animate-spin inline-block mr-2" />
                  Loading customers...
                </div>
              ) : currentRows.length === 0 ? (
                <div className="text-center py-20 text-textMain/50 italic text-sm">
                  No customers found.
                </div>
              ) : (
                currentRows.map((customer) => (
                  <div key={customer.customer_id} className="bg-card p-5 rounded-2xl border border-border shadow-sm">
                    {/* Top Section */}
                    <div className="flex justify-between items-start pb-4 mb-4 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
                          <span className="text-primary text-xs font-black">
                            {(customer.saloon_name || 'NA').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-black text-textMain">{customer.saloon_name}</p>
                          <p className="text-[10px] text-textMain/50 font-bold flex items-center gap-1">
                            <UserCircle size={10} className="text-primary" /> {customer.owner_name}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider
                        ${typeBadge[customer.type]?.bg} ${typeBadge[customer.type]?.text} ${typeBadge[customer.type]?.border}`}>
                        {customer.type}
                      </span>
                    </div>

                    {/* Details Section */}
                    <div className="space-y-3 mb-5">
                      <div className="flex items-center gap-2 text-sm text-textMain/60 font-medium">
                        <Phone size={14} className="text-primary" />
                        <span>{customer.phone1}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-textMain/60 font-medium">
                        <MapPin size={14} className="text-primary" />
                        <span>{customer.district}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => navigate(`/customer/${customer.customer_id}`)}
                      className="w-full flex items-center justify-center gap-2 bg-background border border-border text-textMain/70 hover:text-primary hover:border-primary text-[10px] font-black uppercase py-3 rounded-xl transition-all"
                    >
                      View Details <ArrowRight size={14} />
                    </button>
                  </div>
                ))
              )}
              {/* Mobile Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center justify-between gap-4 px-6 py-4 bg-card transition-colors duration-300 border-t border-border transition-colors duration-300 rounded-b-[1.5rem]">
                    <p className="text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest text-center md:text-left">Page {currentPage} of {totalPages}</p>
                    <div className="flex items-center gap-2">
                        <button disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)} className="p-2 rounded-lg border border-border transition-colors duration-300 text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300 disabled:opacity-30 transition-all"><ChevronLeft size={18} /></button>
                        <span className="text-sm font-bold">{currentPage}</span>
                        <button disabled={currentPage === totalPages} onClick={() => paginate(currentPage + 1)} className="p-2 rounded-lg border border-border transition-colors duration-300 text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300 disabled:opacity-30 transition-all"><ChevronRight size={18} /></button>
                    </div>
                </div>
              )}
            </div>
        </div>
    </div>
  );
}
