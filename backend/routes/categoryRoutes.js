const express = require('express');
const router = express.Router();
const { addCategory, getCategories, deleteCategory } = require('../controllers/categoryController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// POST: /api/category/addCategory
router.post('/addCategory', verifyToken, isAdmin, addCategory);

router.get('/getCategories', verifyToken, getCategories);

router.delete('/delete/:id', verifyToken, isAdmin, deleteCategory);

module.exports = router;