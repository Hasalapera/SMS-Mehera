const userController = require('../controllers/userController'); 
const express = require('express');
const router = express.Router();
const { addUserByAdmin,resetToDefaultPassword, updatePassword, getAllUsers, softDeleteUser } = require('../controllers/userController');
const { isAdmin } = require('../middlewares/authMiddleware');
const { loginUser } = require('../controllers/authController');

const multer = require('multer');
const { storage } = require('../config/cloudinary'); 
const upload = multer({ storage: storage }); 

router.post('/login', loginUser);
router.put('/update-password', updatePassword);
router.put('/reset-password', resetToDefaultPassword); 

router.put('/change-password', userController.changePassword); 

router.put('/update-profile', upload.single('image'), userController.updateProfile);

router.post('/add-user', isAdmin, addUserByAdmin);
router.get('/all-users', isAdmin, getAllUsers);
router.put('/delete-user/:id', isAdmin, softDeleteUser);





module.exports = router;