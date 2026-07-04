// backend/controllers/workshopController.js
const { Workshop } = require('../models');
const { cloudinary } = require('../config/cloudinary'); // 👈 අලුතින් හදන්නේ නැතුව Config එකෙන් කෙලින්ම ගන්නවා

// ➕ CREATE WORKSHOP - Super Safe Version
exports.createWorkshop = async (req, res) => {
  try {
    let image_url = null;

    // Cloudinary will upload a new Base64 image if it arrives from the frontend.
    if (req.body.image && req.body.image.startsWith('data:image')) {
      try {
        const uploadRes = await cloudinary.uploader.upload(req.body.image, {
          folder: 'mehera-international/workshops',
        });
        image_url = uploadRes.secure_url;
      } catch (cloudinaryErr) {
        console.error("⚠️ Cloudinary Upload Failed (Create):", cloudinaryErr.message);
        // 💡 If Cloudinary fails, the Base64 will not be put into the DB because it exceeds the varchar(255) limit.
        // Instead, a default placeholder image is set to prevent the app from crashing.
        image_url = 'https://ui-avatars.com/api/?name=Workshop&background=b4a460&color=fff';
      }
    }

    // 🎯 Only include the valid columns from the request body
    const workshopData = {
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      capacity: req.body.capacity,
      speakers: req.body.speakers,
      duration: req.body.duration, 
      type: req.body.type,
      image_url: image_url
    };

    const workshop = await Workshop.create(workshopData);
    res.status(201).json({ success: true, message: 'Workshop created successfully', workshop });
  } catch (err) {
    console.error("❌ DB Create Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🔄 UPDATE (EDIT) WORKSHOP - Super Safe Version
exports.updateWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const workshop = await Workshop.findByPk(id);

    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }

    let image_url = workshop.image_url; // 1. By default, the old image URL is kept the same.

    // Cloudinary only sends a new image if the admin has selected it.
    if (req.body.image && req.body.image.startsWith('data:image')) {
      try {
        const uploadRes = await cloudinary.uploader.upload(req.body.image, {
          folder: 'mehera-international/workshops',
        });
        image_url = uploadRes.secure_url; // Upload successful, only the new URL is kept
      } catch (cloudinaryErr) {
        console.error("⚠️ Cloudinary Upload Failed (Update):", cloudinaryErr.message);
        // 💡 If Cloudinary fails, the Base64 will not be put into the DB because it exceeds the varchar(255) limit.
        // The old image_url is kept unchanged (No DB crash).
      }
    }

    // 🎯 Only include the valid columns from the request body
    const updatedData = {
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      capacity: req.body.capacity,
      speakers: req.body.speakers,
      duration: req.body.duration,
      type: req.body.type,
      image_url: image_url // 👈A large Base64 string will never fall here now.
    };

    await workshop.update(updatedData);
    res.status(200).json({ success: true, message: 'Workshop updated successfully', workshop });
  } catch (err) {
    console.error("❌ DB Update Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📋 GET ALL WORKSHOPS
exports.getWorkshops = async (req, res) => {
  try {
    const workshops = await Workshop.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json(workshops);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ❌ DELETE WORKSHOP
exports.deleteWorkshop = async (req, res) => {
  try {
    await Workshop.destroy({ where: { workshop_id: req.params.id } });
    res.status(200).json({ success: true, message: 'Workshop deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};