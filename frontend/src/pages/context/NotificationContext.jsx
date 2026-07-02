import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../../api/axiosInstance';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  //Load notifications fetched from API into context
  const setNotificationsFromAPI = useCallback((apiNotifications) => {
    setNotifications(apiNotifications);
  }, []);

  const refreshNotifications = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setNotifications([]);
      return [];
    }

    try {
      setLoading(true);
      const res = await api.get('/notifications');
      const apiNotifications = res.data.notifications || [];
      setNotifications(apiNotifications);
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
  }, []);

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
    setNotifications(prev => [newNotif, ...prev]);
    return newNotif;
  }, []);

  // Mark single notification as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n =>
        n.notification_id === id
          ? { ...n, is_read: true, read_at: new Date() }
          : n
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true, read_at: new Date() }))
    );
  }, []);

  // Remove notification from list
  const deleteNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.notification_id !== id));
  }, []);

  // Get unread count grouped by type (for filter tab badges)
  const getUnreadByType = useCallback(() => {
    const counts = {};
    notifications.forEach(notif => {
      if (!notif.is_read) {
        counts[notif.type] = (counts[notif.type] || 0) + 1;
      }
    });
    return counts;
  }, [notifications]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);


  // Total unread count (for sidebar bell badge)
  const unreadCount = notifications.filter(n => !n.is_read).length;

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
