const userController = require('../controllers/userController'); 
const express = require('express');
const router = express.Router();
const { addUserByAdmin,resetToDefaultPassword, updatePassword, getAllUsers, softDeleteUser } = require('../controllers/userController');
const { isAdmin, isAdminOrManager, verifyToken } = require('../middlewares/authMiddleware');
const { loginUser } = require('../controllers/authController');

const multer = require('multer');
const { storage } = require('../config/cloudinary'); 
const upload = multer({ storage: storage }); 

router.post('/login', loginUser);
router.put('/update-password', updatePassword);
router.put('/reset-password', resetToDefaultPassword); 

router.put('/change-password', userController.changePassword); 

router.put('/update-profile', verifyToken, upload.single('image'), userController.updateProfile);
router.get('/profile/:id', userController.getUserProfile);


router.post('/addUser', isAdmin, addUserByAdmin);

// router.put('/activate-user/:id', authMiddleware, userController.activateUser);
router.get('/all-users', isAdminOrManager, userController.getAllUsers);
router.put('/delete-user/:id', isAdmin, softDeleteUser);
router.put('/restore-user/:id', isAdmin, userController.restoreUser);





module.exports = router;