import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  //Load notifications fetched from API into context
  const setNotificationsFromAPI = useCallback((apiNotifications) => {
    setNotifications(apiNotifications);
  }, []);

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

  // Total unread count (for sidebar bell badge)
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const value = {
    notifications,
    setNotificationsFromAPI, // New
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadByType,
    unreadCount,             // New
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