const express = require('express');
const router = express.Router();
const { verifyToken, isAdminOrManager } = require('../middlewares/authMiddleware');
const { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  getUnreadCount 
} = require('../controllers/notificationController');

//Get all notifications (role-based filtering happens in controller)
router.get('/', verifyToken, getNotifications);

//Get unread count badge
router.get('/unread-count', verifyToken, getUnreadCount);

//Mark single notification as read
router.patch('/:id/read', verifyToken, markAsRead);

//Mark all as read
router.patch('/read-all', verifyToken, markAllAsRead);

//Delete notification (soft delete)
router.delete('/:id', verifyToken, deleteNotification);

module.exports = router;