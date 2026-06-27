const express = require('express');
const router = express.Router();
const targetController = require('../controllers/salesTargetController');

// 🎯 FIX: උඹේ authMiddleware.js එකේ තියෙන ඇත්තම ෆන්ක්ෂන් නම් (verifyToken, isAdminOrManager) මෙතනට ඉම්පෝර්ට් කළා
const { verifyToken, isAdminOrManager } = require('../middlewares/authMiddleware'); 

// 🔒 1. ටාගට් ඇසයින් කරන්නේ Admin හෝ Manager විතරයි
router.post('/assign', verifyToken, isAdminOrManager, targetController.assignTarget);

// 🔑 2. රෙප්ලාගේ summary එක බලන්න ලොග් වෙලා ඉන්න ඕනෑම යූසර් කෙනෙක්ට (verifyToken) ඉඩ දෙනවා
router.get('/rep-summary', verifyToken, targetController.getMonthlyRepTarget);


router.get('/rep-details/:id', verifyToken, targetController.getRepLiveDetails);

module.exports = router;