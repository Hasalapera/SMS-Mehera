const express = require('express');
const router = express.Router();
const { 
    placeOrder, 
    placeOnlineOrder, 
    getAllOrders 
} = require('../controllers/orderController');
const { verifyToken } = require('../middlewares/authMiddleware');

// normal Orders (Sales Rep/Admin)
router.post('/place', verifyToken, placeOrder);

//  Online/Retail Orders (Customer Details)
router.post('/online', verifyToken, placeOnlineOrder);

// Get all orders (Admin/Sales Rep) - verifyToken middleware
router.get('/all', verifyToken, getAllOrders);



module.exports = router;