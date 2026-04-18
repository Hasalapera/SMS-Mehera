const express = require('express');
const router = express.Router();
const { placeOrder ,getAllOrders } = require('../controllers/orderController');
const { verifyToken } = require('../middlewares/authMiddleware'); // ඔයාගේ auth එකට අනුව

router.post('/place', verifyToken, placeOrder);
router.get('/all', verifyToken, getAllOrders); // සියලුම orders ලබාගැනීමේ route එක    



module.exports = router;