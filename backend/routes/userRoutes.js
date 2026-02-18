const express = require('express');
const router = express.Router();
const { addUserByAdmin,resetToDefaultPassword, updatePassword, getAllUsers, softDeleteUser } = require('../controllers/userController');
const { isAdmin } = require('../middlewares/authMiddleware');
const { loginUser } = require('../controllers/authController');

router.post('/login', loginUser);
router.put('/update-password', updatePassword);
router.put('/reset-password', resetToDefaultPassword); 

router.post('/add-user', isAdmin, addUserByAdmin);
router.get('/all-users', isAdmin, getAllUsers);
router.put('/delete-user/:id', isAdmin, softDeleteUser);




module.exports = router;