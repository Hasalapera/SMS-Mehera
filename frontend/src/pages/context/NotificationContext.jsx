import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../../api/axiosInstance';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadByType, setUnreadByType] = useState({});
  const [loading, setLoading] = useState(false);

  //Load notifications fetched from API into context
  const setNotificationsFromAPI = useCallback((apiNotifications) => {
    setNotifications(apiNotifications);
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setUnreadCount(0);
      setUnreadByType({});
      return 0;
    }

    const res = await api.get('/notifications/unread-count');
    const count = Number(res.data.unread_count) || 0;
    setUnreadCount(count);
    setUnreadByType(res.data.unread_by_type || {});
    return count;
  }, []);

  const refreshNotifications = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      setUnreadByType({});
      return [];
    }

    try {
      setLoading(true);
      const res = await api.get('/notifications');
      const apiNotifications = res.data.notifications || [];
      setNotifications(prev => {
        if (prev.length <= 50) return apiNotifications;
        const latestIds = new Set(apiNotifications.map(n => n.notification_id));
        return [
          ...apiNotifications,
          ...prev.filter(n => !latestIds.has(n.notification_id)),
        ];
      });
      await refreshUnreadCount();
      return apiNotifications;
    } catch (err) {
      // 💡 Improved Error Handling: Differentiate between network errors and other errors.
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        // This is a connection error, likely because the backend server is not running.
        // We log a warning instead of an error to reduce console noise during development.
        console.warn('Notification refresh failed: Could not connect to the server. Is the backend running?');
      } else if (err.response?.status !== 401) {
        // This handles other server-side errors (e.g., 500 Internal Server Error).
        console.error('Failed to refresh notifications:', err);
      }
      // For 401 errors, we do nothing here, as AuthContext/interceptors will handle it.
      return [];
    } finally {
      setLoading(false);
    }
  }, [refreshUnreadCount]);

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(() => {
      refreshNotifications();
    }, 30000);

    const handleAuthChange = () => refreshNotifications();
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('token-refreshed', handleAuthChange);
    window.addEventListener('auth-changed', handleAuthChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('token-refreshed', handleAuthChange);
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, [refreshNotifications]);

  // Add new notification to top of list (called from AddStock after apply)
  const addNotification = useCallback((notification) => {
    const newNotif = {
      notification_id: Date.now().toString(),
      is_read: false,
      read_at: null,
      created_at: new Date(),
      ...notification,
    };
    if (notifications.some(n => n.notification_id === newNotif.notification_id)) return newNotif;
    setNotifications(prev => [newNotif, ...prev]);
    if (!newNotif.is_read) {
      setUnreadCount(count => count + 1);
      setUnreadByType(counts => ({
        ...counts,
        [newNotif.type]: (counts[newNotif.type] || 0) + 1,
      }));
    }
    return newNotif;
  }, [notifications]);

  // Mark single notification as read
  const markAsRead = useCallback((id) => {
    const notification = notifications.find(n => n.notification_id === id);
    if (notification && !notification.is_read) {
      setUnreadCount(count => Math.max(0, count - 1));
      setUnreadByType(counts => ({
        ...counts,
        [notification.type]: Math.max(0, (counts[notification.type] || 0) - 1),
      }));
    }
    setNotifications(prev =>
      prev.map(n =>
        n.notification_id === id
          ? { ...n, is_read: true, read_at: new Date() }
          : n
      )
    );
  }, [notifications]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setUnreadCount(0);
    setUnreadByType({});
    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true, read_at: new Date() }))
    );
  }, []);

  // Remove notification from list
  const deleteNotification = useCallback((id) => {
    const notification = notifications.find(n => n.notification_id === id);
    if (notification && !notification.is_read) {
      setUnreadCount(count => Math.max(0, count - 1));
      setUnreadByType(counts => ({
        ...counts,
        [notification.type]: Math.max(0, (counts[notification.type] || 0) - 1),
      }));
    }
    setNotifications(prev => prev.filter(n => n.notification_id !== id));
  }, [notifications]);

  // Get unread count grouped by type (for filter tab badges)
  const getUnreadByType = useCallback(() => {
    return unreadByType;
  }, [unreadByType]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    setUnreadByType({});
  }, []);

  const value = {
    notifications,
    loading,
    setNotificationsFromAPI, // New
    refreshNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadByType,
    unreadCount,             // New
    clearNotifications,      // New
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
