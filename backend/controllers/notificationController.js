const { Notification, NotificationRead, User } = require('../models');
const { Op } = require('sequelize');

// Role-based notification type filter
const getRoleBasedFilter = (role) => {
  if (role === 'admin') return null;
  if (role === 'manager') return null;
  if (role === 'sales_rep') return { type: ['stock', 'order', 'customer', 'user', 'target', 'product'] };
  if (role === 'online_store_keeper') return { type: ['order', 'stock', 'customer', 'product'] };
  return { type: ['order'] };
};

// Helper function to get the visibility filter for notifications based on user role and registration date
const getVisibleNotificationWhere = async (user) => {
  const currentUser = await User.findByPk(user.user_id, {
    attributes: ['createdAt'],
  });
  if (!currentUser) {
    throw new Error('Authenticated user not found');
  }
  const registrationFilter = {
    createdAt: { [Op.gte]: currentUser.createdAt },
  };
  const roleFilter = getRoleBasedFilter(user.role);

  // Admins and managers can see all notifications, so we only apply the registration filter
  if (user.role === 'admin' || user.role === 'manager') {
    return {
      [Op.and]: [
        registrationFilter,
        {
          [Op.or]: [
            { target_user_id: null },
            { target_user_id: user.user_id },
          ],
        },
      ],
    };
  }

  // For other roles, we apply the registration filter, target_user_id filter, and target_role filter
  const clauses = [
    registrationFilter,
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
    const visibilityWhere = await getVisibleNotificationWhere(user);
    const validTypes = ['stock', 'product', 'customer', 'user', 'target', 'order'];
    const requestedType = req.query.type;
    if (requestedType && !validTypes.includes(requestedType)) {
      return res.status(400).json({ error: 'Invalid notification type' });
    }
    const where = requestedType
      ? { [Op.and]: [visibilityWhere, { type: requestedType }] }
      : visibilityWhere;
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const requestedOffset = Number.parseInt(req.query.offset, 10);
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 50)
      : 50;
    const offset = Number.isInteger(requestedOffset) && requestedOffset >= 0
      ? requestedOffset
      : 0;

    // Get notifications filtered by role
    const { count: total, rows: notifications } = await Notification.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'initiator',
        attributes: ['name', 'role'],
      }],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    // Get per-user read status from notification_reads table
    const notificationIds = notifications.map(n => n.notification_id);
    const userReads = await NotificationRead.findAll({
      where: {
        notification_id: { [Op.in]: notificationIds },
        user_id: user.user_id,
      }
    });

    // Build a map: notification_id -> { is_read, read_at }
    const readMap = {};
    userReads.forEach(r => {
      readMap[r.notification_id] = {
        is_read: r.is_read,
        read_at: r.read_at
      };
    });

    // Override is_read with per-user status
    // If user has a record -> use that
    // If no record -> fall back to global is_read (false by default)
    const notificationsWithReadStatus = notifications.map(n => ({
      ...n.toJSON(),
      is_read: readMap[n.notification_id]?.is_read ?? false,
      read_at: readMap[n.notification_id]?.read_at ?? null,
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

    // Return the notifications with read status and unread counts
    res.json({ 
      notifications: notificationsWithReadStatus, 
      unreadByType: unreadByTypeArray,
      hasMore: offset + notifications.length < total,
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
    const where = await getVisibleNotificationWhere(user);

    // Get all notifications for this role
    const notifications = await Notification.findAll({ 
      where,
      attributes: ['notification_id', 'type']
    });
    const notificationIds = notifications.map(n => n.notification_id);

    if (notificationIds.length === 0) {
      return res.json({ unread_count: 0, unread_by_type: {} });
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
    const unreadNotifications = notifications.filter(n => !readIds.has(n.notification_id));
    const unreadCount = unreadNotifications.length;
    const unreadByType = unreadNotifications.reduce((counts, notification) => {
      counts[notification.type] = (counts[notification.type] || 0) + 1;
      return counts;
    }, {});

    res.json({ unread_count: unreadCount, unread_by_type: unreadByType });
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
    // Create the notification with initiator_id set to the authenticated user
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
          await getVisibleNotificationWhere(user),
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
    const where = await getVisibleNotificationWhere(user);

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
