import React, { useEffect, useState } from "react";
import { useNotifications } from "../../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axiosInstance";
import {
  Calendar,
  User,
  Hash,
  Filter,
  ShoppingBag,
  RefreshCw,
  Loader2,
  Search,
  ArrowRight,
  ClipboardList,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  MapPin,
  Truck,
  ShoppingCart,
  Phone,
  X,
  Edit,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
//import { useNotifications } from "../../context/NotificationContext";
import { toast } from "react-hot-toast";
import { MySwal } from "../../utils/swalConfig";

const statusBadge = {
  // pending:   { bg: "bg-primary/10 transition-all duration-300", text: "text-[#8a7b42]", border: "border-primary/20 transition-all duration-300" },
  // completed: { bg: "bg-black/5",      text: "text-textMain transition-colors duration-300",      border: "border-black/10" },
  // cancelled: { bg: "bg-red-50",       text: "text-red-500",    border: "border-red-100" },

  requested: {
    label: "Requested",
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
  },
  approved: {
    label: "Approved",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-red-50",
    text: "text-red-500",
    border: "border-red-200",
  },
  processing: {
    label: "Processing",
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
  },
  shipped: {
    label: "Shipped",
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
  },
  delivered: {
    label: "Delivered",
    bg: "bg-gray-900",
    text: "text-white",
    border: "border-border transition-colors duration-300",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-gray-100",
    text: "text-textMain/50 transition-colors duration-300",
    border: "border-border transition-colors duration-300",
  },
};

const ViewOrders = ({ showHeader = true }) => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const { addNotification, setNotificationsFromAPI } = useNotifications();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const loggedUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = loggedUser?.role === "admin";
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const fetchOrders = async (showLoader = true) => {
    if (!token) return;
    if (showLoader) setLoading(true);
    try {
      const res = await api.get("/orders/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Order Data Check:", res.data);
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders", err);
      toast.error("Failed to load orders");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(true);
  }, [token]);

  const filtered = orders.filter((o) => {
    const matchSearch =
      (o.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.order_id || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All" || o.order_status === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filtered.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  // change page function
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const saveNotificationToDB = async (type, title, message, severity, reference_id = null) => {
      try {
        await api.post(`/notifications`, { type, title, message, severity, reference_id },
        { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error('Failed to save notification:', err);
      }
    };

  const handleDeleteOrder = async (orderId) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the order. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/orders/delete/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Order deleted successfully!");
        fetchOrders(false); // Refresh the list
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete order.");
      }
    }
  };
  const handleStatusUpdate = async (orderId, newStatus) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: `You are about to mark this order as "${newStatus}". This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, mark as ${newStatus}`,
      cancelButtonText: "No, keep current status",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
            try {
                // this Backend route should be here
                // if elese make the route (router.put('/update-order-status/:id', ...))
                await api.put(`/orders/update-order-status/${orderId}`, 
                    { status: newStatus }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                toast.success(`Order ${newStatus} successfully!`);

                // Get status config for notification
                const statusConfig = {
                approved:  { title: '✅ Order Approved',   severity: 'info',     emoji: '✅' },
                rejected:  { title: '❌ Order Rejected',   severity: 'critical', emoji: '❌' },
                processing:{ title: '⚙️ Order Processing', severity: 'info',     emoji: '⚙️' },
                shipped:   { title: '🚚 Order Shipped',    severity: 'info',     emoji: '🚚' },
                delivered: { title: '📦 Order Delivered',  severity: 'info',     emoji: '📦' },
                cancelled: { title: '🚫 Order Cancelled',  severity: 'warning',  emoji: '🚫' },
                };

                const config = statusConfig[newStatus] || { title: `📋 Order ${newStatus}`, severity: 'info' };
                const orderRef = `#${orderId.substring(0, 8).toUpperCase()}`;
                const orderObj = orders.find((o) => o.order_id === orderId) || {};
                const customerName = orderObj.customer_name || 'Unknown Customer';
                const amount = orderObj.total_amount ? `LKR ${Number(orderObj.total_amount).toLocaleString()}` : '';

                const messageText = amount
                  ? `Order ${orderRef} for ${customerName} (${amount}) was marked as ${newStatus} by ${loggedUser?.name}`
                  : `Order ${orderRef} for ${customerName} was marked as ${newStatus} by ${loggedUser?.name}`;

                await saveNotificationToDB(
                'order',
                config.title,
                messageText,
                config.severity,
                orderId
                );

                addNotification({
                type: 'order',
                title: config.title,
                message: messageText,
                severity: config.severity,
                reference_id: orderId,
                });

                // Sync the context from the server so backend-created stock alerts update the badge immediately.
                const notificationRes = await api.get('/notifications', {
                  headers: { Authorization: `Bearer ${token}` },
                });
                setNotificationsFromAPI(notificationRes.data.notifications || []);

                fetchOrders(false); 
            } catch (err) {
                console.error("Status Update Error:", err);
                toast.error(err.response?.data?.message || "Failed to update status.");
            }
        }
  };

  return (
    <div className="w-full mx-auto animate-in fade-in duration-500">
      {/* Header Section */}
      {showHeader && (
        <div className="bg-background transition-all duration-300 px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-5 border-b border-border transition-colors duration-300">
          <div className="flex items-center gap-5">
            <div className="p-3 bg-primary transition-all duration-300 rounded-2xl text-textMain transition-colors duration-300">
              <ShoppingBag size={26} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-textMain transition-colors duration-300 uppercase tracking-tight">
                Order Management
              </h1>
              <p className="text-textMain/50 transition-colors duration-300 text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5">
                Mehera International
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-card transition-colors duration-300 px-5 py-2.5 rounded-2xl border border-border transition-colors duration-300 flex items-center gap-3">
              <span className="text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest">
                Total Orders
              </span>
              <span className="text-lg font-black text-primary transition-all duration-300">
                {orders.length}
              </span>
            </div>
            <button
              onClick={() => fetchOrders(true)}
              className="p-3 bg-card transition-colors duration-300 text-textMain/50 transition-colors duration-300 rounded-xl border border-border transition-colors duration-300"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      )}

      <div className={showHeader ? "p-6 md:p-8" : "pt-2"}>
        {/* Search & Filter Bar */}
        <div className="bg-card transition-colors duration-300 border border-border transition-colors duration-300 rounded-[1.5rem] p-4 mb-8 shadow-sm flex flex-col lg:flex-row gap-4">
          <div className="relative group flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search
                className="text-textMain/50 transition-colors duration-300"
                size={18}
              />
            </div>
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card/50 transition-colors duration-300 rounded-xl py-3 pl-11 pr-4 text-sm outline-none"
            />
          </div>
          {/* Desktop Filters */}
          <div className="hidden lg:flex items-center gap-2">
            {[
              "All",
              "Requested",
              "Approved",
              "Shipped",
              "Delivered",
              "Cancelled",
            ].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-[11px] font-black border uppercase whitespace-nowrap ${statusFilter === s ? "bg-primary transition-all duration-300 text-textMain transition-colors duration-300" : "bg-card transition-colors duration-300 text-textMain/50 transition-colors duration-300"}`}
              >
                {s}
              </button>
            ))}
          </div>
          {/* Mobile Filter */}
          <div className="lg:hidden relative flex-1">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-background border border-border rounded-xl py-3.5 px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
            >
              {[
                "All",
                "Requested",
                "Approved",
                "Shipped",
                "Delivered",
                "Cancelled",
              ].map((s) => (
                <option key={s} value={s}>
                  {s === "All" ? "All Order Statuses" : s}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-textMain/50"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-card transition-colors duration-300 rounded-[1.5rem] border border-border transition-colors duration-300 shadow-sm overflow-hidden hidden md:block">
          <div className="overflow-x-auto w-full custom-scrollbar">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-card/50 transition-colors duration-300 border-b border-border transition-colors duration-300 ">
                  {[
                    "Reference",
                    "Client",
                    "Placed By",
                    "Order Date",
                    "Value (LKR)",
                    "Order Status",
                    "Payment Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="py-20 text-center font-black uppercase text-[10px] tracking-widest text-textMain/50 transition-colors duration-300"
                    >
                      Syncing with Registry...
                    </td>
                  </tr>
                ) : (
                  currentRows.map((order) => (
                    <React.Fragment key={order.order_id}>
                      <tr className="group hover:bg-primary/10 transition-all duration-300 relative">
                        <td className="px-6 py-8">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0">
                              <Hash
                                size={16}
                                className="text-primary transition-all duration-300"
                              />
                            </div>
                            <div>
                              <p className="text-[12px] font-mono font-black text-textMain transition-colors duration-300">
                                #{order.order_id.substring(0, 8).toUpperCase()}
                              </p>
                              <p className="text-[9px] text-textMain/50 transition-colors duration-300 font-black uppercase mt-0.5">
                                Entry ID
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-8">
                          <p className="text-sm font-black text-textMain transition-colors duration-300 uppercase">
                            {order.customer_name}
                          </p>
                          <p className="text-[10px] text-textMain/50 transition-colors duration-300 font-bold">
                            {order.phone}
                          </p>
                        </td>
                        <td className="px-6 py-8">
                          {order.creator ? (
                            <div className="flex flex-col">
                              <span className="text-[11px] font-black text-textMain transition-colors duration-300 uppercase leading-none">
                                {order.creator.name}
                              </span>
                              <span className="text-[9px] text-primary transition-all duration-300 font-bold uppercase mt-1">
                                {order.creator.role.replace("_", " ")}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[9px] text-textMain/50 transition-colors duration-300 font-bold italic uppercase">
                              Registry Admin
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-8 text-sm font-bold text-textMain/50 transition-colors duration-300">
                          {new Date(order.created_at).toLocaleDateString(
                            "en-GB",
                          )}
                        </td>
                        <td className="px-6 py-8">
                          <span className="text-[10px] font-black text-primary transition-all duration-300 mr-1">
                            LKR
                          </span>
                          <span className="text-sm font-black text-textMain transition-colors duration-300">
                            {Number(order.total_amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-8">
                          <span
                            className={`text-[9px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest ${statusBadge[order.order_status?.toLowerCase()]?.bg || "bg-card transition-colors duration-300"} ${statusBadge[order.order_status?.toLowerCase()]?.text || "text-textMain/50 transition-colors duration-300"} ${statusBadge[order.order_status?.toLowerCase()]?.border || "border-border transition-colors duration-300"}`}
                          >
                            {order.order_status}
                          </span>
                        </td>

                        <td className="px-6 py-8">
                          <span
                            className={`text-[9px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest ${
                              order.payment_method?.toLowerCase() === "credit"
                                ? "bg-amber-50 border-amber-100 text-amber-600"
                                : "bg-emerald-50 border-emerald-100 text-emerald-600"
                            }`}
                          >
                            {order.payment_method || "Cash"}
                          </span>
                        </td>

                        <td className="px-6 py-8 text-right relative">
                          <div className="flex items-center justify-end gap-3">
                            <button 
                              onClick={() => navigate(`/edit-order/${order.order_id}`)}
                              className="p-2 text-textMain/50 transition-colors duration-300 hover:text-primary"
                              title="Edit Order"
                            >
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDeleteOrder(order.order_id)} className="p-2 text-textMain/50 transition-colors duration-300 hover:text-red-500" title="Delete Order">
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="absolute inset-x-0 bottom-1 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                              }}
                              className="pointer-events-auto flex items-center gap-1.5 px-4 py-1 rounded-full bg-card transition-colors duration-300 border border-border transition-colors duration-300 text-[9px] font-black uppercase text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300 hover:border-primary transition-all duration-300 shadow-sm transition-all"
                            >
                              View Details <Search size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4 max-w-lg mx-auto">
          {loading ? (
            <div className="py-20 text-center font-black uppercase text-[10px] tracking-widest text-textMain/50 transition-colors duration-300">
              Syncing with Registry...
            </div>
          ) : (
            currentRows.map((order) => (
              <div
                key={order.order_id}
                className="bg-background rounded-2xl p-4 border border-border"
              >
                {/* Top: Ref, Date, Status */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-mono font-black text-primary text-sm">
                      #{order.order_id.substring(0, 8).toUpperCase()}
                    </p>
                    <p className="text-[10px] text-textMain/50 font-bold">
                      {new Date(order.created_at).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <span
                    className={`text-[9px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest ${statusBadge[order.order_status?.toLowerCase()]?.bg || "bg-card"} ${statusBadge[order.order_status?.toLowerCase()]?.text || "text-textMain/50"} ${statusBadge[order.order_status?.toLowerCase()]?.border || "border-border"}`}
                  >
                    {order.order_status}
                  </span>
                </div>

                {/* Middle: Customer, Placed By */}
                <div className="space-y-3 my-4 py-4 border-y border-border">
                  <div>
                    <p className="text-[9px] font-bold text-textMain/50 uppercase">Client</p>
                    <p className="font-black text-textMain uppercase text-sm">
                      {order.customer_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-textMain/50 uppercase">Placed By</p>
                    <p className="font-bold text-textMain text-sm">{order.creator?.name || "Registry Admin"}</p>
                  </div>
                </div>

                {/* Bottom: Value, Actions */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[9px] font-bold text-textMain/50 uppercase">Net Value</p>
                    <p className="text-lg font-black text-primary">LKR {Number(order.total_amount).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedOrder(order)} className="p-3 bg-card border border-border text-textMain/70 rounded-xl hover:text-primary hover:border-primary transition-all"><Search size={16} /></button>
                    <button onClick={() => navigate(`/edit-order/${order.order_id}`)} className="p-3 bg-card border border-border text-textMain/70 rounded-xl hover:text-primary hover:border-primary transition-all"><Edit size={16} /></button>
                    <button onClick={() => handleDeleteOrder(order.order_id)} className="p-3 bg-card border border-border text-textMain/70 rounded-xl hover:text-red-500 hover:border-red-500/50 transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- ORDER DETAILS POPUP (MODAL) --- */}
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-300">
            <div className="bg-background w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Close Button */}
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-card hover:bg-red-50 text-textMain/50 hover:text-red-500 transition-all z-20"
              >
                <X size={18} md:size={24} />
              </button>

              <div className="p-5 md:p-10 overflow-y-auto no-scrollbar">
                <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-8">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-black flex items-center justify-center shadow-lg shadow-black/20">
                    <Hash size={20} md:size={24} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-2xl font-black uppercase text-textMain tracking-tight">
                      Order Details{" "}
                      <span className="text-primary ml-2">
                        #{selectedOrder.order_id.substring(0, 8).toUpperCase()}
                      </span>
                    </h2>
                    <p className="text-[10px] text-textMain/50 font-bold uppercase tracking-widest mt-1">
                      Registry Master Entry
                    </p>
                  </div>
                </div>

                {/* --- Row 01: Shipping & Logistics --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-10">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-primary flex items-center gap-2 tracking-[0.2em]">
                      <MapPin size={14} /> Shipping Destination
                    </h4>
                    <p className="text-[11px] md:text-xs font-bold text-textMain/50 bg-card p-4 md:p-6 rounded-[1.5rem] border border-border italic leading-relaxed shadow-sm">
                      {selectedOrder.shipping_address}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-primary flex items-center gap-2 tracking-[0.2em]">
                      <Truck size={14} /> Dispatch Logistics
                    </h4>
                    <div className="bg-card p-4 md:p-6 rounded-[1.5rem] border border-border space-y-3 shadow-sm">
                      <div className="flex justify-between items-center border-b border-border pb-3 text-right">
                        <span className="text-[10px] font-black text-textMain/50 uppercase tracking-widest">
                          Courier Service
                        </span>
                        <span className="text-[11px] font-black text-textMain uppercase">
                          {selectedOrder.courier_name || "Not Assigned"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-right">
                        <span className="text-[10px] font-black text-textMain/50 uppercase tracking-widest">
                          Tracking ID
                        </span>
                        <span className="text-[10px] md:text-[11px] font-black text-primary font-mono">
                          {selectedOrder.tracking_id || "Pending Registry"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- Row 02: Items Manifest --- */}
                <div className="space-y-4 mb-6 md:mb-10">
                  <h4 className="text-[10px] font-black uppercase text-primary flex items-center gap-2 tracking-[0.2em]">
                    <ShoppingCart size={14} /> Itemized Manifest
                  </h4>
                  {/* Desktop Table View */}
                  <div className="hidden md:block bg-card rounded-[2rem] border border-border overflow-hidden shadow-sm">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-card/50 border-b border-border">
                        <tr className="text-textMain/50 font-black uppercase tracking-widest">
                          <th className="px-8 py-4 w-2/12">Ref</th>
                          <th className="px-8 py-4 w-5/12">Description</th>
                          <th className="px-8 py-4 w-1/12 text-center">Qty</th>
                          <th className="px-8 py-4 w-2/12 text-right">
                            Unit Price
                          </th>
                          <th className="px-8 py-4 w-2/12 text-right">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {(
                          selectedOrder.OrderItems ||
                          selectedOrder.items ||
                          []
                        ).map((item, idx) => {
                          const variant =
                            item.variant || item.Variant || item.ProductVariant;
                          const product = variant?.product || variant?.Product;
                          const pName =
                            product?.product_name || "Registry Item";
                          const vName =
                            variant?.variant_name || "Standard Edition";
                          return (
                            <tr
                              key={idx}
                              className="hover:bg-card/30 transition-colors"
                            >
                              <td className="px-8 py-5 font-mono font-black text-primary">
                                #
                                {item.product_id?.substring(0, 8).toUpperCase()}
                              </td>
                              <td className="px-8 py-5">
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-black text-textMain uppercase leading-tight">
                                    {pName}
                                  </span>
                                  <span className="text-[9px] text-textMain/50 font-bold uppercase tracking-tight italic mt-0.5">
                                    {vName}
                                  </span>
                                </div>
                              </td>
                              <td className="px-8 py-5 text-center font-black text-sm">
                                {item.qty}
                              </td>
                              <td className="px-8 py-5 text-right text-textMain/50 font-bold">
                                LKR {Number(item.price).toLocaleString()}
                              </td>
                              <td className="px-8 py-5 text-right font-black text-textMain">
                                LKR{" "}
                                {(
                                  Number(item.qty) * Number(item.price)
                                ).toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-card/30 border-t border-border">
                        <tr>
                          <td
                            colSpan="4"
                            className="px-8 py-4 text-right text-[10px] font-black text-textMain/50 uppercase tracking-widest"
                          >
                            Gross Manifest Total
                          </td>
                          <td className="px-8 py-4 text-right font-black text-lg text-textMain">
                            LKR{" "}
                            {Number(
                              selectedOrder.total_amount,
                            ).toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                
                {/* Mobile Card View for Items */}
                <div className="md:hidden space-y-2">
                  {(selectedOrder.OrderItems || selectedOrder.items || []).map((item, idx) => {
                    const variant = item.variant || item.Variant || item.ProductVariant;
                    const product = variant?.product || variant?.Product;
                    const pName = product?.product_name || "Registry Item";
                    const vName = variant?.variant_name || "Standard Edition";
                    const subtotal = Number(item.qty) * Number(item.price);
                    return (
                      <div key={idx} className="bg-card p-3 rounded-2xl border border-border shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-[10px] font-black text-textMain uppercase leading-tight">{pName}</p>
                            <p className="text-[8px] text-textMain/60 font-bold uppercase tracking-tight italic mt-0.5">{vName}</p>
                          </div>
                          <p className="text-[10px] font-mono font-black text-primary ml-2">#{item.product_id?.substring(0, 6)}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border text-center">
                          <div>
                            <p className="text-[8px] font-bold text-textMain/50 uppercase">Qty</p>
                            <p className="text-xs font-black text-textMain">{item.qty}</p>
                          </div>
                          <div>
                            <p className="text-[8px] font-bold text-textMain/50 uppercase">Unit Price</p>
                            <p className="text-xs font-black text-textMain">{Number(item.price).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[8px] font-bold text-textMain/50 uppercase">Subtotal</p>
                            <p className="text-xs font-black text-primary">{subtotal.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Mobile Grand Total */}
                  <div className="flex justify-between items-center bg-card p-3 rounded-2xl border-2 border-primary/20 mt-3">
                    <span className="text-[10px] font-black text-textMain/50 uppercase tracking-widest">
                      Manifest Total
                    </span>
                    <p className="text-base font-black text-primary tracking-tighter">
                      LKR {Number(selectedOrder.total_amount).toLocaleString()}
                    </p>
                  </div>
                </div>


                {/* Settlement Info */}
                <div className="flex flex-col gap-2 mb-6 md:mb-10">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-primary rounded-full"></div>
                    <p className="text-[10px] font-black uppercase text-textMain/50 tracking-widest">
                      Settlement Mode
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] md:text-[11px] font-extrabold uppercase tracking-[0.1em] border-2 flex items-center w-fit gap-2 ${
                      selectedOrder.payment_method === "credit"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${selectedOrder.payment_method === "credit" ? "bg-amber-600" : "bg-emerald-600"}`}
                    ></div>
                    {selectedOrder.payment_method || "Cash"}
                  </span>
                </div>

                {/* Totals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 pt-6 md:pt-8 border-t border-border">
                  <div className="bg-card p-3 md:p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-center">
                    <span className="text-[9px] font-black text-textMain/50 uppercase tracking-widest mb-1">
                      Gross Subtotal
                    </span>
                    <p className="text-[11px] md:text-sm font-black text-textMain">
                      LKR{" "}
                      {Number(
                        selectedOrder.subtotal || selectedOrder.total_amount,
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-primary/5 p-3 md:p-5 rounded-2xl border border-primary/10 shadow-sm flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                        Discount Applied
                      </span>
                      <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        {Number(selectedOrder.discount_percentage || 0)}%
                      </span>
                    </div>
                    <p className="text-[11px] md:text-sm font-black text-[#8a7b42]">
                      - LKR{" "}
                      {Number(
                        selectedOrder.discount_amount || 0,
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-black p-3 md:p-5 rounded-2xl shadow-xl flex flex-col justify-center">
                    <span className="text-[9px] font-black text-textMain/50 uppercase tracking-widest mb-1">
                      Net Payable Amount
                    </span>
                    <p className="text-base md:text-xl font-black text-primary tracking-tighter">
                      LKR {Number(selectedOrder.total_amount).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Final Actions */}
                <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 mt-6 md:mt-10 pt-6 border-t border-border">
                  {isAdmin && selectedOrder.order_status === "requested" ? (
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          handleStatusUpdate(
                            selectedOrder.order_id,
                            "approved",
                          );
                          setSelectedOrder(null);
                        }}
                        className="px-5 py-2.5 md:px-8 md:py-3 rounded-xl bg-emerald-500 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20"
                      >
                        Approve Order
                      </button>
                      <button
                        onClick={() => {
                          handleStatusUpdate(
                            selectedOrder.order_id,
                            "rejected",
                          );
                          setSelectedOrder(null);
                        }}
                        className="px-5 py-2.5 md:px-8 md:py-3 rounded-xl bg-red-500 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-md shadow-red-500/20"
                      >
                        Reject Order
                      </button>
                    </div>
                  ) : (
                    <div />
                  )}

                  <button
                    onClick={() =>
                      navigate(`/order/${selectedOrder.order_id}`, {
                        state: { order: selectedOrder },
                      })
                    }
                    className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase text-primary hover:text-textMain transition-all w-full sm:w-auto justify-center"
                  >
                    Open Full Master File <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 bg-card transition-colors duration-300 border-t border-border transition-colors duration-300 rounded-b-[1.5rem]">
          <p className="text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest text-center md:text-left">
            Showing {indexOfFirstRow + 1} to{" "}
            {Math.min(indexOfLastRow, filtered.length)} of {filtered.length}{" "}
            Entries
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
