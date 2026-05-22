// backend/controllers/workshopController.js
const { Workshop } = require('../models');
const cloudinary = require('cloudinary').v2;

// Cloudinary Credentials (.env එකෙන් ලෝඩ් වෙනවා)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ➕ CREATE WORKSHOP - Super Safe Version
exports.createWorkshop = async (req, res) => {
  try {
    let image_url = null;

    // ෆ්‍රොන්ටෙන්ඩ් එකෙන් අලුත් Base64 ඉමේජ් එකක් ආවොත් Cloudinary අප්ලෝඩ් කරනවා
    if (req.body.image && req.body.image.startsWith('data:image')) {
      try {
        const uploadRes = await cloudinary.uploader.upload(req.body.image, {
          folder: 'mehera_workshops',
        });
        image_url = uploadRes.secure_url;
      } catch (cloudinaryErr) {
        console.error("⚠️ Cloudinary Upload Failed (Create):", cloudinaryErr.message);
        // 💡 Cloudinary fail වුණොත්, varchar(255) සීමාව පනින නිසා Base64 එක DB එකට දාන්නේ නැහැ.
        // ඒ වෙනුවට default placeholder image එකක් සෙට් කරනවා ඇප් එක ක්‍රෑෂ් නොවී බේරගන්න.
        image_url = 'https://ui-avatars.com/api/?name=Workshop&background=b4a460&color=fff';
      }
    }

    // 🎯 ඩේටාබේස් එකේ තියෙන columns වලට විතරක් ඩේටා වෙන් කරලා ගන්නවා
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

    let image_url = workshop.image_url; // 1. Default විදිහට පරණ තිබ්බ image url එකම තියාගන්නවා

    // ඇඩ්මින් අලුත් ඉමේජ් එකක් සිලෙක්ට් කරලා තියෙනවා නම් විතරක් Cloudinary යවනවා
    if (req.body.image && req.body.image.startsWith('data:image')) {
      try {
        const uploadRes = await cloudinary.uploader.upload(req.body.image, {
          folder: 'mehera_workshops',
        });
        image_url = uploadRes.secure_url; // Upload සාර්ථක නම් විතරක් අලුත් URL එක ගන්නවා
      } catch (cloudinaryErr) {
        console.error("⚠️ Cloudinary Upload Failed (Update):", cloudinaryErr.message);
        // 💡 Cloudinary fail වුණොත්, 255 සීමාව පනින Base64 එක ඩේටාබේස් එකට දාන්න යන්නේ නැහැ.
        // පරණ තිබුණු image_url එකම වෙනස් නොකර තියාගන්නවා (No DB crash).
      }
    }

    // 🎯 ඩේටාබේස් එකේ තියෙන නිවැරදිම ටේබල් ෆීල්ඩ්ස් ටික විතරක් අප්ඩේට් කරන්න Payload එක හදනවා
    const updatedData = {
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      capacity: req.body.capacity,
      speakers: req.body.speakers,
      duration: req.body.duration,
      type: req.body.type,
      image_url: image_url // 👈 මෙතනට කවදාවත් ලොකු Base64 string එකක් වැටෙන්නේ නැහැ දැන්
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