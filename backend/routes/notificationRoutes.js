const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { 
  getNotifications,
  createNotificationRoute, //New
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  getUnreadCount 
} = require('../controllers/notificationController');

// Get all notifications (role-based filtering in controller)
router.get('/', verifyToken, getNotifications);

// Get unread count for sidebar bell badge
router.get('/unread-count', verifyToken, getUnreadCount);

// Create notification from frontend (AddStock, EditStock, etc.)
router.post('/', verifyToken, createNotificationRoute);

// Mark single notification as read
router.patch('/:id/read', verifyToken, markAsRead);

// Mark all as read
router.patch('/read-all', verifyToken, markAllAsRead);

// Delete notification (soft delete)
router.delete('/:id', verifyToken, deleteNotification);

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const { verifyToken, isAdminOrManager } = require('../middlewares/authMiddleware');
// const { 
//   getNotifications, 
//   markAsRead, 
//   markAllAsRead, 
//   deleteNotification,
//   getUnreadCount 
// } = require('../controllers/notificationController');

// //Get all notifications (role-based filtering happens in controller)
// router.get('/', verifyToken, getNotifications);

// //Get unread count badge
// router.get('/unread-count', verifyToken, getUnreadCount);

// //Mark single notification as read
// router.patch('/:id/read', verifyToken, markAsRead);

// //Mark all as read
// router.patch('/read-all', verifyToken, markAllAsRead);

// //Delete notification (soft delete)
// router.delete('/:id', verifyToken, deleteNotification);

// module.exports = router;