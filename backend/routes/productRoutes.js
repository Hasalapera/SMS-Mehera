const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAdmin, isAdminOrManager, verifyToken } = require('../middlewares/authMiddleware');

const multer = require('multer');
const { storage } = require('../config/cloudinary'); 
const upload = multer({ storage: storage });

router.post('/addProduct', verifyToken, isAdmin, upload.any(), productController.addProduct);

module.exports = router;