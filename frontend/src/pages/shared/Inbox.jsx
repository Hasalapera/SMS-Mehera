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
    <div ref={wrapperRef} className="w-full min-h-screen overflow-x-hidden" style={{ backgroundColor: 'var(--color-background)' }}>

      {/* Header */}
      <div className="bg-black px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-5 border-b-4 border-primary dark:border-primary">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-primary rounded-2xl text-black dark:text-black">
            <Bell size={26 * fontScale} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-0.5">
              Communication Center
            </p>
            <h1 className="text-2xl font-black text-white dark:text-white uppercase tracking-tight">
              Notification Inbox
            </h1>
          </div>
        </div>

        {unreadCount > 0 && (
          <div className="flex items-center gap-4">
            <div className="px-4 py-2.5 bg-primary/20 rounded-2xl flex items-center gap-2">
              <span className="text-sm font-black text-primary dark:text-primary">{unreadCount} Unread</span>
            </div>
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2.5 bg-card text-textMain border border-border dark:border-gray-700 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-black dark:hover:bg-primary dark:hover:text-black transition-all focus:outline-none"
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
                  ? 'bg-black dark:bg-primary text-primary dark:text-black shadow-lg'
                  : 'bg-card text-textMain border border-border dark:border-gray-700 hover:border-primary/30'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
              {tab.key !== 'all' && unreadByType[tab.key] > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-primary/20 rounded-full text-[8px] font-black text-primary dark:text-primary">
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

              return (
                <div
                  key={notification.notification_id}
                  className={`p-5 rounded-[1.5rem] border transition-all ${
                    notification.is_read
                      ? 'bg-card border-border dark:border-gray-700 opacity-75'
                      : `${config.bgColor} border-primary/20 ring-1 ring-primary/10`
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Type icon */}
                    <div className={`p-3 rounded-xl shrink-0 ${config.bgColor}`}>
                      <IconComponent size={20} color={config.color} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className={`text-sm font-black ${config.textColor} uppercase tracking-tight mb-1`}>
                            {notification.title}
                          </h3>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
                            {notification.message}
                          </p>
                          <p className="text-[8px] text-gray-400 dark:text-gray-500 mt-2 uppercase tracking-widest">
                            {notification.created_at && new Date(notification.created_at).toLocaleString('en-GB')}
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
                          className="p-2 hover:bg-primary/20 dark:hover:bg-primary/20 rounded-lg transition-all text-primary dark:text-primary focus:outline-none"
                          title="Mark as read"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.notification_id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 focus:outline-none"
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
            <h3 className="text-lg font-black text-textMain dark:text-textMain uppercase">No Notifications</h3>
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