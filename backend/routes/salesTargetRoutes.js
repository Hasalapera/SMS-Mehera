const express = require('express');
const router = express.Router();
const targetController = require('../controllers/salesTargetController');

// Middlewares
const { verifyToken, isAdminOrManager } = require('../middlewares/authMiddleware'); 

// Routes
router.post('/assign', verifyToken, isAdminOrManager, targetController.assignTarget);

// Get monthly summary of sales targets for all reps (Admin/Manager only)
router.get('/rep-summary', verifyToken, targetController.getMonthlyRepTarget);

// Get live details of a specific rep's sales target (Admin/Manager only)
router.get('/rep-details/:id', verifyToken, targetController.getRepLiveDetails);

// Get existing target for a specific rep (Admin/Manager only)
router.get('/existing-target', verifyToken, targetController.getExistingTarget);


module.exports = router;