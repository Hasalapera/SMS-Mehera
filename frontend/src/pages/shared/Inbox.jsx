import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axiosInstance'; // Use same api instance as AddStock
import {
  Bell,
  Package,
  Users,
  ShoppingCart,
  Trash2,
  Check,
  Loader2,
  TrendingDown,
  UserPlus,
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const Inbox = () => {
  const { token, logout } = useAuth();
  const {
    notifications,
    setNotificationsFromAPI, // Load real data into context
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadByType,
  } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [fontScale, setFontScale] = useState(1);
  const wrapperRef = useRef(null);

  // Fetch real notifications from backend on load + poll every 30s
  useEffect(() => {
    if (!token) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Responsive font scaling
  useEffect(() => {
    const handleScaling = () => {
      if (wrapperRef.current) {
        const availableWidth = wrapperRef.current.offsetWidth;
        const designWidth = 800;
        setFontScale(availableWidth < designWidth ? availableWidth / designWidth : 1);
      }
    };
    handleScaling();
    window.addEventListener('resize', handleScaling);
    return () => window.removeEventListener('resize', handleScaling);
  }, []);

  // Fetch from backend and load into context
  const fetchNotifications = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await api.get('/notifications', config);
      setNotificationsFromAPI(res.data.notifications || []);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
      } else {
        console.error('Failed to fetch notifications:', err);
      }
      setLoading(false);
    }
  };

  // Mark single as read — update DB + context
  const handleMarkAsRead = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await api.patch(`/notifications/${id}/read`, {}, config);
      markAsRead(id);
      toast.success('Marked as read');
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  // Mark all as read — update DB + context
  const handleMarkAllAsRead = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await api.patch('/notifications/read-all', {}, config);
      markAllAsRead();
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  // Delete — soft delete in DB + remove from context
  const handleDelete = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await api.delete(`/notifications/${id}`, config);
      deleteNotification(id);
      toast.error('Notification deleted');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const filteredNotifications = activeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeFilter);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const unreadByType = getUnreadByType();

  // Icon, color, and background per notification type/severity
  const getNotificationConfig = (type, severity) => {
    const configs = {
      stock: {
        icon: Package,
        color: '#b4a460',
        bgColor: 'bg-yellow-50/80 dark:bg-yellow-900/20',
        textColor: 'text-yellow-800 dark:text-yellow-200'
      },
      customer: {
        icon: UserPlus,
        color: '#059669',
        bgColor: 'bg-emerald-50/80 dark:bg-emerald-900/20',
        textColor: 'text-emerald-800 dark:text-emerald-200'
      },
      user: {
        icon: Users,
        color: '#0ea5e9',
        bgColor: 'bg-sky-50/80 dark:bg-sky-900/20',
        textColor: 'text-sky-800 dark:text-sky-200'
      },
      order: {
        icon: ShoppingCart,
        color: '#a855f7',
        bgColor: 'bg-purple-50/80 dark:bg-purple-900/20',
        textColor: 'text-purple-800 dark:text-purple-200'
      },
    };

    if (type === 'stock' && severity === 'critical') {
      return {
        icon: TrendingDown,
        color: '#dc2626',
        bgColor: 'bg-red-50/80 dark:bg-red-900/20',
        textColor: 'text-red-800 dark:text-red-200'
      };
    }

    return configs[type] || configs.stock;
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={24} />
          <p className="text-textMain font-medium">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="w-full min-h-screen overflow-x-hidden bg-background text-textMain font-sans transition-colors duration-500">

      {/* Header */}
      <div className="bg-card/90 backdrop-blur-md px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-5 border-b border-border shadow-sm transition-colors duration-500">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-primary rounded-2xl text-textMain shadow-lg shadow-[#b4a460]/15">
            <Bell size={26 * fontScale} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-textMain/50 uppercase tracking-widest mb-0.5">
              Communication Center
            </p>
            <h1 className="text-2xl font-black text-textMain uppercase tracking-tight">
              Notification Inbox
            </h1>
          </div>
        </div>

        {unreadCount > 0 && (
          <div className="flex items-center gap-4">
            <div className="px-4 py-2.5 bg-primary/15 rounded-2xl flex items-center gap-2 border border-primary/20">
              <span className="text-sm font-black text-primary">{unreadCount} Unread</span>
            </div>
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2.5 bg-background text-textMain border border-border rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all focus:outline-none"
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
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap focus:outline-none ${
                activeFilter === tab.key
                    ? 'bg-primary text-black shadow-lg shadow-[#b4a460]/20'
                    : 'bg-card text-textMain border border-border hover:border-primary/30'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
              {tab.key !== 'all' && unreadByType[tab.key] > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-primary/20 rounded-full text-[8px] font-black text-primary">
                  {unreadByType[tab.key]}
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
              const isThemeHighlightedMessage =
                ['stock', 'customer', 'user', 'order'].includes(notification.type) || (notification.severity && notification.severity !== 'info');
              return (
                <div
                  key={notification.notification_id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isThemeHighlightedMessage
                      ? 'bg-card border-primary/20 ring-1 ring-primary/10 shadow-sm shadow-primary/5'
                      : notification.is_read
                      ? 'bg-card border-border opacity-75'
                      : `${config.bgColor} border-primary/20 ring-1 ring-primary/10`
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Type icon */}
                    <div className={`p-3 rounded-xl shrink-0 ${isThemeHighlightedMessage ? 'bg-primary/10 dark:bg-primary/15' : config.bgColor}`}>
                      <IconComponent size={20} color={config.color} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className={`text-sm md:text-base font-black uppercase tracking-tight mb-1 ${isThemeHighlightedMessage ? 'text-primary dark:text-primary' : 'text-textMain dark:text-textMain'}`}>
                            {notification.title}
                          </h3>
                          <p className={`leading-relaxed max-w-2xl ${isThemeHighlightedMessage ? 'text-[11px] md:text-[13px] font-semibold text-textMain/90 dark:text-textMain/95' : 'text-[10px] text-textMain/80 dark:text-textMain/85'}`}>
                            {notification.message}
                          </p>
                          <p className="text-[8px] text-textMain/55 dark:text-textMain/60 mt-2 uppercase tracking-widest">
                            {new Date(notification.createdAt || notification.created_at).toLocaleString('en-GB')}
                          </p>
                        </div>

                        {/* Severity badge */}
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

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.notification_id)}
                          className="p-2 rounded-lg transition-all duration-200 bg-primary text-black border border-primary/30 hover:bg-primary/90 hover:scale-105 hover:shadow-md hover:shadow-[#b4a460]/25 focus:outline-none shadow-sm shadow-[#b4a460]/20"
                          title="Mark as read"
                        >
                          <Check size={16} strokeWidth={3} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.notification_id)}
                        className="p-2 rounded-lg transition-all duration-200 text-red-600 dark:text-red-400 bg-red-100/80 dark:bg-red-900/20 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-900/30 hover:scale-105 hover:shadow-md hover:shadow-red-500/15 focus:outline-none shadow-sm"
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
            <Bell size={40} className="mx-auto text-textMain/20 mb-4" />
            <h3 className="text-lg font-black text-textMain uppercase">No Notifications</h3>
            <p className="text-sm text-textMain/50 mt-2">
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