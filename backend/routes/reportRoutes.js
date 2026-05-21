const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { isAdmin, isAdminOrManager, verifyToken } = require('../middlewares/authMiddleware');

router.get('/sales-report', verifyToken, isAdminOrManager, reportController.getSalesReport);

module.exports = router;