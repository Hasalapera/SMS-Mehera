import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import { 
//   Bell, Package, User, Users, ShoppingCart, Trash2, Check, CheckAll,
//   Loader2, AlertCircle, TrendingDown, UserPlus, Zap
// } from 'lucide-react';
import {
  Bell,
  Package,
  User,
  Users,
  ShoppingCart,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
  TrendingDown,
  UserPlus,
  Zap
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { useAuth } from "../context/AuthContext";

const Inbox = () => {
  const { token, logout, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    if (!token) return;
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('http://localhost:5001/api/notifications', config);
      setNotifications(res.data.notifications || []);
      
      // Build unread counts
      const counts = {};
      res.data.unreadByType?.forEach(item => {
        counts[item.type] = item.count;
      });
      setUnreadCounts(counts);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
      } else {
        console.error('Failed to fetch notifications', err);
      }
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.patch(`http://localhost:5001/api/notifications/${id}/read`, {}, config);
      setNotifications(prev =>
        prev.map(n => n.notification_id === id ? { ...n, is_read: true, read_at: new Date() } : n)
      );
      toast.success('Marked as read');
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.patch('http://localhost:5001/api/notifications/read-all', {}, config);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5001/api/notifications/${id}`, config);
      setNotifications(prev => prev.filter(n => n.notification_id !== id));
      toast.error('Notification deleted');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  // Filter notifications
  const filteredNotifications = activeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeFilter);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Notification icon and color mapping
  const getNotificationConfig = (type, severity) => {
    const configs = {
      stock: { icon: Package, color: '#b4a460', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
      customer: { icon: UserPlus, color: '#10b981', bgColor: 'bg-green-50 dark:bg-green-900/20' },
      user: { icon: Users, color: '#3b82f6', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
      order: { icon: ShoppingCart, color: '#8b5cf6', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
    };

    if (type === 'stock' && severity === 'critical') {
      return { icon: TrendingDown, color: '#ef4444', bgColor: 'bg-red-50 dark:bg-red-900/20' };
    }

    return configs[type] || configs.stock;
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={24} />
          <p className="text-textMain font-medium">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background">
      <Toaster position="top-right" />

      {/* Black Header */}
      <div className="bg-black px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-5 border-b-4 border-primary dark:border-b-4">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-primary rounded-2xl text-black dark:text-black">
            <Bell size={26} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">
              Communication Center
            </p>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">Notification Inbox</h1>
          </div>
        </div>

        {unreadCount > 0 && (
          <div className="flex items-center gap-4">
            <div className="px-4 py-2.5 bg-primary/20 rounded-2xl flex items-center gap-2">
              <span className="text-sm font-black text-primary">{unreadCount} Unread</span>
            </div>
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2.5 bg-white text-black rounded-lg text-[9px] font-black uppercase tracking-widest hover:shadow-lg transition-all"
            >
              Mark All Read
            </button>
          </div>
        )}
      </div>

      <div className="p-6 md:p-8">
        {/* Filter Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'All', icon: Bell },
            { key: 'stock', label: 'Stock Alerts', icon: Package },
            { key: 'customer', label: 'Customers', icon: UserPlus },
            { key: 'user', label: 'Users', icon: Users },
            { key: 'order', label: 'Orders', icon: ShoppingCart },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                activeFilter === tab.key
                  ? 'bg-black text-primary dark:bg-primary dark:text-black shadow-lg'
                  : 'bg-card text-textMain border border-border dark:border-gray-700 hover:border-primary/30'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
              {tab.key !== 'all' && unreadCounts[tab.key] > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-primary/20 rounded-full text-[8px] font-black">
                  {unreadCounts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map(notification => {
              const config = getNotificationConfig(notification.type, notification.severity);
              const IconComponent = config.icon;

              return (
                <div
                  key={notification.notification_id}
                  className={`p-5 rounded-[1.5rem] border transition-all ${
                    notification.is_read
                      ? `bg-card border-border dark:border-gray-700 opacity-75`
                      : `${config.bgColor} border-primary/20 ring-1 ring-primary/10`
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl shrink-0 ${config.bgColor}`}>
                      <IconComponent size={20} color={config.color} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-black text-textMain uppercase tracking-tight mb-1">
                            {notification.title}
                          </h3>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
                            {notification.message}
                          </p>
                          <p className="text-[8px] text-gray-400 dark:text-gray-500 mt-2 uppercase tracking-widest">
                            {new Date(notification.created_at).toLocaleString('en-GB')}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {notification.severity && notification.severity !== 'info' && (
                            <span className={`text-[7px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${
                              notification.severity === 'critical'
                                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                            }`}>
                              {notification.severity.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.notification_id)}
                          className="p-2 hover:bg-primary/20 rounded-lg transition-all text-primary"
                          title="Mark as read"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.notification_id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center">
            <Bell size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-black text-textMain uppercase">No Notifications</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {activeFilter === 'all'
                ? "You're all caught up! 🎉"
                : `No ${activeFilter} notifications yet`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;