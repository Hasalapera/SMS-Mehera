import React, { useState, useEffect, useRef } from 'react';
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
import { useNotifications } from "../context/NotificationContext";

const Inbox = () => {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    getUnreadByType,
    addNotification 
  } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [fontScale, setFontScale] = useState(1);
  const wrapperRef = useRef(null);

  // Initialize with mock data on first load
  useEffect(() => {
    if (notifications.length === 0) {
      initializeMockNotifications();
    }
    setLoading(false);
  }, []);

  // Handle responsive font scaling
  useEffect(() => {
    const handleScaling = () => {
      if (wrapperRef.current) {
        const availableWidth = wrapperRef.current.offsetWidth;
        const designWidth = 800; // Original Design Base

        if (availableWidth < designWidth) {
          const ratio = availableWidth / designWidth;
          setFontScale(ratio);
        } else {
          setFontScale(1);
        }
      }
    };

    handleScaling();
    window.addEventListener("resize", handleScaling);
    return () => window.removeEventListener("resize", handleScaling);
  }, []);

  // Initialize mock notifications for demo
  const initializeMockNotifications = () => {
    const now = new Date();
    
    const mockNotifs = [
      {
        type: 'stock',
        title: '🔴 Critical Stock Alert',
        message: 'KOHL PENCIL - Shade 01 is OUT OF STOCK (0 units remaining)',
        severity: 'critical'
      },
      {
        type: 'stock',
        title: '🟡 Low Stock Alert',
        message: 'LONG & CURLY MASCARA is running LOW (8 units remaining)',
        severity: 'warning'
      },
      {
        type: 'stock',
        title: '🟡 Low Stock Alert',
        message: 'PERFECT FINISH LOOSE POWDER has dropped to low level (9 units)',
        severity: 'warning'
      },
      {
        type: 'customer',
        title: 'New Customer Added',
        message: 'BEAUTY SALON COLOMBO was registered as a new customer',
        severity: 'info'
      },
      {
        type: 'order',
        title: 'New Order Placed',
        message: 'Order #ORD-001 worth Rs. 15,000 has been created',
        severity: 'info'
      },
      {
        type: 'order',
        title: 'New Order Placed',
        message: 'Order #ORD-002 worth Rs. 8,500 has been created',
        severity: 'info'
      },
      {
        type: 'user',
        title: 'New User Created',
        message: 'Amal Kumara (amal@mehera.com) has been added to the system',
        severity: 'info'
      },
    ];

    mockNotifs.forEach((notif, index) => {
      addNotification({
        ...notif,
        created_at: new Date(now.getTime() - (index * 60 * 60000))
      });
    });
  };

  const handleMarkAsRead = (id) => {
    markAsRead(id);
    toast.success('Marked as read');
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast.success('All marked as read');
  };

  const handleDelete = (id) => {
    deleteNotification(id);
    toast.error('Notification deleted');
  };

  // Filter notifications
  const filteredNotifications = activeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeFilter);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const unreadByType = getUnreadByType();

  // Notification config
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
      <Toaster position="top-right" />

      {/* Header - Using CSS Variables */}
      <div className="bg-black px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-5 border-b-4 border-primary dark:border-primary">
        <div className="flex items-center gap-5">
          {/* Icon Box */}
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
            {/* Unread Badge */}
            <div className="px-4 py-2.5 bg-primary/20 rounded-2xl flex items-center gap-2">
              <span className="text-sm font-black text-primary dark:text-primary">{unreadCount} Unread</span>
            </div>
            
            {/* Mark All Read Button */}
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
        {/* Filter Tabs - Using CSS Variables */}
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

        {/* Notifications List - Using CSS Variables */}
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

// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// // import { 
// //   Bell, Package, User, Users, ShoppingCart, Trash2, Check, CheckAll,
// //   Loader2, AlertCircle, TrendingDown, UserPlus, Zap
// // } from 'lucide-react';
// import {
//   Bell,
//   Package,
//   User,
//   Users,
//   ShoppingCart,
//   Trash2,
//   Check,
//   Loader2,
//   AlertCircle,
//   TrendingDown,
//   UserPlus,
//   Zap,
// } from 'lucide-react';
// import { toast } from 'react-hot-toast';
// import { useAuth } from "../context/AuthContext";

// const Inbox = () => {
//   const { token, logout, user } = useAuth();
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeFilter, setActiveFilter] = useState('all');
//   const [unreadCounts, setUnreadCounts] = useState({});
//   const [fontScale, setFontScale] = useState(1);
//   const wrapperRef = useRef(null);

//   useEffect(() => {
//     if (!token) return;
//     fetchNotifications();
//     // Poll for new notifications every 30 seconds
//     const interval = setInterval(fetchNotifications, 30000);
//     return () => clearInterval(interval);
//   }, [token]);

//   useEffect(() => {
//     const handleScaling = () => {
//       if (wrapperRef.current) {
//         const availableWidth = wrapperRef.current.offsetWidth;
//         const designWidth = 800; // Original Design Base

//         if (availableWidth < designWidth) {
//           const ratio = availableWidth / designWidth;
//           setFontScale(ratio);
//         } else {
//           setFontScale(1);
//         }
//       }
//     };

//     handleScaling();
//     window.addEventListener("resize", handleScaling);
//     return () => window.removeEventListener("resize", handleScaling);
//   }, []);

//   const fetchNotifications = async () => {
//     try {
//       const config = { headers: { Authorization: `Bearer ${token}` } };
//       const res = await axios.get('http://localhost:5001/api/notifications', config);
//       setNotifications(res.data.notifications || []);
      
//       // Build unread counts
//       const counts = {};
//       res.data.unreadByType?.forEach(item => {
//         counts[item.type] = item.count;
//       });
//       setUnreadCounts(counts);
//       setLoading(false);
//     } catch (err) {
//       if (err.response?.status === 401) {
//         logout();
//       } else {
//         console.error('Failed to fetch notifications', err);
//       }
//       setLoading(false);
//     }
//   };

//   const handleMarkAsRead = async (id) => {
//     try {
//       const config = { headers: { Authorization: `Bearer ${token}` } };
//       await axios.patch(`http://localhost:5001/api/notifications/${id}/read`, {}, config);
//       setNotifications(prev =>
//         prev.map(n => n.notification_id === id ? { ...n, is_read: true, read_at: new Date() } : n)
//       );
//       toast.success('Marked as read');
//     } catch (err) {
//       toast.error('Failed to mark as read');
//     }
//   };

//   const handleMarkAllAsRead = async () => {
//     try {
//       const config = { headers: { Authorization: `Bearer ${token}` } };
//       await axios.patch('http://localhost:5001/api/notifications/read-all', {}, config);
//       setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
//       toast.success('All marked as read');
//     } catch (err) {
//       toast.error('Failed to mark all as read');
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       const config = { headers: { Authorization: `Bearer ${token}` } };
//       await axios.delete(`http://localhost:5001/api/notifications/${id}`, config);
//       setNotifications(prev => prev.filter(n => n.notification_id !== id));
//       toast.error('Notification deleted');
//     } catch (err) {
//       toast.error('Failed to delete notification');
//     }
//   };

//   // Filter notifications
//   const filteredNotifications = activeFilter === 'all'
//     ? notifications
//     : notifications.filter(n => n.type === activeFilter);

//   const unreadCount = notifications.filter(n => !n.is_read).length;

//   // Notification icon and color mapping
//   const getNotificationConfig = (type, severity) => {
//     const configs = {
//       stock: { icon: Package, color: '#b4a460', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
//       customer: { icon: UserPlus, color: '#10b981', bgColor: 'bg-green-50 dark:bg-green-900/20' },
//       user: { icon: Users, color: '#3b82f6', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
//       order: { icon: ShoppingCart, color: '#8b5cf6', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
//     };

//     if (type === 'stock' && severity === 'critical') {
//       return { icon: TrendingDown, color: '#ef4444', bgColor: 'bg-red-50 dark:bg-red-900/20' };
//     }

//     return configs[type] || configs.stock;
//   };

//   if (loading) {
//     return (
//       <div className="w-full min-h-screen bg-background flex items-center justify-center">
//         <div className="flex items-center gap-3">
//           <Loader2 className="animate-spin text-primary" size={24} />
//           <p className="text-textMain font-medium">Loading notifications...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div ref={wrapperRef} className="w-full min-h-screen bg-background overflow-x-hidden">

//       {/* Black Header */}
//       <div className="bg-card px-[2em] py-[1.75em] flex flex-col md:flex-row items-center justify-between gap-[1.25em] border-b border-border transition-all duration-500">
//         <div className="flex items-center gap-[1.25em]">
//           {/* 🔔 Icon Box - මේක branding නිසා primary පාටටම තියෙන එක ලස්සනයි */}
//           <div className="p-[0.75em] bg-primary rounded-[1.25em] text-black">
//             <Bell size={26 * fontScale} strokeWidth={2.5} />
//           </div>
          
//           <div>
//             <p className="text-[0.625em] font-bold text-textMain/50 uppercase tracking-widest mb-[0.1em]">
//               Communication Center
//             </p>
//             <h1 className="text-[1.5em] font-black text-textMain uppercase tracking-tight leading-none">
//               Notification Inbox
//             </h1>
//           </div>
//         </div>

//         {unreadCount > 0 && (
//           <div className="flex items-center gap-[1em]">
//             {/* 🏷️ Unread Badge */}
//             <div className="px-[1em] py-[0.6em] bg-primary/10 rounded-[1em] flex items-center gap-[0.5em]">
//               <span className="text-[0.875em] font-black text-primary italic">
//                 {unreadCount} Unread
//               </span>
//             </div>
            
//             {/* 🔘 Mark All Read Button */}
//             <button
//               onClick={handleMarkAllAsRead}
//               className="px-[1em] py-[0.6em] bg-background text-textMain border border-border rounded-[0.5em] text-[0.5625em] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all shadow-sm focus:outline-none"
//             >
//               Mark All Read
//             </button>
//           </div>
//         )}
//       </div>

//       <div className="p-6 md:p-8">
//         {/* Filter Tabs */}
//         <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
//           {[
//             { key: 'all', label: 'All', icon: Bell },
//             { key: 'stock', label: 'Stock Alerts', icon: Package },
//             { key: 'customer', label: 'Customers', icon: UserPlus },
//             { key: 'user', label: 'Users', icon: Users },
//             { key: 'order', label: 'Orders', icon: ShoppingCart },
//           ].map(tab => (
//             <button
//               key={tab.key}
//               onClick={() => setActiveFilter(tab.key)}
//               className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap focus:outline-none ${
//                 activeFilter === tab.key
//                   ? 'bg-black text-primary dark:bg-primary dark:text-black shadow-lg'
//                   : 'bg-card text-textMain border border-border hover:border-primary/30'
//               }`}
//             >
//               <tab.icon size={14} />
//               {tab.label}
//               {tab.key !== 'all' && unreadCounts[tab.key] > 0 && (
//                 <span className="ml-1 px-2 py-0.5 bg-primary/20 rounded-full text-[8px] font-black">
//                   {unreadCounts[tab.key]}
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>

//         {/* Notifications List */}
//         {filteredNotifications.length > 0 ? (
//           <div className="space-y-3">
//             {filteredNotifications.map(notification => {
//               const config = getNotificationConfig(notification.type, notification.severity);
//               const IconComponent = config.icon;

//               return (
//                 <div
//                   key={notification.notification_id}
//                   className={`p-5 rounded-[1.5rem] border transition-all ${
//                     notification.is_read
//                       ? `bg-card border-border opacity-75`
//                       : `${config.bgColor} border-primary/20 ring-1 ring-primary/10`
//                   }`}
//                 >
//                   <div className="flex items-start gap-4">
//                     {/* Icon */}
//                     <div className={`p-3 rounded-xl shrink-0 ${config.bgColor}`}>
//                       <IconComponent size={20} color={config.color} />
//                     </div>

//                     {/* Content */}
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-start justify-between gap-4">
//                         <div>
//                           <h3 className="text-sm font-black text-textMain uppercase tracking-tight mb-1">
//                             {notification.title}
//                           </h3>
//                           <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
//                             {notification.message}
//                           </p>
//                           <p className="text-[8px] text-gray-400 dark:text-gray-500 mt-2 uppercase tracking-widest">
//                             {new Date(notification.created_at).toLocaleString('en-GB')}
//                           </p>
//                         </div>

//                         {/* Status Badge */}
//                         <div className="shrink-0">
//                           {notification.severity && notification.severity !== 'info' && (
//                             <span className={`text-[7px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${
//                               notification.severity === 'critical'
//                                 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
//                                 : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
//                             }`}>
//                               {notification.severity.toUpperCase()}
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     {/* Action Buttons */}
//                     <div className="flex items-center gap-2 shrink-0">
//                       {!notification.is_read && (
//                         <button
//                           onClick={() => handleMarkAsRead(notification.notification_id)}
//                           className="p-2 hover:bg-primary/20 rounded-lg transition-all text-primary focus:outline-none"
//                           title="Mark as read"
//                         >
//                           <Check size={16} />
//                         </button>
//                       )}
//                       <button
//                         onClick={() => handleDelete(notification.notification_id)}
//                         className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all text-gray-400 hover:text-red-600 focus:outline-none"
//                         title="Delete"
//                       >
//                         <Trash2 size={16} />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         ) : (
//           <div className="py-20 text-center">
//             <Bell size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
//             <h3 className="text-lg font-black text-textMain uppercase">No Notifications</h3>
//             <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
//               {activeFilter === 'all'
//                 ? "You're all caught up!"
//                 : `No ${activeFilter} notifications yet`}
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Inbox;