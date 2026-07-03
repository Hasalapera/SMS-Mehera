const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAdmin, isAdminOrManager, verifyToken, verifyTokenOptional } = require('../middlewares/authMiddleware');

const multer = require('multer');
const { productDynamicStorage } = require('../config/cloudinary'); 
const upload = multer({ storage: productDynamicStorage });
const productUploads = upload.fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'variant_images', maxCount: 10 }
]);

router.post('/addProduct', verifyToken, isAdmin, productUploads, productController.addProduct);
router.put('/:id', verifyToken, isAdmin, productUploads, productController.updateProduct);
router.delete('/:id', verifyToken, isAdmin, productController.deleteProduct);
router.delete('/:id/variants/:variantId', verifyToken, isAdmin, productController.deleteProductVariant);
router.get('/getProducts', verifyTokenOptional, productController.getProducts);
router.get('/:id', verifyTokenOptional, productController.getProductById);

module.exports = router;