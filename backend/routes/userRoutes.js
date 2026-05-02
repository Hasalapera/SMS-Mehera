// const userController = require('../controllers/userController'); 
// const express = require('express');
// const router = express.Router();
// const { addUserByAdmin,resetToDefaultPassword, updatePassword, getAllUsers, softDeleteUser } = require('../controllers/userController');
// const { isAdmin, isAdminOrManager, verifyToken } = require('../middlewares/authMiddleware');
// const { loginUser } = require('../controllers/authController');

// const multer = require('multer');
// const { storage } = require('../config/cloudinary'); 
// const upload = multer({ storage: storage }); 

// router.post('/login', loginUser);
// router.put('/update-password', updatePassword);
// router.put('/reset-password', resetToDefaultPassword); 

// router.put('/change-password', userController.changePassword); 

// router.put('/update-profile', verifyToken, upload.single('image'), userController.updateProfile);
// router.get('/profile/:id', userController.getUserProfile);


// router.post('/addUser', addUserByAdmin);

// // router.put('/activate-user/:id', authMiddleware, userController.activateUser);
// router.get('/all-users', isAdminOrManager, userController.getAllUsers);
// router.put('/delete-user/:id', isAdmin, softDeleteUser);
// router.put('/restore-user/:id', isAdmin, userController.restoreUser);





// module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); 
const { isAdmin, isAdminOrManager, verifyToken } = require('../middlewares/authMiddleware');
const { loginUser, logoutUser, refreshAccessToken } = require('../controllers/authController');
const multer = require('multer');
const { storage } = require('../config/cloudinary'); 

const upload = multer({ storage: storage }); 

// PUBLIC ROUTES (no auth needed)
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh-token', refreshAccessToken);

// PROTECTED ROUTES (auth needed)
router.put('/update-password', verifyToken, userController.updatePassword);
router.put('/reset-password', verifyToken, userController.resetToDefaultPassword);
router.put('/change-password', verifyToken, userController.changePassword);
router.put('/update-profile', verifyToken, upload.single('image'), userController.updateProfile);
router.get('/profile/:id', verifyToken, userController.getUserProfile);
router.get('/verify-session', verifyToken, userController.verifySession);

// ADMIN PROTECTED ROUTES
router.post('/addUser', verifyToken, isAdmin, userController.addUserByAdmin);
router.get('/all-users', verifyToken, isAdminOrManager, userController.getAllUsers);
router.put('/delete-user/:id', verifyToken, isAdmin, userController.softDeleteUser);
router.put('/restore-user/:id', verifyToken, isAdmin, userController.restoreUser);

module.exports = router;