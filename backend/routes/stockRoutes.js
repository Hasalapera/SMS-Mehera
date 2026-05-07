const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { isAdminOrManager, verifyToken } = require('../middlewares/authMiddleware');

// Add stock to single variant
router.patch('/variants/:variantId/add-stock', verifyToken, isAdminOrManager, stockController.addStockToVariant);

// Batch ADD stock (for AddStock page)
router.patch('/variants/batch-add-stock', verifyToken, isAdminOrManager, stockController.batchAddStockToVariants);

// Batch EDIT stock (for EditStock page)
router.patch('/variants/batch-edit-stock', verifyToken, isAdminOrManager, stockController.batchEditStockForVariants);

// Batch REVERT stock (Undo last changes)
router.patch('/variants/batch-revert-stock', verifyToken, isAdminOrManager, stockController.batchRevertStockForVariants);

module.exports = router;