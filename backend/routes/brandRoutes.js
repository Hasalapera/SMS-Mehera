const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const { isAdmin, verifyToken } = require('../middlewares/authMiddleware');

const multer = require('multer');
const { brandStorage } = require('../config/cloudinary');
const uploadBrand = multer({ storage: brandStorage });

router.post('/addBrand', verifyToken, isAdmin, uploadBrand.single('brand_image'), brandController.addBrand);
router.get('/getBrands', brandController.getBrands);

module.exports = router;
