import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../../api/axiosInstance';
import { toast } from 'react-hot-toast';

import { useNotifications } from '../../context/NotificationContext';

import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, Building2, UserCircle, Phone,
  MapPin, Tag, MessageSquarePlus, Trash2,
  ShoppingBag, CreditCard, Clock, StickyNote, Loader2, Mail,
  Edit2, Save, X, UserCheck, ClipboardList
} from 'lucide-react';

const tagConfig = {
  payment: { dot: 'bg-red-400', bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', label: 'Payment' },
  behavior: { dot: 'bg-yellow-400', bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-500/20', label: 'Behavior' },
  general: { dot: 'bg-green-400', bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/20', label: 'General' },
};

const typeBadge = {
  Saloon: 'bg-primary/10 transition-all duration-500 ease-in-out text-[#8a7b42] border-primary/20',
  Wholesale: 'bg-primary/10 transition-all duration-500 ease-in-out text-[#8a7b42] border-primary/20',
  Retail: 'bg-primary/10 transition-all duration-500 ease-in-out text-[#8a7b42] border-primary/20',
};

const statusBadge = {
  requested: {
    label: "Requested", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200",
  },
  approved: {
    label: "Approved", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200",
  },
  rejected: {
    label: "Rejected", bg: "bg-red-50", text: "text-red-500", border: "border-red-200",
  },
  processing: {
    label: "Processing", bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200",
  },
  shipped: {
    label: "Shipped", bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200",
  },
  delivered: {
    label: "Delivered", bg: "bg-gray-900", text: "text-white", border: "border-border transition-colors duration-300",
  },
  cancelled: { label: "Cancelled", bg: "bg-gray-100", text: "text-textMain/50 transition-colors duration-300", border: "border-border transition-colors duration-300" },
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    hour12: true
  }).replace(',', ' at');
};

const normalizeCustomer = (responseData) => {
  if (!responseData) return null;
  return responseData.customer || responseData.data || responseData;
};

const normalizeNotes = (responseData, customer) => {
  if (Array.isArray(responseData?.notes)) return responseData.notes;
  if (Array.isArray(customer?.notes)) return customer.notes;
  return [];
};

const normalizeStats = (responseData, customer) => {
  const source = responseData?.stats || customer?.stats || {};
  return {
    totalOrders: source.totalOrders ?? source.total_orders ?? 0,
    totalSpent: source.totalSpent ?? source.total_spent ?? 0,
    lastOrderDate: source.lastOrderDate ?? source.last_order_date ?? null,
  };
};

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, logout } = useAuth();

  const { addNotification } = useNotifications();

  const [customer, setCustomer] = useState(null);
  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalSpent: 0, lastOrderDate: null }); // Initialize stats with default values
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [selectedTag, setSelectedTag] = useState('general');
  const [savingNote, setSavingNote] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [orders, setOrders] = useState([]);

  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');
  const canAddNote = ['admin', 'manager', 'sales_rep'].includes(loggedInUser?.role);
  const canEditCustomer = loggedInUser?.role === 'admin' || (loggedInUser?.role === 'sales_rep' && customer?.sales_rep_id === loggedInUser?.user_id);

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!token) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);

        const customerPromise = api.get(`/customers/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const ordersPromise = api.get('/orders/all', {
            params: { customerId: id },
            headers: { Authorization: `Bearer ${token}` },
        });

        const [customerResponse, ordersResponse] = await Promise.all([
            customerPromise,
            ordersPromise
        ]);

        // Process customer data
        const normalizedCustomer = normalizeCustomer(customerResponse.data);
        setCustomer(normalizedCustomer);
        setNotes(normalizeNotes(customerResponse.data, normalizedCustomer));
        setStats(normalizeStats(customerResponse.data, normalizedCustomer));
        setError(null);

        // Process orders data
        setOrders(ordersResponse.data);

      } catch (err) {
        console.error("Error fetching customer data:", err);
        if (err.response?.status === 401) {
          logout();
          return;
        }
        if (err.config?.url.includes('/customers/')) {
            setError(err.response?.status === 404 ? 'Customer not found' : 'Failed to load customer');
            setCustomer(null);
            setNotes([]);
        }
        if (err.config?.url.includes('/orders/all')) {
            toast.error("Failed to load order history.");
            setOrders([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id, token, logout, navigate, refreshTrigger]);

  const saveNotificationToDB = async (type, title, message, severity) => {
    try {
      await api.post('/notifications',
        { type, title, message, severity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Failed to save notification:', err);
    }
  };

  const handleEditClick = () => {
    setEditFormData({
      type: customer.type || 'Saloon',
      saloon_name: customer.saloon_name || '',
      owner_name: customer.owner_name || '',
      email: customer.email || '',
      phone1: customer.phone1 || '',
      phone2: customer.phone2 || '',
      lane1: customer.lane1 || '',
      lane2: customer.lane2 || '',
      district: customer.district || '',
      additional_note: customer.additional_note || ''
    });
    setIsEditingInfo(true);
  };

  const handleUpdateCustomer = async () => {
    setIsSavingInfo(true);
    try {
      await api.put(`/customers/update/${id}`, editFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Customer updated successfully!');

      // Create notification
      await saveNotificationToDB(
        'customer',
        '✏️ Customer Info Updated',
        `${editFormData.saloon_name} (${editFormData.type}) - ${editFormData.district} updated by ${loggedInUser?.name}`,
        'info'
      );
      addNotification({
        type: 'customer',
        title: '✏️ Customer Info Updated',
        message: `${editFormData.saloon_name} (${editFormData.type}) - ${editFormData.district} updated by ${loggedInUser?.name}`,
        severity: 'info'
      });

      setIsEditingInfo(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      if (err.response?.status === 401) logout();
      else toast.error(err.response?.data?.error || 'Failed to update customer');
    } finally {
      setIsSavingInfo(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    setSavingNote(true);
    try {
      const response = await api.post(
        `/customers/${id}/notes`,
        {
          note_text: noteText.trim(),
          tag: selectedTag,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const addedNote = response.data?.note;
      if (addedNote) {
        setNotes((current) => [addedNote, ...current]);
        setNoteText('');
        setSelectedTag('general');
        const successToastId = toast.success('Note added successfully', { duration: 1200 });
        // Force dismiss after 1200ms to ensure it disappears on mobile
        setTimeout(() => toast.dismiss(successToastId), 1200);
      }
    } catch (err) {
      console.error('Failed to add note:', err);
      if (err.response?.status === 401) {
        logout();
        return;
      }
      toast.error(err.response?.data?.error || 'Failed to save note. Please try again.');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    // Show confirmation toast with theme colors
    toast((t) => (
      <div className="flex min-w-65 flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-md">
        <p className="font-medium text-textMain">Delete this note?</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.remove(t.id);
              confirmDelete(noteId);
            }}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              toast('Deletion cancelled', { duration: 1500 });
            }}
            className="px-3 py-1 bg-primary text-textMain rounded text-sm font-medium hover:opacity-90 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 10000 });
  };

  const confirmDelete = async (noteId) => {
    try {
      await api.delete(
        `/customers/${id}/notes/${noteId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotes((current) => current.filter((note) => note.note_id !== noteId));
       const successToastId = toast.success('Note deleted successfully', { duration: 1200 });
      // Force dismiss after 1200ms to ensure it disappears on mobile
      setTimeout(() => toast.dismiss(successToastId), 1200);
    } catch (err) {
      console.error('Failed to delete note:', err);
      if (err.response?.status === 401) {
        logout();
        return;
      }
      toast.error(err.response?.data?.error || 'Failed to delete note. Please try again.', { duration: 2000 });
    }
  };
  {/* Render loading, error, or customer details based on the current state */}
  if (loading) {
    return (
      <div className="min-h-screen bg-background transition-all duration-500 ease-in-out flex items-center justify-center">
        <div className="flex items-center gap-3 text-textMain/50 font-medium">
          <Loader2 className="animate-spin text-primary" size={20} /> Loading customer details...
        </div>
      </div>
    );
  }

  {/* Render error message if there's an error or if the customer data is not found */}
  if (error || !customer) {
    return (
      <div className="w-full min-h-screen bg-background transition-all duration-500 ease-in-out p-8">
        <button onClick={handleGoBack} className="flex items-center gap-2 text-textMain/50 hover:text-textMain transition-all duration-500 mb-8 font-medium">
          <ArrowLeft size={20} /> Go Back
        </button>
        <div className="text-center py-24">
          <p className="text-5xl mb-4">👤</p>
          <p className="text-2xl text-textMain/50">{error || 'Customer not found'}</p>
        </div>
      </div>
    );
  }

  const customerName = customer.saloon_name || customer.customer_name || 'Customer';
  const customerId = customer.customer_display_id || customer.customer_id || 'N/A';
  const customerType = customer.type || 'Saloon';
  const address = [customer.lane1, customer.lane2].filter(Boolean).join(', ');
  
  // Calculate total spent from approved, shipped, or delivered orders
  const totalSpent = orders
    .filter(order => ['approved', 'shipped', 'delivered'].includes(order.order_status?.toLowerCase()))
    .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

  // දකුණු පසින් පෙන්වන අනුමත කළ ඇණවුම් ගණන (approved, shipped, delivered)
  const approvedOrdersCount = orders.filter(order =>
    ['approved', 'shipped', 'delivered'].includes(order.order_status?.toLowerCase())
  ).length;

  // ප්‍රතික්ෂේප කළ ඇණවුම් ගණන (rejected)
  const rejectedOrdersCount = orders.filter(order =>
    order.order_status?.toLowerCase() === 'rejected'
  ).length;

  // rejected සහ cancelled හැර අනෙකුත් සියලුම ඇණවුම් ගණන
  const totalOrdersCount = orders.filter(order =>
    ['requested', 'approved', 'shipped', 'delivered'].includes(order.order_status?.toLowerCase())
  ).length;

  const lastOrder = orders.length > 0 ? orders[0] : null;

   return (
    <div className="w-full min-h-screen bg-background transition-all duration-500 ease-in-out animate-in fade-in">
      <div className="bg-background transition-all duration-500 ease-in-out px-4 md:px-8 py-6 md:py-7 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-border">
        <div className="flex items-center gap-5">
          <div className="p-2.5 md:p-3 bg-primary rounded-2xl text-textMain">
            <Building2 size={22} md:size={26} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-textMain/50 uppercase tracking-widest mb-0.5">
              Customers <span className="text-primary">/ {customerName}</span>
            </p>
            <h1 className="text-xl md:text-2xl font-black text-textMain uppercase tracking-tight">Customer Detail</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-card px-4 py-2 md:px-5 md:py-2.5 rounded-2xl border border-border flex items-center gap-3">
            <span className="text-[10px] font-black text-textMain/50 uppercase tracking-widest">ID</span>
            <span className="text-base md:text-lg font-black text-primary">{customerId}</span>
          </div>
          <button onClick={handleGoBack} className="flex items-center gap-2 text-textMain/60 hover:text-textMain font-bold text-xs uppercase tracking-widest transition-all px-4 py-3 rounded-xl bg-card border border-border">
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </div>

      <div className="p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          <div className="lg:col-span-2 bg-card rounded-[1.5rem] border border-border shadow-sm overflow-hidden">
            <div className="px-6 md:px-8 py-5 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-black text-textMain uppercase tracking-widest flex items-center gap-2">
                <UserCircle size={16} className="text-primary" /> Customer Info
              </h2>
              <div className="flex items-center gap-3">
                {canEditCustomer && (
                  <button onClick={handleEditClick} className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary hover:text-textMain bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 flex items-center gap-1.5">
                    <Edit2 size={12} /> Edit
                  </button>
                )}
                <span className={`text-[9px] md:text-[10px] font-black px-3 py-1 rounded-lg border uppercase tracking-wider ${typeBadge[customerType] || typeBadge.Saloon}`}>
                  {customerType}
                </span>
              </div>
            </div>

            {/* Customer Info Fields */}
            <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
              <InfoField icon={Building2} label="Business Name" value={customerName} />
              <InfoField icon={UserCircle} label="Owner Name" value={customer.owner_name || 'N/A'} />
              <InfoField icon={Mail} label="Email Address" value={customer.email || 'N/A'} />
              <InfoField icon={Phone} label="Primary Phone" value={customer.phone1 || 'N/A'} />
              <InfoField icon={Phone} label="Secondary Phone" value={customer.phone2 || 'Not provided'} />
              <InfoField icon={MapPin} label="Address" value={address || 'N/A'} />
              <InfoField icon={MapPin} label="District" value={customer.district || 'N/A'} />
              <InfoField icon={UserCheck} label="Assigned Sales Rep" value={customer.salesRep ? customer.salesRep.name : 'Not Assigned Yet'} />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <StatCard icon={ShoppingBag} label="Total Orders" value={totalOrdersCount} sub="all time">
              <div>
                <div className="text-right">
                  <p className="text-base md:text-lg font-black text-emerald-500">{approvedOrdersCount}</p>
                  <p className="text-[9px] font-bold text-emerald-500/70 uppercase tracking-wider">Approved</p>
                </div>
                {rejectedOrdersCount > 0 && (
                  <div className="text-right mt-1">
                    <p className="text-sm font-black text-red-500">{rejectedOrdersCount}</p>
                    <p className="text-[8px] font-bold text-red-500/70 uppercase tracking-wider">Rejected</p>
                  </div>
                )}
              </div>
            </StatCard>
            <StatCard icon={CreditCard} label="Total Spent" value={`${totalSpent.toLocaleString()} LKR`} sub="all time" />
            <StatCard
              icon={Clock}
              label="Last Order"
              value={lastOrder ? `#${lastOrder.order_id.substring(0, 8).toUpperCase()}` : 'N/A'}
              sub={lastOrder ? formatDateTime(lastOrder.created_at) : 'No orders yet'}
            >
              {lastOrder && (
                <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${statusBadge[lastOrder.order_status?.toLowerCase()]?.bg || "bg-card"} ${statusBadge[lastOrder.order_status?.toLowerCase()]?.text || "text-textMain/50"} ${statusBadge[lastOrder.order_status?.toLowerCase()]?.border || "border-border"}`}>
                  {lastOrder.order_status}
                </span>
              )}
            </StatCard>
          </div>
        </div>

        {/* Order History Section */}
        <div className="bg-card transition-colors duration-300 rounded-[1.5rem] border border-border shadow-sm overflow-hidden mb-6">
            <div className="bg-background px-6 md:px-8 py-5 flex items-center justify-between border-b border-border">
                <h2 className="text-sm font-black text-textMain uppercase tracking-widest flex items-center gap-2">
                    <ClipboardList size={16} className="text-primary" /> Order History
                </h2>
                <span className="text-[10px] text-textMain/50 font-bold">
                    {orders.length} order{orders.length !== 1 ? 's' : ''}
                </span>
            </div>

            {loading ? (
                <div className="py-16 flex items-center justify-center gap-3 text-textMain/50 font-medium">
                    <Loader2 className="animate-spin text-primary" size={20} /> Loading order history...
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-16 text-textMain/50">
                    <p className="text-4xl mb-3">📦</p>
                    <p className="text-sm font-medium">This customer has no order history yet.</p>
                </div>
            ) : (
                <div>
                    {/* Desktop Table */}
                    <div className={`overflow-x-auto w-full custom-scrollbar hidden md:block ${orders.length > 5 ? 'max-h-[450px] overflow-y-auto' : ''}`}>
                        <table className="min-w-full text-left">
                            <thead className="border-b border-border">
                                <tr>
                                    {["Reference", "Date", "Amount", "Status", "Placed By"].map((h) => (
                                        <th key={h} className="px-6 py-3 text-[10px] font-black text-textMain/50 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {orders.map((order) => (
                                    <tr key={order.order_id} className="group hover:bg-card/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-mono font-bold text-textMain">#{order.order_id.substring(0, 8).toUpperCase()}</p>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-textMain/80">
                                            {formatDate(order.created_at)}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-textMain">
                                            LKR {Number(order.total_amount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${statusBadge[order.order_status?.toLowerCase()]?.bg || "bg-card"} ${statusBadge[order.order_status?.toLowerCase()]?.text || "text-textMain/50"} ${statusBadge[order.order_status?.toLowerCase()]?.border || "border-border"}`}>
                                                {order.order_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-textMain/80">
                                            {order.creator?.name || 'Online Store'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className={`md:hidden space-y-3 p-4 ${orders.length > 5 ? 'max-h-[450px] overflow-y-auto' : ''}`}>
                        {orders.map((order) => (
                            <div key={order.order_id} className="bg-card/50 border border-border rounded-2xl p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-mono font-black text-primary text-sm">#{order.order_id.substring(0, 8).toUpperCase()}</p>
                                        <p className="text-[10px] text-textMain/50 font-bold">{formatDate(order.created_at)}</p>
                                    </div>
                                    <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest ${statusBadge[order.order_status?.toLowerCase()]?.bg || "bg-card"} ${statusBadge[order.order_status?.toLowerCase()]?.text || "text-textMain/50"} ${statusBadge[order.order_status?.toLowerCase()]?.border || "border-border"}`}>{order.order_status}</span>
                                </div>
                                <div className="pt-3 border-t border-border">
                                    <div>
                                        <p className="text-[9px] font-bold text-textMain/50 uppercase">Net Value</p>
                                        <p className="text-lg font-black text-primary">LKR {Number(order.total_amount).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        <div className="bg-card transition-colors duration-300 rounded-[1.5rem] border border-border transition-colors duration-300 shadow-sm overflow-hidden">
          <div className="bg-background px-6 md:px-8 py-5 flex items-center justify-between border-b border-border">
            <h2 className="text-sm font-black text-textMain uppercase tracking-widest flex items-center gap-2">
              <StickyNote size={16} className="text-primary" /> Behavior Notes
            </h2>
            <span className="text-[10px] text-textMain/50 font-bold">
              {notes.length} note{notes.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="p-4 md:p-8">
            {canAddNote && (
              <div className="bg-card/50 border border-border rounded-2xl p-4 md:p-6 mb-6 md:mb-8">
                <p className="text-[10px] font-black text-textMain/50 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <MessageSquarePlus size={13} className="text-primary" /> Add New Note
                </p>

                <textarea
                  rows={2}
                  placeholder="Write a note about this customer..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full bg-card border border-border focus:border-primary focus:ring-2 focus:ring-[#b4a460]/10 rounded-xl py-2.5 px-4 text-sm text-textMain outline-none resize-none transition-all mb-4"
                />

                <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black text-textMain/50 uppercase tracking-widest flex items-center gap-1">
                      <Tag size={11} /> Tag:
                    </span>
                    {Object.entries(tagConfig).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedTag(key)}
                        className={`px-2.5 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-wider border transition-all ${
                          selectedTag === key ? `${cfg.bg} ${cfg.text} ${cfg.border}` : 'bg-card text-textMain/50 border-border hover:border-primary'
                        }`}
                      >
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${cfg.dot}`} />
                        {cfg.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleAddNote}
                    disabled={!noteText.trim() || savingNote}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black hover:bg-primary text-white hover:text-textMain px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <MessageSquarePlus size={14} /> {savingNote ? 'Saving...' : 'Add Note'}
                  </button>
                </div>
              </div>
            )}

            {notes.length === 0 ? (
              <div className="text-center py-16 text-textMain/50">
                <p className="text-4xl mb-3">📝</p>
                <p className="text-sm font-medium">No notes yet. Add the first one!</p>
              </div>
            ) : (
              <div className={`space-y-3 ${notes.length > 5 ? 'max-h-[450px] overflow-y-auto pr-2' : ''}`}>
                {notes.map((note) => {
                  const cfg = tagConfig[note.tag] || tagConfig.general;
                  return (
                    <div key={note.note_id} className={`rounded-2xl border p-4 md:p-5 ${cfg.bg} ${cfg.border}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                            <span className={`text-[10px] font-black uppercase tracking-wider ${cfg.text}`}>{cfg.label}</span>
                          </div>
                          <p className="text-xs md:text-sm text-textMain/70 font-medium leading-relaxed">{note.note_text}</p>
                          <p className="text-[9px] md:text-[10px] text-textMain/50 font-bold mt-2 uppercase tracking-wider">
                            {note.added_by || 'System'}
                            <span className="mx-1.5 text-textMain/50">·</span>
                            <span className="text-primary">{(note.role || 'system').replace('_', ' ')}</span>
                            <span className="mx-1.5 text-textMain/50">·</span>
                            {formatDate(note.created_at)}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDeleteNote(note.note_id)}
                          className="p-2 rounded-xl bg-card/60 hover:bg-red-50 text-textMain/50 hover:text-red-400 transition-all border border-white"
                          title="Delete note"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✏️ Edit Customer Modal */}
      {isEditingInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-md md:max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in">
            <div className="p-5 md:p-8 border-b border-border flex justify-between items-center bg-background">
              <h2 className="text-lg md:text-xl font-black text-textMain uppercase tracking-tight flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary"><Edit2 size={20} /></div>
                Edit Customer Info
              </h2>
              <button onClick={() => setIsEditingInfo(false)} className="p-2 hover:bg-red-500/10 text-textMain/50 hover:text-red-500 rounded-full transition-colors">
                <X size={18} md:size={20} />
              </button>
            </div>
            
            <div className="p-5 md:p-8 overflow-y-auto custom-scrollbar space-y-4 md:space-y-5 flex-1">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] md:text-[10px] font-black uppercase text-textMain/50 tracking-widest">Type</label>
                    <select value={editFormData.type} onChange={e => setEditFormData({...editFormData, type: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 md:py-3 text-sm focus:border-primary outline-none">
                      <option value="Saloon">Saloon</option>
                      <option value="Wholesale">Wholesale</option>
                      <option value="Retail">Retail</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] md:text-[10px] font-black uppercase text-textMain/50 tracking-widest">Business Name</label>
                    <input type="text" value={editFormData.saloon_name} onChange={e => setEditFormData({...editFormData, saloon_name: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 md:py-3 text-sm focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] md:text-[10px] font-black uppercase text-textMain/50 tracking-widest">Owner Name</label>
                    <input type="text" value={editFormData.owner_name} onChange={e => setEditFormData({...editFormData, owner_name: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 md:py-3 text-sm focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] md:text-[10px] font-black uppercase text-textMain/50 tracking-widest">Email Address</label>
                    <input type="email" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 md:py-3 text-sm focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] md:text-[10px] font-black uppercase text-textMain/50 tracking-widest">Primary Phone</label>
                    <input type="text" value={editFormData.phone1} onChange={e => setEditFormData({...editFormData, phone1: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 md:py-3 text-sm focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] md:text-[10px] font-black uppercase text-textMain/50 tracking-widest">Secondary Phone</label>
                    <input type="text" value={editFormData.phone2} onChange={e => setEditFormData({...editFormData, phone2: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 md:py-3 text-sm focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[9px] md:text-[10px] font-black uppercase text-textMain/50 tracking-widest">Address / District</label>
                    <div className="grid grid-cols-3 gap-2">
                        <input type="text" placeholder="Lane 01" value={editFormData.lane1} onChange={e => setEditFormData({...editFormData, lane1: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 md:py-3 text-sm focus:border-primary outline-none" />
                        <input type="text" placeholder="Lane 02" value={editFormData.lane2} onChange={e => setEditFormData({...editFormData, lane2: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 md:py-3 text-sm focus:border-primary outline-none" />
                        <select value={editFormData.district} onChange={e => setEditFormData({...editFormData, district: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 md:py-3 text-sm focus:border-primary outline-none">
                            <option value="">Select District</option>
                            {["Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya", "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee", "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", "Moneragala", "Ratnapura", "Kegalle"].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                  </div>
               </div>
            </div>
            <div className="p-5 md:p-6 border-t border-border bg-background flex justify-end gap-3">
              <button onClick={() => setIsEditingInfo(false)} className="px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] text-textMain/60 hover:bg-card transition-all">Cancel</button>
              <button onClick={handleUpdateCustomer} disabled={isSavingInfo} className="px-8 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] bg-primary text-black hover:bg-[#9a8b50] flex items-center gap-2 transition-all disabled:opacity-50">
                {isSavingInfo ? <Loader2 size={14} className="animate-spin"/> : <Save size={14} />} Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


const InfoField = ({ icon: Icon, label, value }) => (
  <div className="space-y-1">
    <p className="text-[9px] md:text-[10px] font-black text-textMain/50 uppercase tracking-widest flex items-center gap-1.5">
      <Icon size={11} className="text-primary" /> {label}
    </p>
    <p className="text-xs md:text-sm font-bold text-textMain px-1">{value}</p>
  </div>
);

{/* StatCard Component for displaying statistics with an icon, label, value, and optional children */}
const StatCard = ({ icon: Icon, label, value, sub, children }) => (
  <div className="bg-card rounded-[1.5rem] border border-border shadow-sm p-4 md:p-6 flex items-center gap-4">
    <div className="p-2.5 md:p-3 bg-black rounded-xl shrink-0">
      <Icon size={16} md:size={18} className="text-primary" />
    </div>
    <div className="flex-1 overflow-hidden">
      <p className="text-[10px] font-black text-textMain/50 uppercase tracking-widest truncate">{label}</p>
      <div className="flex items-center justify-between gap-2 mt-1">
        <div>
          <p className="text-base md:text-lg font-black text-textMain leading-tight">{value}</p>
          <p className="text-[10px] text-textMain/50">{sub}</p>
        </div>
        {children}
      </div>
    </div>
  </div>
);
