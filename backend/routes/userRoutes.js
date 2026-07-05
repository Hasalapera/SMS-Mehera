const userController = require('../controllers/userController'); 
const express = require('express');
const router = express.Router();
const { addUserByAdmin,resetToDefaultPassword, updatePassword, getAllUsers, softDeleteUser, addUserArea, removeUserArea, addUserBehavior } = require('../controllers/userController');
const { isAdmin, isAdminOrManager, verifyToken } = require('../middlewares/authMiddleware');
const { loginUser, refreshAccessToken, logoutUser } = require('../controllers/authController');

// Middlewares
const multer = require('multer');
// Configure multer for file uploads
const { storage } = require('../config/cloudinary'); 
// Create a multer instance with the specified storage configuration
const upload = multer({ storage: storage }); 

// Routes
// Authentication routes
router.post('/login', loginUser); // Login route
// User management routes
// Password management routes
router.put('/update-password', updatePassword); // Update password route
// Reset password to default (Admin only)
router.put('/reset-password',verifyToken, isAdmin, resetToDefaultPassword);  // Reset password to default route
// User profile routes
router.post('/logout', logoutUser); // Logout route

router.post('/refresh-token', refreshAccessToken); // Refresh access token route
router.put('/change-password', userController.changePassword); // Change password route

router.put('/update-profile', verifyToken, upload.single('image'), userController.updateProfile); // Update user profile route with image upload
router.get('/profile/:id', userController.getUserProfile); // Get user profile by ID route
router.put('/add-area/:id', verifyToken, isAdmin, addUserArea); // Add area to user route 
router.put('/remove-area/:id', verifyToken, isAdmin, removeUserArea); // Remove area from user route


router.post('/addUser', verifyToken, isAdmin, addUserByAdmin); // Add user by admin route

router.post('/behavior/:id', verifyToken, isAdminOrManager, addUserBehavior); // Add user behavior route

// router.put('/activate-user/:id', authMiddleware, userController.activateUser);
router.get('/all-users', isAdminOrManager, userController.getAllUsers); // Get all users route
router.put('/delete-user/:id', isAdmin, softDeleteUser); // Soft delete user route
router.put('/restore-user/:id', isAdmin, userController.restoreUser); // Restore user route
router.get('/sales-reps', verifyToken, isAdmin, userController.getSalesReps); // Get all sales reps route
router.get('/top-performers', verifyToken, userController.getTopPerformers); // Get top performers route

module.exports = router;
