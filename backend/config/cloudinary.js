const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

//profile pictures සඳහා storage එක
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mehera-international/user_profiles', // Sub-folder එක
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 400, height: 400, crop: 'limit' }] // පින්තූරය Optimize කිරීම
  },
});

// Brands සඳහා වෙනම storage එකක්
const brandStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mehera-international/brands',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  },
});

// Products සහ Variants සඳහා වෙනම storage එකක්
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mehera-international/products',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  },
});

module.exports = {cloudinary, storage, brandStorage, productStorage};