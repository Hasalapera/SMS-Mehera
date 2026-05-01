const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAdmin, isAdminOrManager, verifyToken } = require('../middlewares/authMiddleware');

const multer = require('multer');
const { productDynamicStorage } = require('../config/cloudinary'); 
const upload = multer({ storage: productDynamicStorage });
const productUploads = upload.fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'variant_images', maxCount: 10 }
]);

router.post('/addProduct', verifyToken, isAdmin, productUploads, productController.addProduct);
router.get('/getProducts', productController.getProducts);
router.patch('/variants/batch-add-stock', isAdminOrManager, productController.batchAddStockToVariants);
router.patch('/variants/batch-revert-stock', isAdminOrManager, productController.batchRevertStockForVariants);
router.patch('/variants/:variantId/add-stock', isAdminOrManager, productController.addStockToVariant);
router.get('/:id', productController.getProductById);



module.exports = router;