const express = require('express');
const router = express.Router();
const multer = require('multer'); // 👈 1. මුලින්ම multer import කරන්න
const { getSettings, updateSettings } = require('../controllers/settingController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const { logoStorage } = require('../config/cloudinary');
const upload = multer({ storage: logoStorage });

// (Public access for login page)
router.get('/public', getSettings);

router.get('/', verifyToken, getSettings);

// branding logo upload for claudinary
router.post('/upload-logo', verifyToken, isAdmin, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        // cloudinary url eka frontend ekata ywnna
        res.status(200).json({ success: true, url: req.file.path });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// update Database settings 
router.put('/', verifyToken, isAdmin, updateSettings);

module.exports = router;