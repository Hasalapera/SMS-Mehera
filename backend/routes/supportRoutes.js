const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const {sendSupportEmail} = require('../controllers/supportController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/send-email', verifyToken, upload.single('supportFile'), sendSupportEmail);

module.exports = router;