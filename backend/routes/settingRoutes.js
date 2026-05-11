const express = require('express');
const router = express.Router();
const multer = require('multer'); // 👈 1. මුලින්ම multer import කරන්න
const { getSettings, updateSettings } = require('../controllers/settingController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const { logoStorage } = require('../config/cloudinary');
// 👈 3. upload කියන variable එක මෙතනදී define කරනවා
const upload = multer({ storage: logoStorage });

// Settings ලබාගැනීම (හැමෝටම පුළුවන්)
router.get('/', verifyToken, getSettings);

// Branding Logo එක Cloudinary වලට upload කිරීම
// මෙතන තමයි අර 'upload' පාවිච්චි වෙන්නේ
router.post('/upload-logo', verifyToken, isAdmin, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        // Cloudinary එකෙන් ලැබෙන URL එක frontend එකට යවනවා
        res.status(200).json({ success: true, url: req.file.path });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Database එකේ settings update කිරීම
router.put('/', verifyToken, isAdmin, updateSettings);

module.exports = router;