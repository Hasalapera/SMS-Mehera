const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAdmin, verifyToken } = require('../middlewares/authMiddleware');

const multer = require('multer');
const { productStorage } = require('../config/cloudinary'); 
const upload = multer({ storage: productStorage });
const productUploads = upload.fields([
    { name: 'main_image', maxCount: 5 },
    { name: 'variant_images', maxCount: 10 }
]);

router.post('/addProduct', verifyToken, isAdmin, productUploads, productController.addProduct);
router.get('/getProducts', productController.getProducts);



module.exports = router;