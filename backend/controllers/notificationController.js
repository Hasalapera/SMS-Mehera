const { Notification, NotificationRead, User } = require('../models');
const { Op } = require('sequelize');

// Role-based notification type filter
const getRoleBasedFilter = (role) => {
  if (role === 'admin') return null;
  if (role === 'manager') return null;
  if (role === 'sales_rep') return { type: ['stock', 'order', 'customer', 'user'] };
  if (role === 'online_store_keeper') return { type: ['order', 'stock', 'customer'] };
  return { type: ['order'] };
};

const getVisibleNotificationWhere = (user) => {
  const roleFilter = getRoleBasedFilter(user.role);

  if (user.role === 'admin' || user.role === 'manager') {
    return {};
  }

  const clauses = [
    {
      [Op.or]: [
        { target_user_id: null },
        { target_user_id: user.user_id },
      ],
    },
    {
      [Op.or]: [
        { target_role: null },
        { target_role: user.role },
      ],
    },
  ];

  if (roleFilter && roleFilter.type) {
    clauses.unshift({ type: { [Op.in]: roleFilter.type } });
  }

  return { [Op.and]: clauses };
};

// GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const user = req.user;
    const where = getVisibleNotificationWhere(user);

    // Get notifications filtered by role
    const notifications = await Notification.findAll({
      where,
      include: [{
        model: User,
        as: 'initiator',
        attributes: ['name', 'role'],
      }],
      order: [['created_at', 'DESC']],
      limit: 50,
    });

    // Get per-user read status from notification_reads table
    const notificationIds = notifications.map(n => n.notification_id);
    const userReads = await NotificationRead.findAll({
      where: {
        notification_id: { [Op.in]: notificationIds },
        user_id: user.user_id,
      }
    });

    // Build a map: notification_id → { is_read, read_at }
    const readMap = {};
    userReads.forEach(r => {
      readMap[r.notification_id] = {
        is_read: r.is_read,
        read_at: r.read_at
      };
    });

    // Override is_read with per-user status
    // If user has a record → use that
    // If no record → fall back to global is_read (false by default)
    const notificationsWithReadStatus = notifications.map(n => ({
      ...n.toJSON(),
      is_read: readMap[n.notification_id]?.is_read ?? n.is_read,
      read_at: readMap[n.notification_id]?.read_at ?? n.read_at,
    }));

    // Count unread by type for THIS specific user
    const unreadByType = {};
    notificationsWithReadStatus.forEach(n => {
      if (!n.is_read) {
        unreadByType[n.type] = (unreadByType[n.type] || 0) + 1;
      }
    });

    // Convert to array format for frontend
    const unreadByTypeArray = Object.entries(unreadByType).map(([type, count]) => ({
      type,
      count: String(count)
    }));

    res.json({ 
      notifications: notificationsWithReadStatus, 
      unreadByType: unreadByTypeArray 
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const user = req.user;
    const where = getVisibleNotificationWhere(user);

    // Get all notifications for this role
    const notifications = await Notification.findAll({ 
      where,
      attributes: ['notification_id'] // Only need IDs
    });
    const notificationIds = notifications.map(n => n.notification_id);

    if (notificationIds.length === 0) {
      return res.json({ unread_count: 0 });
    }

    // Get read records for this specific user
    const userReads = await NotificationRead.findAll({
      where: {
        notification_id: { [Op.in]: notificationIds },
        user_id: user.user_id,
        is_read: true,
      },
      attributes: ['notification_id']
    });

    const readIds = new Set(userReads.map(r => r.notification_id));

    // Unread = total notifications - ones this user has read
    const unreadCount = notificationIds.filter(id => !readIds.has(id)).length;

    res.json({ unread_count: unreadCount });
  } catch (err) {
    console.error('Get unread count error:', err);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};

// POST /api/notifications — called from frontend (AddStock, EditStock, etc.)
exports.createNotificationRoute = async (req, res) => {
  try {
    const {
      type,
      title,
      message,
      severity = 'info',
      reference_id = null,
      target_user_id = null,
      target_role = null,
    } = req.body;

    if (!type || !title || !message) {
      return res.status(400).json({ error: 'type, title, and message are required' });
    }

    const notification = await Notification.create({
      type,
      title,
      message,
      severity,
      reference_id,
      target_user_id,
      target_role,
      initiator_id: req.user.user_id,
    });

    res.status(201).json({ success: true, notification });
  } catch (err) {
    console.error('Create notification route error:', err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

// PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Check notification exists
    const notification = await Notification.findOne({
      where: {
        [Op.and]: [
          { notification_id: id },
          getVisibleNotificationWhere(user),
        ],
      }
    });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });

    // Upsert per-user read record
    // Creates if not exists, updates if exists
    await NotificationRead.upsert({
      notification_id: id,
      user_id: user.user_id,
      is_read: true,
      read_at: new Date(),
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Mark as read error:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// PATCH /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    const user = req.user;
    const where = getVisibleNotificationWhere(user);

    // Get all notifications for this role
    const notifications = await Notification.findAll({ where });

    if (notifications.length === 0) {
      return res.json({ success: true, updated: 0 });
    }

    // Upsert per-user read record for each notification
    await Promise.all(
      notifications.map(n =>
        NotificationRead.upsert({
          notification_id: n.notification_id,
          user_id: user.user_id,
          is_read: true,
          read_at: new Date(),
        })
      )
    );

    res.json({ success: true, updated: notifications.length });
  } catch (err) {
    console.error('Mark all as read error:', err);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
};

// DELETE /api/notifications/:id (soft delete)
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });

    await notification.destroy(); // Soft delete via paranoid: true
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    console.error('Delete notification error:', err);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// Helper used internally by other controllers (stockController, etc.)
exports.createNotification = async (type, title, message, referenceOrOptions = null, severity = 'info', extraOptions = {}) => {
  try {
    const options = referenceOrOptions && typeof referenceOrOptions === 'object' && !Array.isArray(referenceOrOptions)
      ? referenceOrOptions
      : { ...extraOptions, reference_id: referenceOrOptions, severity };

    const notification = await Notification.create({
      type,
      title,
      message,
      reference_id: options.reference_id || null,
      severity: options.severity || 'info',
      target_user_id: options.target_user_id || options.recipient_id || null,
      target_role: options.target_role || null,
      initiator_id: options.initiator_id || null,
    });

    return notification;
  } catch (err) {
    console.error('Create notification error:', err);
    return null;
  }
};



// const { Notification, NotificationRead } = require('../models');
// const { Op } = require('sequelize');

// // Role-based notification type filter
// const getRoleBasedFilter = (role) => {
//   if (role === 'admin') return null;
//   if (role === 'manager') return { type: ['stock', 'order'] };
//   if (role === 'sales_rep') return { type: ['order', 'customer'] };
//   if (role === 'online_store_keeper') return { type: ['order', 'stock'] };
//   return { type: ['order'] };
// };

// // GET /api/notifications
// exports.getNotifications = async (req, res) => {
//   try {
//     const user = req.user;
//     const filter = getRoleBasedFilter(user.role);

//     let where = {};
//     if (filter && filter.type) {
//       where.type = { [Op.in]: filter.type };
//     }

//     const notifications = await Notification.findAll({
//       where,
//       order: [['created_at', 'DESC']],
//       limit: 50,
//     });

//     // Count unread by type for filter tab badges
//     const unreadByType = await Notification.findAll({
//       where: { ...where, is_read: false },
//       attributes: [
//         'type',
//         [require('sequelize').fn('COUNT', require('sequelize').col('notification_id')), 'count']
//       ],
//       group: ['type'],
//       raw: true,
//     });

//     res.json({ notifications, unreadByType: unreadByType || [] });
//   } catch (err) {
//     console.error('Get notifications error:', err);
//     res.status(500).json({ error: 'Failed to fetch notifications' });
//   }
// };

// // GET /api/notifications/unread-count
// exports.getUnreadCount = async (req, res) => {
//   try {
//     const user = req.user;
//     const filter = getRoleBasedFilter(user.role);

//     let where = { is_read: false };
//     if (filter && filter.type) {
//       where.type = { [Op.in]: filter.type };
//     }

//     const count = await Notification.count({ where });
//     res.json({ unread_count: count });
//   } catch (err) {
//     console.error('Get unread count error:', err);
//     res.status(500).json({ error: 'Failed to fetch unread count' });
//   }
// };

// // POST /api/notifications — called from frontend (AddStock, EditStock, etc.)
// exports.createNotificationRoute = async (req, res) => {
//   try {
//     const { type, title, message, severity = 'info', reference_id = null } = req.body;

//     if (!type || !title || !message) {
//       return res.status(400).json({ error: 'type, title, and message are required' });
//     }

//     const notification = await Notification.create({
//       type,
//       title,
//       message,
//       severity,
//       reference_id,
//     });

//     res.status(201).json({ success: true, notification });
//   } catch (err) {
//     console.error('Create notification route error:', err);
//     res.status(500).json({ error: 'Failed to create notification' });
//   }
// };

// // PATCH /api/notifications/:id/read
// exports.markAsRead = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const notification = await Notification.findByPk(id);
//     if (!notification) return res.status(404).json({ error: 'Notification not found' });

//     await notification.update({ is_read: true, read_at: new Date() });
//     res.json({ success: true, notification });
//   } catch (err) {
//     console.error('Mark as read error:', err);
//     res.status(500).json({ error: 'Failed to mark notification as read' });
//   }
// };

// // PATCH /api/notifications/read-all
// exports.markAllAsRead = async (req, res) => {
//   try {
//     const user = req.user;
//     const filter = getRoleBasedFilter(user.role);

//     let where = { is_read: false };
//     if (filter && filter.type) {
//       where.type = { [Op.in]: filter.type };
//     }

//     const result = await Notification.update(
//       { is_read: true, read_at: new Date() },
//       { where }
//     );

//     res.json({ success: true, updated: result[0] });
//   } catch (err) {
//     console.error('Mark all as read error:', err);
//     res.status(500).json({ error: 'Failed to mark all as read' });
//   }
// };

// // DELETE /api/notifications/:id (soft delete)
// exports.deleteNotification = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const notification = await Notification.findByPk(id);
//     if (!notification) return res.status(404).json({ error: 'Notification not found' });

//     await notification.destroy();
//     res.json({ success: true, message: 'Notification deleted' });
//   } catch (err) {
//     console.error('Delete notification error:', err);
//     res.status(500).json({ error: 'Failed to delete notification' });
//   }
// };

// // Helper used internally by other controllers
// exports.createNotification = async (type, title, message, reference_id = null, severity = 'info') => {
//   try {
//     await Notification.create({ type, title, message, reference_id, severity });
//   } catch (err) {
//     console.error('Create notification error:', err);
//   }
// };







// const { Notification } = require('../models');

// //Role-based notification filtering
// const getRoleBasedFilter = (role) => {
//   if (role === 'admin') {
//     return null; // Admin sees all
//   }
//   if (role === 'manager') {
//     return { type: ['stock', 'order'] }; // Manager sees stock + orders
//   }
//   if (role === 'sales_rep') {
//     return { type: ['order', 'customer'] }; // Sales rep sees orders +customers
//   }
//   if (role === 'online_store_keeper') {
//     return { type: ['order', 'stock'] }; // Store keeper sees orders + stock
//   }
//   return { type: ['order'] }; // Default: orders only
// };

// exports.getNotifications = async (req, res) => {
//   try {
//     const user = req.user;
//     const filter = getRoleBasedFilter(user.role);

//     let where = {};
//     if (filter && filter.type) {
//       where.type = { [require('sequelize').Op.in]: filter.type };
//     }

//     const notifications = await Notification.findAll({
//       where,
//       order: [['created_at', 'DESC']],
//       limit: 50,
//     });

//     //Count unread by type
//     const unreadByType = await Notification.findAll({
//       where: { ...where, is_read: false },
//       attributes: [
//         'type',
//         [require('sequelize').fn('COUNT', require('sequelize').col('notification_id')), 'count']
//       ],
//       group: ['type'],
//       raw: true,
//     });

//     res.json({
//       notifications,
//       unreadByType: unreadByType || [],
//     });
//   } catch (err) {
//     console.error('Get notifications error:', err);
//     res.status(500).json({ error: 'Failed to fetch notifications' });
//   }
// };

// exports.getUnreadCount = async (req, res) => {
//   try {
//     const user = req.user;
//     const filter = getRoleBasedFilter(user.role);

//     let where = { is_read: false };
//     if (filter && filter.type) {
//       where.type = { [require('sequelize').Op.in]: filter.type };
//     }

//     const count = await Notification.count({ where });

//     res.json({ unread_count: count });
//   } catch (err) {
//     console.error('Get unread count error:', err);
//     res.status(500).json({ error: 'Failed to fetch unread count' });
//   }
// };

// exports.markAsRead = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const notification = await Notification.findByPk(id);
//     if (!notification) {
//       return res.status(404).json({ error: 'Notification not found' });
//     }

//     await notification.update({
//       is_read: true,
//       read_at: new Date(),
//     });

//     res.json({ success: true, notification });
//   } catch (err) {
//     console.error('Mark as read error:', err);
//     res.status(500).json({ error: 'Failed to mark notification as read' });
//   }
// };

// exports.markAllAsRead = async (req, res) => {
//   try {
//     const user = req.user;
//     const filter = getRoleBasedFilter(user.role);

//     let where = { is_read: false };
//     if (filter && filter.type) {
//       where.type = { [require('sequelize').Op.in]: filter.type };
//     }

//     const result = await Notification.update(
//       { is_read: true, read_at: new Date() },
//       { where }
//     );

//     res.json({ success: true, updated: result[0] });
//   } catch (err) {
//     console.error('Mark all as read error:', err);
//     res.status(500).json({ error: 'Failed to mark all as read' });
//   }
// };

// exports.deleteNotification = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const notification = await Notification.findByPk(id);
//     if (!notification) {
//       return res.status(404).json({ error: 'Notification not found' });
//     }

//     await notification.destroy(); // Soft delete

//     res.json({ success: true, message: 'Notification deleted' });
//   } catch (err) {
//     console.error('Delete notification error:', err);
//     res.status(500).json({ error: 'Failed to delete notification' });
//   }
// };

// //Helper function to create notifications (use in other controllers)
// exports.createNotification = async (type, title, message, reference_id = null, severity = 'info') => {
//   try {
//     await Notification.create({
//       type,
//       title,
//       message,
//       reference_id,
//       severity,
//     });
//   } catch (err) {
//     console.error('Create notification error:', err);
//   }
// };
