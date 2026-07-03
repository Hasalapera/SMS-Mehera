const nodemailer = require('nodemailer');

const sendDispatchNotification = async (order) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const confirmLink = `${frontendUrl}/confirm-delivery/${order.order_id}/${order.delivery_token}`;
    
    // Generate Items HTML
    const itemsHtml = (order.OrderItems || []).map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 13px; color: #333;"><b>${item.variant?.product?.product_name || 'Product'}</b><br/><span style="font-size: 10px; color: #666;">${item.variant?.variant_name || 'Std'}</span></td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; font-size: 13px;">${item.qty}</td>
      </tr>
    `).join('');

    const htmlBody = `
    <div style="max-width: 600px; margin: auto; font-family: sans-serif; border: 1px solid #e0e0e0; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
      <div style="background-color: #000; padding: 30px; text-align: center;">
        <img src="https://i.postimg.cc/nzwPbHWj/mehera-logo.png" alt="Mehera" style="width: 100px; margin-bottom: 10px;" />
        <h1 style="color: #b4a460; margin: 0; letter-spacing: 2px; font-size: 20px; text-transform: uppercase;">Mehera International</h1>
      </div>
      <div style="padding: 30px; background-color: #fff;">
        <h2 style="color: #1a1a1a; margin-top: 0; text-align: center;">Order Dispatched! 🚚</h2>
        
        <div style="margin-bottom: 20px; border-left: 3px solid #b4a460; padding-left: 15px;">
            <p style="color: #444; font-size: 14px; margin-bottom: 8px;">Hi <b>${order.customer_name}</b>, your order <b>#${order.order_id.substring(0, 8).toUpperCase()}</b> has been handed over to the courier and is on its way to you.</p>
            <p style="color: #444; font-size: 14px; margin-bottom: 8px; line-height: 1.6;"> ආයුබෝවන් <b>${order.customer_name}</b>, ඔබගේ ඇණවුම <b>#${order.order_id.substring(0, 8).toUpperCase()}</b> කුරියර් සේවාව වෙත භාර දී ඇති අතර එය ඔබ වෙත පැමිණෙමින් තිබේ.</p>
            <p style="color: #444; font-size: 14px; margin-bottom: 0; line-height: 1.6;">வணக்கம் <b>${order.customer_name}</b>, உங்கள் ஆர்டர் <b>#${order.order_id.substring(0, 8).toUpperCase()}</b> கூரியரிடம் ஒப்படைக்கப்பட்டுள்ளது, அது உங்களிடம் வந்து கொண்டிருக்கிறது.</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 12px; margin-top: 20px;">
          <p style="margin: 0; font-size: 13px; color: #555;"><b>Delivery Address / බෙදාහැරීමේ ලිපිනය / டெலிவரி முகவரி:</b><br/>${order.shipping_address}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="border-bottom: 2px solid #b4a460; color: #b4a460; font-size: 11px;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        
        <div style="margin-top: 30px; border-top: 2px dashed #eee; padding-top: 20px; text-align: center;">
          <h3 style="color: #1a1a1a; margin-bottom: 15px;">Confirm Your Delivery</h3>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: left;">
            <p style="color: #475569; font-size: 12px; margin: 0 0 5px 0;">When you receive your package, please provide this OTP to the courier or click the button below to verify.</p>
            <p style="color: #475569; font-size: 12px; margin: 0 0 5px 0;">කුරියර් සේවාව පැමිණි පසු, භාණ්ඩ ලැබුණු බව තහවුරු කිරීමට මෙම OTP අංකය ලබා දෙන්න හෝ පහත බටන් එක ක්ලික් කරන්න.</p>
            <p style="color: #475569; font-size: 12px; margin: 0;">கூரியர் வந்ததும், டெலிவரியை உறுதிப்படுத்த இந்த OTP ஐ வழங்கவும் அல்லது கீழே உள்ள பொத்தானைக் கிளிக் செய்யவும்.</p>
          </div>
          
          <div style="display: inline-block; background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 10px 25px; border-radius: 10px; font-size: 24px; font-weight: 900; letter-spacing: 5px; margin-bottom: 20px;">
            ${order.delivery_otp}
          </div>
          
          <br/>
          <a href="${confirmLink}" style="display: inline-block; background-color: #b4a460; color: #000; text-decoration: none; padding: 12px 30px; font-weight: bold; border-radius: 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Verify Receipt</a>
        </div>
      </div>
      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 11px; color: #999;">
        <p style="margin: 0;">© ${new Date().getFullYear()} Mehera International. All rights reserved.</p>
      </div>
    </div>`;

    // 1. 📧 SEND EMAIL (Using existing Nodemailer setup)
    if (order.email) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });
            await transporter.sendMail({
                from: `"Mehera Logistics" <${process.env.EMAIL_USER}>`,
                to: order.email,
                subject: `Your Order is on the way!- #${order.order_id.substring(0,8).toUpperCase()}`,
                html: htmlBody
            });
            console.log(`Dispatch Email sent to ${order.email}`);
        } catch (err) {
            console.error("Email sending failed:", err.message);
        }
    }
};

module.exports = { sendDispatchNotification };