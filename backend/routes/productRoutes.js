const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAdmin, verifyToken } = require('../middlewares/authMiddleware');

const multer = require('multer');
const { productDynamicStorage } = require('../config/cloudinary'); 
const upload = multer({ storage: productDynamicStorage });
const productUploads = upload.fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'variant_images', maxCount: 10 }
]);

router.post('/addProduct', verifyToken, isAdmin, productUploads, productController.addProduct);
router.get('/getProducts', productController.getProducts);



module.exports = router;