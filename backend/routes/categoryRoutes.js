const express = require('express');
const router = express.Router();
const { addCategory, getCategories } = require('../controllers/categoryController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// POST: /api/category/addCategory
router.post('/addCategory', verifyToken, isAdmin, addCategory);

router.get('/getCategories', verifyToken, getCategories);

module.exports = router;