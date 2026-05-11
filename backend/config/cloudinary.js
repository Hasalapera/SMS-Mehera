const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const logoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mehera-international/system_branding',
    allowed_formats: ['png', 'svg', 'webp'],
    transformation: [
      { width: 1000, height: 1000, crop: 'limit' },
      { quality: 'auto:best' },
      { fetch_format: 'png' } // Transparency රැක ගැනීමට PNG අනිවාර්යයි
    ]
  },
});


// Dynamic Storage  - product
const productDynamicStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folderPath = 'mehera-international/products'; // Default path 

    // change folder based on the fieldname
    if (file.fieldname === 'main_image') {
      folderPath = 'mehera-international/products/main_images';
    } else if (file.fieldname === 'variant_images') {
      folderPath = 'mehera-international/products/variant_images';
    }

    return {
      folder: folderPath,
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      transformation: [{ width: 800, height: 800, crop: 'limit' }]
    };
  },
});

//storage for profile pictures
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mehera-international/user_profiles', // Sub-folder 
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'limit' }] // Image Optimize 
  },
});

// Brands සඳහා වෙනම storage එකක්
const brandStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mehera-international/brands',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  },
});

// // Products සහ Variants සඳහා වෙනම storage එකක්

// const mainImageStorage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'mehera-international/products/main_images',
//     allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
//     transformation: [{ width: 800, height: 800, crop: 'limit' }]
//   },
// });

// const variantImageStorage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'mehera-international/products/variant_images',
//     allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
//     transformation: [{ width: 800, height: 800, crop: 'limit' }]
//   },
// });


module.exports = {cloudinary, storage, brandStorage, productDynamicStorage, logoStorage};