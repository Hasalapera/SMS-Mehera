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
  Trash2,
  Pencil,
  Search,
  Plus,
  Minus,
  Package,
  CheckCircle2,
  PlusCircle,
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

  const handleDeleteOrder = async (orderId, salonName) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await api.delete(`/orders/delete/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Order deleted successfully");
      
      // Update orders state
      setOrders((prev) => prev.filter((o) => o.order_id !== orderId));

      // If selectedTransaction is the deleted order, close the modal
      if (selectedTransaction?.order_id === orderId) {
        setSelectedTransaction(null);
      }

      // If we are currently viewing transactions for this salon in mobile view, update it
      if (viewingTransactionsFor && viewingTransactionsFor.salonName === salonName) {
        setViewingTransactionsFor((prev) => {
          const updatedTransactions = prev.transactions.filter((o) => o.order_id !== orderId);
          if (updatedTransactions.length === 0) {
            return null; // Close mobile modal if no orders left
          }
          return {
            ...prev,
            transactions: updatedTransactions,
          };
        });
      }
    } catch (err) {
      console.error("Error deleting order", err);
      toast.error(err.response?.data?.message || "Failed to delete order");
    }
  };

  // Edit Order states
  const [editingOrder, setEditingOrder] = useState(null);
  const [editProducts, setEditProducts] = useState([]);
  const [editSearchTerm, setEditSearchTerm] = useState("");
  const [editSelectedProductForVariant, setEditSelectedProductForVariant] = useState(null);
  const [editCart, setEditCart] = useState([]);
  const [editDiscount, setEditDiscount] = useState(0);
  const [editPaymentMethod, setEditPaymentMethod] = useState("cash");
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [isFinalizingEdit, setIsFinalizingEdit] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!editingOrder) return;
      setIsCatalogLoading(true);
      try {
        const res = await api.get('/products/getProducts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data?.products || res.data;
        setEditProducts(data);
      } catch (err) {
        console.error("Failed to fetch products", err);
        toast.error("Failed to fetch products list");
      } finally {
        setIsCatalogLoading(false);
      }
    };
    fetchProducts();
  }, [editingOrder, token]);

  const handleStartEdit = (order) => {
    try {
      if (!order) throw new Error("Order data is null or undefined");
      setEditingOrder(order);
      setEditDiscount(Number(order.discount_percentage) || 0);
      setEditPaymentMethod(order.payment_method || "cash");
      
      // Map existing items to editCart
      const mappedItems = (order.OrderItems || order.items || []).map((item) => {
        if (!item) return null;
        const variant = item.variant || item.Variant || item.ProductVariant;
        const product = variant?.product || variant?.Product || item.product || item.Product;
        const variantName = variant?.variant_name || item.variant_name || "Standard";
        const cartItemId = item.variant_id ? `${item.product_id}-${item.variant_id}` : item.product_id;

        return {
          cartItemId,
          product_id: item.product_id,
          variant_id: item.variant_id || null,
          variant_name: variantName,
          name: product?.product_name || item.product_name || "Registry Item",
          price: Number(item.price) || 0,
          qty: Number(item.qty) || 0,
          stock_count: variant?.stock_count || 9999,
        };
      }).filter(Boolean);
      setEditCart(mappedItems);
    } catch (error) {
      console.error("Error starting edit:", error);
      toast.error("Failed to load order details for editing: " + error.message);
    }
  };

  const handleEditIncreaseQty = (cartItemId) => {
    const item = editCart.find((i) => i.cartItemId === cartItemId);
    if (item && item.stock_count !== undefined && item.qty >= item.stock_count) {
      toast.error(`Only ${item.stock_count} units available in stock!`);
      return;
    }

    setEditCart((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const handleEditDecreaseQty = (cartItemId) => {
    setEditCart((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, qty: Math.max(1, item.qty - 1) }
          : item
      )
    );
  };

  const handleEditRemoveItem = (cartItemId) => {
    setEditCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    toast.error("Product removed from queue");
  };

  const handleEditAddToCart = (product, variant = null) => {
    toast.dismiss();
    const unitPrice = variant ? Number(variant.price) : Number(product.price);
    const variantName = variant ? variant.variant_name : "Standard";
    const cartItemId = variant ? `${product.product_id}-${variant.variant_id}` : product.product_id;

    const existingItemIndex = editCart.findIndex((item) => item.cartItemId === cartItemId);

    if (existingItemIndex > -1) {
      const item = editCart[existingItemIndex];
      const stock = variant ? variant.stock_count : (product.stock_count || 9999);
      if (item.qty >= stock) {
        toast.error(`Only ${stock} units available in stock!`);
        return;
      }
      setEditCart((prev) => {
        const updated = [...prev];
        updated[existingItemIndex].qty += 1;
        return updated;
      });
    } else {
      setEditCart((prev) => [
        ...prev,
        {
          cartItemId,
          product_id: product.product_id,
          variant_id: variant?.variant_id || null,
          variant_name: variantName,
          name: product.product_name,
          price: unitPrice,
          qty: 1,
          stock_count: variant ? variant.stock_count : (product.stock_count || 9999),
        },
      ]);
    }

    toast.success(`${variantName} added to edit queue!`, {
      style: {
        borderRadius: "1.5rem",
        background: "#141414",
        color: "#b4a460",
        fontSize: "10px",
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: "0.15em",
        padding: "16px 24px",
      },
    });
    setEditSelectedProductForVariant(null);
  };

  const handleFinalizeEdit = async () => {
    if (editCart.length === 0) return toast.error("Selection queue is empty!");
    if (isFinalizingEdit) return;

    setIsFinalizingEdit(true);
    try {
      const totalAmount = editCart.reduce((sum, item) => sum + item.price * item.qty, 0);
      const discountPercentage = Number(editDiscount) || 0;
      const discountAmount = (totalAmount * discountPercentage) / 100;
      const finalAmount = Math.max(0, totalAmount - discountAmount);

      const updatePayload = {
        subtotal: totalAmount,
        discount_percentage: discountPercentage,
        discount_amount: discountAmount,
        total_amount: finalAmount,
        payment_method: editPaymentMethod,
        items: editCart.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          qty: item.qty,
          price: item.price,
        })),
      };

      const res = await api.put(`/orders/update/${editingOrder.order_id}`, updatePayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        toast.success("Order Updated Successfully!");
        
        const updatedRes = await api.get("/orders/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(updatedRes.data);

        setEditingOrder(null);
      }
    } catch (err) {
      console.error("Edit Order Error:", err);
      toast.error(err.response?.data?.message || "Failed to update order");
    } finally {
      setIsFinalizingEdit(false);
    }
  };

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
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => setSelectedTransaction(order)}
                                className="text-primary hover:text-textMain text-[9px] font-black uppercase flex items-center gap-1.5 hover:scale-110 transition-transform"
                                title="View Full Details"
                              >
                                View <ArrowRight size={12} />
                              </button>
                              <button
                                onClick={() => handleStartEdit(order)}
                                className="text-blue-500 hover:text-blue-700 transition-colors p-1.5 rounded hover:bg-blue-50 transition-all duration-300"
                                title="Edit Order"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order.order_id, salon.salonName)}
                                className="text-red-500 hover:text-red-700 transition-colors p-1.5 rounded hover:bg-red-50 transition-all duration-300"
                                title="Delete Order"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
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
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setViewingTransactionsFor(null); setSelectedTransaction(order); }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-background border border-border text-[10px] font-black uppercase text-textMain/70 hover:text-primary hover:border-primary transition-all">
                      Details <ArrowRight size={14} />
                    </button>
                    <button
                      onClick={() => { setViewingTransactionsFor(null); handleStartEdit(order); }}
                      className="p-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 transition-all border border-blue-200 flex items-center justify-center shrink-0"
                      title="Edit Order"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.order_id, viewingTransactionsFor.salonName)}
                      className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all border border-red-200 flex items-center justify-center shrink-0"
                      title="Delete Order"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
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

      {/* --- EDIT ORDER POPUP MODAL --- */}
      {editingOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-background w-full max-w-6xl rounded-[2rem] border border-primary/30 shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex justify-between items-center bg-black/5 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-primary shadow-lg shadow-black/20">
                  <Pencil size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-primary">
                    Edit Order Console
                  </h3>
                  <p className="text-[10px] font-bold text-textMain/50 uppercase tracking-widest">
                    Ref ID: #{editingOrder.order_id.substring(0, 8).toUpperCase()} • Partner: {editingOrder.customer_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingOrder(null)}
                className="p-2.5 rounded-full hover:bg-red-50 text-textMain/50 hover:text-red-500 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Split Layout Content */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
              
              {/* LEFT SIDE: LIVE INVENTORY */}
              <div className="lg:w-[50%] flex flex-col border-r border-border h-full bg-background min-h-0">
                
                {/* Search Header */}
                <div className="p-4 border-b border-border bg-card shrink-0">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <Package className="text-primary" size={16} />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-textMain">
                        Search Inventory
                      </h4>
                    </div>
                    <span className="text-[8px] font-black bg-primary/10 px-2 py-0.5 rounded-full text-[#8a7b42] uppercase">
                      {editProducts.length} Items
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMain/50" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search cosmetics, shades or variants..." 
                      value={editSearchTerm}
                      onChange={(e) => setEditSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#b4a460]/20 font-bold transition-all"
                    />
                  </div>
                </div>

                {/* Catalog scroll */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0">
                  {isCatalogLoading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-primary" size={24} />
                      <p className="text-[9px] font-black uppercase tracking-widest text-textMain/50">Loading catalog...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-300">
                      {editProducts
                        .filter(p => p.product_name.toLowerCase().includes(editSearchTerm.toLowerCase()))
                        .map(product => {
                          const allVariantsInCart = product.variants && product.variants.length > 0 && product.variants.every(v => 
                            editCart.some(cartItem => cartItem.cartItemId === `${product.product_id}-${v.variant_id}`)
                          );
                          const singleProductInCart = (!product.variants || product.variants.length === 0) && editCart.some(cartItem => cartItem.product_id === product.product_id);

                          // If all variants are in the cart, hide the product card.
                          if (allVariantsInCart || singleProductInCart) {
                            return null; 
                          }

                          return (
                          <div 
                            key={product.product_id}
                            className="bg-card p-4 rounded-2xl border border-border flex flex-col justify-between shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 text-left"
                          >
                            <div>
                              <span className="text-[8px] font-black text-primary uppercase tracking-wider block mb-1">
                                {product.category?.category_name || "Beauty"}
                              </span>
                              <h5 className="font-black text-xs uppercase text-textMain line-clamp-1">
                                {product.product_name}
                              </h5>
                              <p className="text-[9px] text-textMain/40 font-bold mt-0.5">
                                SKU: {product.sku || "N/A"}
                              </p>
                            </div>
                            
                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-border/50">
                              <span className="text-xs font-black text-textMain font-mono">
                                LKR {Number(product.price).toLocaleString()}
                              </span>
                              <button
                                onClick={() => {
                                  if (product.variants && product.variants.length > 0) {
                                    setEditSelectedProductForVariant(product);
                                  } else {
                                    handleEditAddToCart(product);
                                  }
                                }}
                                className="p-2 bg-black text-primary rounded-lg hover:bg-primary hover:text-white transition-all shadow-md active:scale-95 flex items-center justify-center shrink-0"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        )})}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT SIDE: EDIT CART & GENERAL SUMMARY */}
              <div className="lg:w-[50%] flex flex-col bg-card h-full min-h-0 overflow-y-auto custom-scrollbar p-6 space-y-5">
                
                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="text-primary" size={16} />
                    <span className="text-[10px] font-black uppercase tracking-wider text-textMain">
                      Order Items
                    </span>
                  </div>
                  <span className="text-[8px] font-black bg-black px-2 py-0.5 rounded-full text-primary uppercase">
                    {editCart.length} Lines
                  </span>
                </div>

                {/* editCart List */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar shrink-0">
                  {editCart.length > 0 ? (
                    editCart.map((item) => (
                      <div
                        key={item.cartItemId}
                        className="p-3 bg-background rounded-xl border border-border flex justify-between items-center hover:border-primary/20 transition-all text-left"
                      >
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="font-black text-[10px] uppercase text-textMain truncate">
                            {item.name}
                          </p>
                          {item.variant_name && item.variant_name !== "Standard" && (
                            <p className="text-[8px] text-primary font-black uppercase mt-0.5">
                              {item.variant_name}
                            </p>
                          )}
                          <p className="text-[9px] font-bold text-textMain/50 mt-0.5">
                            LKR {item.price.toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 bg-card rounded-lg p-0.5 border border-border">
                            <button
                              onClick={() => handleEditDecreaseQty(item.cartItemId)}
                              className="hover:bg-gray-200 rounded p-0.5 transition-colors"
                            >
                              <Minus size={12} strokeWidth={3} />
                            </button>
                            <span className="font-bold min-w-[16px] text-center text-xs">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => handleEditIncreaseQty(item.cartItemId)}
                              className="hover:bg-gray-200 rounded p-0.5 transition-colors"
                            >
                              <Plus size={12} strokeWidth={3} />
                            </button>
                          </div>
                          <button
                            onClick={() => handleEditRemoveItem(item.cartItemId)}
                            className="p-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center border border-dashed border-border rounded-2xl flex flex-col items-center justify-center">
                      <Package size={24} className="text-textMain/25 mb-1" />
                      <p className="text-[8px] font-black text-textMain/50 uppercase tracking-[0.2em]">
                        Queue is empty
                      </p>
                    </div>
                  )}
                </div>

                {/* Subtotal, discount & payment details */}
                <div className="space-y-4 pt-4 border-t border-border">
                  
                  {/* Discount Percentage */}
                  <div className="p-3 bg-background rounded-xl border border-border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-black text-textMain/50 uppercase tracking-widest">
                        Discount Rate (%)
                      </span>
                      <span className="text-[8px] font-bold text-primary uppercase">
                        Rate Adjustment
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={editDiscount}
                        onChange={(e) => setEditDiscount(Math.min(100, Math.max(0, e.target.value)))}
                        placeholder="0"
                        className="w-full bg-card border-none rounded-lg py-2 pl-3 pr-8 text-xs font-black outline-none focus:ring-1 focus:ring-[#b4a460] text-right shadow-sm"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-primary text-xs">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Settlement mode toggle */}
                  <div className="p-3 bg-background rounded-xl border border-border">
                    <label className="text-[9px] font-black uppercase tracking-widest text-textMain/50 block mb-2 text-left">
                      Settlement Mode
                    </label>
                    <div className="flex gap-2">
                      {['cash', 'credit'].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setEditPaymentMethod(mode)}
                          className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${
                            editPaymentMethod === mode
                              ? 'bg-primary border-primary text-white shadow-md'
                              : 'bg-card border-border text-textMain/50 hover:border-primary/20'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price calculations */}
                  <div className="py-2 text-right">
                    <p className="text-[8px] font-black text-textMain/50 uppercase tracking-widest mb-1">
                      Final Payable
                    </p>
                    <div className="flex items-baseline justify-end gap-0.5">
                      <span className="text-[9px] font-black text-primary">LKR</span>
                      <span className="text-2xl font-black text-textMain tracking-tighter leading-none">
                        {Math.max(
                          0,
                          editCart.reduce((sum, item) => sum + item.price * item.qty, 0) * (1 - (Number(editDiscount) || 0) / 100)
                        ).toLocaleString()}
                      </span>
                    </div>
                    {editDiscount > 0 && (
                      <div className="inline-block mt-1 px-2 py-0.5 bg-primary/10 rounded-md">
                        <p className="text-[8px] text-primary font-black uppercase italic tracking-tighter">
                          {editDiscount}% OFF Applied
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Finalize button */}
                  <button
                    onClick={handleFinalizeEdit}
                    disabled={editCart.length === 0 || isFinalizingEdit}
                    className="w-full py-3.5 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg bg-black text-primary border border-black hover:bg-primary hover:text-white hover:border-primary hover:scale-[1.01] active:scale-95 transition-all disabled:bg-gray-100 disabled:text-textMain/40 disabled:border-border disabled:scale-100 disabled:cursor-not-allowed"
                  >
                    {isFinalizingEdit ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} strokeWidth={3} />
                        <span>Finalize Edit</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* --- EDIT VARIATION SELECTION MODAL --- */}
      {editSelectedProductForVariant && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-8 space-y-6 text-left">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-serif italic text-textMain leading-tight">
                    {editSelectedProductForVariant.product_name}
                  </h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-textMain/50 mt-1">
                    Select Shade / Variant
                  </p>
                </div>
                <button
                  onClick={() => setEditSelectedProductForVariant(null)}
                  className="p-2 hover:bg-gray-100 rounded-full text-textMain/50 hover:text-textMain transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {editSelectedProductForVariant.variants.map((variant) => (
                  <button
                    key={variant.variant_id}
                    onClick={() => handleEditAddToCart(editSelectedProductForVariant, variant)}
                    className="flex justify-between items-center p-4 bg-background hover:bg-primary/10 border border-border hover:border-primary/20 rounded-2xl transition-all group w-full text-left"
                  >
                    <div className="flex flex-col">
                      <span className="font-black text-[10px] uppercase tracking-wider text-textMain group-hover:text-primary transition-all">
                        {variant.variant_name}
                      </span>
                      <span className="text-[8px] text-textMain/50 font-bold mt-0.5">
                        INSTOCK: {variant.stock_count || 0}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-black text-textMain">
                        Rs. {Number(variant.price).toLocaleString()}
                      </span>
                      <div className="p-2 bg-card rounded-lg group-hover:bg-black group-hover:text-primary transition-all">
                        <Plus size={14} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;