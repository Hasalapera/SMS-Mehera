// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { 
    placeOrder, 
    placeOnlineOrder, 
    getAllOrders,
    updateOrderStatus,
    updateTrackingInfo,
    confirmDeliveryWithOTP,
    initiateDeliveryOTP,
    verifyDeliveryOTPByRep,
    deleteOrder,
    updateOrder
    getOrderById // 🎯 1. කන්ට්‍රෝලර් එකෙන් අලුත් ෆන්ක්ෂන් එක Import කරගත්තා
} = require('../controllers/orderController');
const { verifyToken, isAdmin, isAuthorized } = require('../middlewares/authMiddleware');

// normal Orders (Sales Rep/Admin)
router.post('/place', verifyToken, placeOrder);

//  Online/Retail Orders (Customer Details)
router.post('/online', verifyToken, placeOnlineOrder);

// Get all orders (Admin/Sales Rep) - verifyToken middleware
router.get('/all', verifyToken, getAllOrders);

// Delete order
router.delete('/delete/:orderId', verifyToken, deleteOrder);

// Update order
router.put('/update/:orderId', verifyToken, updateOrder);
// 🎯 2. [THE EXACT ROUTE FIX]: ෆ්‍රොන්ටෙන්ඩ් එකෙන් එවපු tracking ID එක පබ්ලික්ලි සර්ච් කරන්න මෙන්න මේ රවුට් එක ඇතුළත් කළා මචං!
// ලොග් නොවී එන කස්ටමර්ටත් සර්ච් කරන්න ඕන නිසා මේකට verifyToken මිඩ්ල්වෙයාර් එක දැම්මේ නැහැ.
router.get('/:orderId', getOrderById);

// Update order status (Admin only)
router.put('/update-order-status/:orderId', 
    verifyToken, 
    isAuthorized(['admin', 'logistics_officer']), 
    updateOrderStatus
);

router.put('/update-tracking/:orderId', verifyToken, updateTrackingInfo);

router.post('/confirm-delivery/:orderId', confirmDeliveryWithOTP);

router.post('/initiate-delivery/:orderId', verifyToken, isAuthorized(['sales_rep', 'admin']), initiateDeliveryOTP);
router.post('/rep-confirm-delivery/:orderId', verifyToken, isAuthorized(['sales_rep', 'admin']), verifyDeliveryOTPByRep);

module.exports = router;