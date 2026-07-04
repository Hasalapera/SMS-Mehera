const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAdmin, isAdminOrManager, verifyToken, verifyTokenOptional } = require('../middlewares/authMiddleware');

// Multer setup for handling file uploads
const multer = require('multer');
const { productDynamicStorage } = require('../config/cloudinary'); 
const upload = multer({ storage: productDynamicStorage });

// Define the fields for product uploads
const productUploads = upload.fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'variant_images', maxCount: 10 }
]);

// Product routes
router.post('/addProduct', verifyToken, isAdmin, productUploads, productController.addProduct); 
// Get all products with optional filters
router.put('/:id', verifyToken, isAdmin, productUploads, productController.updateProduct);
// Soft-delete a product
router.delete('/:id', verifyToken, isAdmin, productController.deleteProduct);
// Get all products with optional filters
router.get('/getProducts', verifyTokenOptional, productController.getProducts);
// Get a single product by ID
router.get('/:id', verifyTokenOptional, productController.getProductById);
// Get all products with optional filters
module.exports = router;