const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const {sendSupportEmail, getAdminContacts} = require('../controllers/supportController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/send-email', verifyToken, upload.single('supportFile'), sendSupportEmail);

router.get('/getAdminContacts', verifyToken, getAdminContacts);

module.exports = router;