const { Notification } = require('../models');
const { Op } = require('sequelize');

// Role-based notification type filter
const getRoleBasedFilter = (role) => {
  if (role === 'admin') return null;
  if (role === 'manager') return { type: ['stock', 'order'] };
  if (role === 'sales_rep') return { type: ['order', 'customer'] };
  if (role === 'online_store_keeper') return { type: ['order', 'stock'] };
  return { type: ['order'] };
};

// GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const user = req.user;
    const filter = getRoleBasedFilter(user.role);

    let where = {};
    if (filter && filter.type) {
      where.type = { [Op.in]: filter.type };
    }

    const notifications = await Notification.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: 50,
    });

    // Count unread by type for filter tab badges
    const unreadByType = await Notification.findAll({
      where: { ...where, is_read: false },
      attributes: [
        'type',
        [require('sequelize').fn('COUNT', require('sequelize').col('notification_id')), 'count']
      ],
      group: ['type'],
      raw: true,
    });

    res.json({ notifications, unreadByType: unreadByType || [] });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const user = req.user;
    const filter = getRoleBasedFilter(user.role);

    let where = { is_read: false };
    if (filter && filter.type) {
      where.type = { [Op.in]: filter.type };
    }

    const count = await Notification.count({ where });
    res.json({ unread_count: count });
  } catch (err) {
    console.error('Get unread count error:', err);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};

// POST /api/notifications — called from frontend (AddStock, EditStock, etc.)
exports.createNotificationRoute = async (req, res) => {
  try {
    const { type, title, message, severity = 'info', reference_id = null } = req.body;

    if (!type || !title || !message) {
      return res.status(400).json({ error: 'type, title, and message are required' });
    }

    const notification = await Notification.create({
      type,
      title,
      message,
      severity,
      reference_id,
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
    const notification = await Notification.findByPk(id);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });

    await notification.update({ is_read: true, read_at: new Date() });
    res.json({ success: true, notification });
  } catch (err) {
    console.error('Mark as read error:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// PATCH /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    const user = req.user;
    const filter = getRoleBasedFilter(user.role);

    let where = { is_read: false };
    if (filter && filter.type) {
      where.type = { [Op.in]: filter.type };
    }

    const result = await Notification.update(
      { is_read: true, read_at: new Date() },
      { where }
    );

    res.json({ success: true, updated: result[0] });
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

    await notification.destroy();
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    console.error('Delete notification error:', err);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// Helper used internally by other controllers
exports.createNotification = async (type, title, message, reference_id = null, severity = 'info') => {
  try {
    await Notification.create({ type, title, message, reference_id, severity });
  } catch (err) {
    console.error('Create notification error:', err);
  }
};


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