const express = require('express');
const router = express.Router();
const { addUserByAdmin,resetToDefaultPassword, updatePassword } = require('../controllers/userController');
const { isAdmin } = require('../middlewares/authMiddleware');
const { loginUser } = require('../controllers/authController');

// Admin ට පමණක් ඉඩ දෙන Protected Route එක
router.post('/add-user', isAdmin, addUserByAdmin);

router.post('/login', loginUser);

router.put('/update-password', updatePassword);

router.put('/reset-password', resetToDefaultPassword); 

module.exports = router;