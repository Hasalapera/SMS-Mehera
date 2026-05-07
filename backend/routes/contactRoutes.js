const express = require('express');
const router = express.Router();

// ✅ services වෙනුවට utils ලෙස වෙනස් කළා
const { sendContactMessage } = require('../utils/sendEmailInvoice'); 

router.post('/send-message', async (req, res) => {
  try {
    await sendContactMessage(req.body);
    res.status(200).json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("❌ Route Error:", error);
    res.status(500).json({ success: false, message: "Error sending message." });
  }
});

module.exports = router;