const express = require('express');
const router = express.Router();
const { 
    placeOrder, 
    placeOnlineOrder, 
    getAllOrders ,
    updateOrderStatus,
    updateTrackingInfo,
    confirmDeliveryWithOTP,
    initiateDeliveryOTP,
    verifyDeliveryOTPByRep,
    deleteOrder
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