const nodemailer = require('nodemailer');

// 1. Transporter එක සෑදීම
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL පාවිච්චි කිරීම (Port 465 සඳහා)
  auth: {
    user: 'info.meheraint@gmail.com', 
    pass: 'yvfm dfev siyh vuld'     // 👈 ඔයාගේ Google App Password එක
  },
  tls: {
    // Local network වලදී ඇතිවන SSL අවහිරතා මඟහැරීමට මෙය උදවු වේ
    rejectUnauthorized: false 
  }
});

// --- Function 01: පාරිභෝගිකයාට Invoice එක යැවීම ---
const sendEmailInvoice = async (customerEmail, orderDetails) => {
  try {
    const itemsHtml = orderDetails.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 13px; color: #333;"><b>${item.name}</b></td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; font-size: 13px;">${item.qty}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-size: 13px; font-weight: bold;">LKR ${Number(item.price).toLocaleString()}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: '"Mehera International" <info.meheraint@gmail.com>',
      to: customerEmail,
      subject: `Your Mehera Order Invoice - #${orderDetails.order_id.slice(0, 8)}`,
      html: `
        <div style="max-width: 600px; margin: auto; font-family: sans-serif; border: 1px solid #e0e0e0; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <div style="background-color: #000; padding: 30px; text-align: center;">
            <img src="https://i.postimg.cc/nzwPbHWj/mehera-logo.png" alt="Mehera" style="width: 100px; margin-bottom: 10px;" />
            <h1 style="color: #b4a460; margin: 0; letter-spacing: 2px; font-size: 20px; text-transform: uppercase;">Mehera International</h1>
          </div>
          <div style="padding: 30px; background-color: #fff;">
            <h2 style="color: #1a1a1a; margin-top: 0;">Order Confirmed!</h2>
            <p style="color: #666; font-size: 14px;">Hi <b>${orderDetails.customer_name}</b>, order summary below:</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="border-bottom: 2px solid #b4a460; color: #b4a460; font-size: 11px;">
                  <th style="padding: 10px; text-align: left;">Item</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <div style="text-align: right; margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px;">
              <span style="font-size: 22px; font-weight: 900; color: #000;">LKR ${Number(orderDetails.total_amount).toLocaleString()}</span>
            </div>
          </div>
        </div>`
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Invoice Sent to Customer:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Invoice Email Error:", error);
    throw error;
  }
};

// --- Function 02: Contact Form එකෙන් එන මැසේජ් එක ඔයාට ලැබීම ---
const sendContactMessage = async (formData) => {
  console.log("📩 Attempting to send Contact Inquiry for:", formData.from_name);
  
  const mailOptions = {
    from: '"Mehera Contact Form" <info.meheraint@gmail.com>',
    to: 'info.meheraint@gmail.com', // 👈 මේල් එක ලැබෙන්න ඕනේ ලිපිනය
    replyTo: formData.reply_to,
    subject: `New Inquiry: ${formData.from_name}`,
    html: `
      <div style="font-family: sans-serif; border: 1px solid #b4a460; padding: 25px; border-radius: 20px; max-width: 550px; background-color: #fff;">
        <h2 style="color: #000; border-bottom: 2px solid #b4a460; padding-bottom: 10px; font-size: 18px;">New Inquiry Received</h2>
        <div style="margin: 20px 0; font-size: 14px; line-height: 1.8; color: #333;">
          <p><b>Name:</b> ${formData.from_name}</p>
          <p><b>Email:</b> <a href="mailto:${formData.reply_to}">${formData.reply_to}</a></p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 12px; border: 1px solid #eee; margin-top: 15px;">
            <p style="margin: 0; font-weight: bold; color: #b4a460;">Message Body:</p>
            <p style="margin-top: 5px;">${formData.message}</p>
          </div>
        </div>
        <p style="font-size: 10px; color: #999; text-align: center;">Sent via Mehera SMS Portal</p>
      </div>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Contact Email Sent Successfully! ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Nodemailer Send Error:", error);
    throw error;
  }
};

// ✅ Exporting both functions
module.exports = { sendEmailInvoice, sendContactMessage };