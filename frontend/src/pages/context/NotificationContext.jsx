import { createContext, useContext, useState, useCallback } from 'react';

// Create notification context
const NotificationContext = createContext();

// Provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add new notification to the top
  const addNotification = useCallback((notification) => {
    const newNotif = {
      notification_id: Date.now().toString(), // Temporary ID
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

  // Delete notification
  const deleteNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.notification_id !== id));
  }, []);

  // Get unread count by type
  const getUnreadByType = useCallback(() => {
    const counts = {};
    notifications.forEach(notif => {
      if (!notif.is_read) {
        counts[notif.type] = (counts[notif.type] || 0) + 1;
      }
    });
    return counts;
  }, [notifications]);

  const value = {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadByType,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notifications anywhere
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};