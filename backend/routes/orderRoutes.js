const express = require('express');
const router = express.Router();
const { 
    placeOrder, 
    placeOnlineOrder, // 👈 අලුත් Controller එක මෙතනට Add කරන්න
    getAllOrders 
} = require('../controllers/orderController');
const { verifyToken } = require('../middlewares/authMiddleware');

// සාමාන්‍ය Orders (Sales Rep/Admin කරන ඒවා)
router.post('/place', verifyToken, placeOrder);

//  Online/Retail Orders (Customer Details සමග)
router.post('/online', verifyToken, placeOnlineOrder);

// සියලුම orders බැලීම
router.get('/all', verifyToken, getAllOrders);



module.exports = router;