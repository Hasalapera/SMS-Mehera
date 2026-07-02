import React, { useEffect, useState, useMemo } from "react";
import api from "../../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import {
  ShoppingBag,
  Hash,
  MapPin,
  Phone,
  ChevronDown,
  ChevronUp,
  History,
  ArrowRight,
  Loader2,
  Calendar,
  DollarSign,
  X,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const statusBadge = {
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
    border: "border-border",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-gray-100",
    text: "text-textMain/50",
    border: "border-border",
  },
};

const OrderHistory = () => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSalons, setExpandedSalons] = useState({}); // Track expansion per salon
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [viewingTransactionsFor, setViewingTransactionsFor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token || !user?.user_id) return;
      try {
        const res = await api.get("/orders/all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching history", err);
        toast.error("Could not load transaction history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [token, user?.user_id]);

  // Group orders by Saloon (Customer Name)
  const groupedOrders = useMemo(() => {
    const groups = {};
    orders.forEach((order) => {
      const key = order.customer_name || "Unknown Salon";
      if (!groups[key]) {
        const addressParts = [
          order.customer?.lane1,
          order.customer?.lane2,
          order.customer?.district,
        ];
        const fullAddress = addressParts.filter(Boolean).join(", ") || order.shipping_address || "N/A";

        groups[key] = {
          salonName: key,
          address: fullAddress,
          phone: order.phone || "N/A",
          totalAmount: 0,
          orderCount: 0,
          transactions: [],
        };
      }
      groups[key].totalAmount += Number(order.total_amount);
      groups[key].orderCount += 1;
      groups[key].transactions.push(order);
    });
    return Object.values(groups);
  }, [orders]);

  const toggleSalon = (salonName) => {
    setExpandedSalons((prev) => ({
      ...prev,
      [salonName]: !prev[salonName],
    }));
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4 text-textMain/50">
        <Loader2 className="animate-spin" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest">
          Syncing History...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-6 md:p-10 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8 md:mb-10 border-b border-border pb-6">
        <div className="p-3 md:p-4 bg-white text-primary rounded-2xl shadow-lg border border-border transition-all duration-300">
          <History size={20} md:size={24} />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-primary">
            Purchase History
          </h1>
          <p className="text-[9px] md:text-[10px] text-textMain/50 font-bold uppercase tracking-widest">
            Master Record for {user.name}
          </p>
        </div>
      </div>

      <div className="space-y-4 md:space-y-8">
        {groupedOrders.length === 0 ? (
          <div className="bg-card border border-border p-10 text-center rounded-[2rem] italic text-textMain/40 text-sm shadow-sm">
            No salon transaction records found for your account.
          </div>
        ) : (
          groupedOrders.map((salon) => (
            <div
              key={salon.salonName}
              className={`bg-card border transition-all duration-500 overflow-hidden rounded-[1.5rem] md:rounded-[2rem] shadow-sm hover:shadow-md ${
                expandedSalons[salon.salonName]
                  ? "border-primary shadow-lg shadow-primary/10 md:scale-[1.01]"
                  : "border-border"
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border">
                <div className="p-5 md:p-8 lg:col-span-2">
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] block mb-2">
                    Assigned Entity
                  </span>
                  <h2 className="text-lg md:text-2xl font-black uppercase text-textMain mb-3 md:mb-4">
                    {salon.salonName}
                  </h2>
                  <div className="flex flex-col gap-3 md:gap-4">
                    <div className="flex items-start gap-3 text-textMain/60">
                      <MapPin size={14} className="text-primary mt-0.5 shrink-0" />
                      <span className="text-xs font-bold">{salon.address}</span>
                    </div>
                    <div className="flex items-center gap-3 text-textMain/60">
                      <Phone size={14} className="text-primary" />
                      <span className="text-xs font-bold">{salon.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 md:p-8 flex flex-col justify-center bg-primary/5 border-l border-border lg:border-l-0">
                  <span className="text-[9px] font-black text-textMain/50 uppercase tracking-[0.2em] mb-1">
                    Salon Lifetime Volume
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-black text-primary">LKR</span>
                    <span className="text-xl md:text-2xl font-black text-textMain">
                      {salon.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-5 md:p-8 flex flex-col justify-center bg-primary/10">
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">
                    Order Count
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xl md:text-2xl font-black text-primary">
                      {salon.orderCount}
                    </span>
                    <span className="text-[10px] font-bold text-primary/70 uppercase">
                      Entries
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-card border-t border-border p-4 flex justify-center">
                {/* Desktop Button */}
                <button
                  onClick={() => toggleSalon(salon.salonName)}
                  className="hidden md:flex items-center gap-2 px-10 py-3.5 bg-black text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black hover:scale-[1.02] active:scale-95 transition-all duration-300 rounded-full shadow-lg shadow-black/5"
                >
                  {expandedSalons[salon.salonName]
                    ? "Hide Transactions"
                    : "Show Transactions"}
                  {expandedSalons[salon.salonName] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {/* Mobile Button */}
                <button
                  onClick={() => setViewingTransactionsFor(salon)}
                  className="flex md:hidden items-center gap-2 px-10 py-3.5 bg-black text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black active:scale-95 transition-all duration-300 rounded-full shadow-lg shadow-black/5"
                >
                  Show Transactions <ChevronRight size={14} />
                </button>
              </div>

              {expandedSalons[salon.salonName] && (
                <div className="hidden md:block border-t border-border bg-background/50 animate-in slide-in-from-top-4 duration-500 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/5 text-textMain border-b border-border">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">
                          Ref ID
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">
                          Date
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">
                          Value (LKR)
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">
                          Status
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">
                          Placed By
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {salon.transactions.map((order) => (
                        <tr
                          key={order.order_id}
                          className="hover:bg-primary/5 transition-colors"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <Hash size={12} className="text-primary" />
                              <span className="text-xs font-mono font-black">
                                {order.order_id.substring(0, 8).toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-textMain/60 text-xs font-bold">
                              <Calendar size={12} />{" "}
                              {new Date(order.created_at).toLocaleDateString(
                                "en-GB",
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-xs font-black">
                            {Number(order.total_amount).toLocaleString()}
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={`text-[10px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-tighter
                              ${statusBadge[order.order_status?.toLowerCase()]?.bg || "bg-gray-100"}
                              ${statusBadge[order.order_status?.toLowerCase()]?.text || "text-textMain/50"}
                              ${statusBadge[order.order_status?.toLowerCase()]?.border || "border-border"}
                            `}
                            >
                              {statusBadge[order.order_status?.toLowerCase()]
                                ?.label || order.order_status}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            {order.creator ? (
                              <div className="flex flex-col">
                                {order.creator.role === "admin" ? (
                                  <span className="text-[11px] font-black uppercase leading-none text-[#8a7b42]">
                                    Admin
                                  </span>
                                ) : order.creator.deleted_at ? (
                                  <>
                                    <span className="text-[11px] font-black uppercase leading-none text-black">
                                      {order.creator.name}
                                    </span>
                                    <span className="text-[9px] text-red-500 font-bold uppercase mt-1">
                                      Inactive Rep
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span
                                      className={`text-[11px] font-black uppercase leading-none ${order.created_by === user?.user_id ? "text-primary" : "text-textMain"}`}
                                    >
                                      {order.creator.name}
                                    </span>
                                    <span className="text-[9px] text-textMain/50 font-bold uppercase mt-1">
                                      {order.creator.role.replace("_", " ")}
                                    </span>
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] font-black text-[#8a7b42] uppercase">
                                Admin
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button
                              onClick={() => setSelectedTransaction(order)}
                              className="text-primary hover:text-textMain text-[9px] font-black uppercase flex items-center gap-1.5 ml-auto hover:scale-110 transition-transform"
                              title="View Full Details"
                            >
                              View <ArrowRight size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Mobile Transactions Popup */}
      {viewingTransactionsFor && (
        <div className="fixed inset-0 z-[150] flex flex-col bg-background md:hidden animate-in fade-in duration-300">
          {/* Modal Header */}
          <div className="p-5 border-b border-border flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-textMain/50 uppercase tracking-widest">Transactions For</p>
              <h3 className="text-lg font-black uppercase text-primary tracking-tight">
                {viewingTransactionsFor.salonName}
              </h3>
            </div>
            <button
              onClick={() => setViewingTransactionsFor(null)}
              className="p-2 bg-card border border-border rounded-full text-textMain/50 hover:text-red-500 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body - Transaction Cards */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {viewingTransactionsFor.transactions.map((order) => (
              <div key={order.order_id} className="bg-card p-4 rounded-2xl border border-border shadow-sm">
                {/* Top: Ref & Status */}
                <div className="flex justify-between items-start pb-3 mb-3 border-b border-border">
                  <div>
                    <p className="text-[9px] font-black text-textMain/50 uppercase tracking-widest">Ref ID</p>
                    <p className="font-mono font-black text-primary text-sm">
                      #{order.order_id.substring(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <span
                    className={`text-[9px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-tighter
                      ${statusBadge[order.order_status?.toLowerCase()]?.bg || "bg-gray-100"}
                      ${statusBadge[order.order_status?.toLowerCase()]?.text || "text-textMain/50"}
                      ${statusBadge[order.order_status?.toLowerCase()]?.border || "border-border"}
                    `}
                  >
                    {statusBadge[order.order_status?.toLowerCase()]?.label || order.order_status}
                  </span>
                </div>

                {/* Middle: Details */}
                <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                  <div>
                    <p className="text-[9px] font-bold text-textMain/50 uppercase mb-1">Placed By</p>
                    <p className="font-bold text-textMain text-sm truncate">{order.creator?.name || 'Admin'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-textMain/50 uppercase mb-1">Date</p>
                    <p className="font-bold text-textMain text-sm">{new Date(order.created_at).toLocaleDateString("en-GB")}</p>
                  </div>
                </div>

                {/* Bottom: Value & Action */}
                <div className="flex justify-between items-center border-t border-border pt-3">
                  <div>
                    <p className="text-[9px] font-bold text-textMain/50 uppercase">Value</p>
                    <p className="text-base font-black text-primary">
                      LKR {Number(order.total_amount).toLocaleString()}
                    </p>
                  </div>
                  <button onClick={() => { setViewingTransactionsFor(null); setSelectedTransaction(order); }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-background border border-border text-[10px] font-black uppercase text-textMain/70 hover:text-primary hover:border-primary transition-all">
                    Details <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TRANSACTION DETAILS POPUP --- */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-background w-full max-w-3xl rounded-[2rem] border border-primary/30 shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-8 border-b border-border flex justify-between items-center bg-black/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-primary shadow-lg shadow-black/20">
                  <ShoppingCart size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-primary">
                    Transaction Manifest
                  </h3>
                  <p className="text-[10px] font-bold text-textMain/50 uppercase tracking-widest">
                    Ref ID: #
                    {selectedTransaction.order_id.substring(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="p-3 rounded-full hover:bg-red-50 text-textMain/50 hover:text-red-500 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-textMain/50 font-black uppercase text-[10px] tracking-widest border-b border-border">
                    <th className="pb-4 px-2">Product Description</th>
                    <th className="pb-4 text-center">Qty</th>
                    <th className="pb-4 text-right">Unit Price</th>
                    <th className="pb-4 text-right px-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {(
                    selectedTransaction.OrderItems ||
                    selectedTransaction.items ||
                    []
                  ).map((item, idx) => {
                    const variant =
                      item.variant || item.Variant || item.ProductVariant;
                    const product = variant?.product || variant?.Product;
                    const pName = product?.product_name || "Registry Item";
                    const vName = variant?.variant_name || "Standard Edition";

                    return (
                      <tr
                        key={idx}
                        className="group hover:bg-primary/5 transition-colors"
                      >
                        <td className="py-5 px-2">
                          <p className="font-black text-textMain uppercase text-xs leading-tight">
                            {pName}
                          </p>
                          <p className="text-[9px] text-textMain/50 font-bold italic mt-1">
                            {vName}
                          </p>
                        </td>
                        <td className="py-5 text-center font-black text-sm">
                          {item.qty}
                        </td>
                        <td className="py-5 text-right text-textMain/60 font-bold text-xs">
                          LKR {Number(item.price).toLocaleString()}
                        </td>
                        <td className="py-5 text-right font-black text-primary px-2 text-xs">
                          LKR{" "}
                          {(
                            Number(item.qty) * Number(item.price)
                          ).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border/50">
                    <td
                      colSpan="3"
                      className="pt-6 text-right text-[10px] font-black uppercase text-textMain/50 tracking-[0.2em]"
                    >
                      Gross Subtotal
                    </td>
                    <td className="pt-6 text-right font-black text-textMain px-2 text-xs">
                      LKR{" "}
                      {Number(
                        selectedTransaction.subtotal ||
                          selectedTransaction.total_amount,
                      ).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan="3"
                      className="py-2 text-right text-[10px] font-black uppercase text-primary tracking-[0.2em]"
                    >
                      Discount Applied (
                      {Number(selectedTransaction.discount_percentage || 0)}%)
                    </td>
                    <td className="py-2 text-right font-black text-[#8a7b42] px-2 text-xs">
                      - LKR{" "}
                      {Number(
                        selectedTransaction.discount_amount || 0,
                      ).toLocaleString()}
                    </td>
                  </tr>
                  <tr className="border-t-2 border-primary/20">
                    <td
                      colSpan="3"
                      className="pt-4 text-right text-[10px] font-black uppercase text-textMain/50 tracking-[0.2em]"
                    >
                      Net Payable Amount
                    </td>
                    <td className="pt-4 text-right text-xl font-black text-primary px-2">
                      LKR{" "}
                      {Number(
                        selectedTransaction.total_amount,
                      ).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Info Banner */}
              <div className="mt-10 p-4 bg-primary/5 rounded-2xl border border-primary/20 flex items-center gap-3">
                <Calendar size={16} className="text-primary" />
                <p className="text-[10px] font-bold text-textMain/70 uppercase">
                  Transaction finalized on{" "}
                  {new Date(selectedTransaction.created_at).toLocaleDateString(
                    "en-GB",
                  )}{" "}
                  at{" "}
                  {new Date(
                    selectedTransaction.created_at,
                  ).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="p-6 bg-black flex justify-center border-t border-primary/20">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-primary text-[10px] font-black uppercase tracking-widest hover:tracking-[0.2em] transition-all"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;