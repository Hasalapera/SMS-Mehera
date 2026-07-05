const nodemailer = require('nodemailer');
const { Product, Variant } = require('../models'); // 🎯 [FIX] ඩේටාබේස් මොඩල්ස් මෙතනට ඉම්පෝර්ට් කළා මචං

// 1. Transporter එක සෑදීම
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, 
  auth: {
    user: 'info.meheraint@gmail.com', 
    pass: 'yvfm dfev siyh vuld'     
  },
  tls: {
    rejectUnauthorized: false 
  }
});

// --- Function 01: පාරිභෝගිකයාට Invoice එක යැවීම ---
const sendEmailInvoice = async (customerEmail, orderDetails) => {
  try {
    const itemsToRender = orderDetails.OrderItems || orderDetails.items || [];
    
    // 🎯 [ASYNC RESOLVER MATRIX]: ID එකෙන් ඩේටාබේස් ගිහින් නම් ටික ඔක්කොම එකපාර අරන් එනවා මචං
    const itemsHtmlPromises = itemsToRender.map(async (item) => {
      let productName = 'Premium Cosmetic Item';
      let variantName = '';

      try {
        // 1. product_id එකෙන් Product Name එක ඩේටාබේස් එකෙන් ගන්නවා
        if (item.product_id) {
          const prod = await Product.findByPk(item.product_id);
          if (prod) productName = prod.product_name || prod.name;
        }

        // 2. variant_id එකෙන් Variant Name එක ඩේටාබේස් එකෙන් ගන්නවා
        if (item.variant_id) {
          const vari = await Variant.findByPk(item.variant_id);
          if (vari) variantName = vari.variant_name || vari.name;
        }
      } catch (dbErr) {
        console.error("❌ DB Fetch Error inside Email Service:", dbErr.message);
        // DB එකෙන් හොයාගන්න බැරි වුණොත් කලින් තිබ්බ fallback පාවිච්චි කරනවා
        productName = item.product_name || item.name || productName;
        variantName = item.variant_name || '';
      }

      return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 13px; color: #333; text-align: left;">
          <b style="color: #000; text-transform: uppercase; font-size: 12px;">${productName}</b>
          ${variantName && variantName.toLowerCase() !== 'standard' && variantName.toLowerCase() !== 'default' 
            ? `<br/><span style="font-size: 10px; color: #b4a460; font-weight: bold; text-transform: uppercase; tracking-wider: 0.05em;">Variant: ${variantName}</span>` 
            : ''
          }
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; font-size: 13px; color: #555;">${item.qty}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-size: 13px; font-weight: bold; color: #000;">LKR ${Number(item.price).toLocaleString()}</td>
      </tr>
      `;
    });

    // Promises ඔක්කොම Resolve වෙනකම් ඉන්නවා මචං
    const itemsHtmlArray = await Promise.all(itemsHtmlPromises);
    const itemsHtml = itemsHtmlArray.join('');

    const mailOptions = {
      from: '"Mehera International" <info.meheraint@gmail.com>',
      to: customerEmail,
      subject: `Your Mehera Order Invoice - #${orderDetails.order_id ? orderDetails.order_id.toString().slice(0, 8) : 'ORDER'}`,
      html: `
        <div style="max-width: 600px; margin: auto; font-family: sans-serif; border: 1px solid #e0e0e0; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          
          <div style="background-color: #000; padding: 35px 30px; text-align: center;">
            <img src="https://res.cloudinary.com/zegvhfue/image/upload/v1783197629/mehera_logo_white_lkpxqr.png" alt="Mehera" style="height: 50px; width: auto; margin-bottom: 12px; object-fit: contain;" />
            <h1 style="color: #b4a460; margin: 0; letter-spacing: 3px; font-size: 18px; text-transform: uppercase; font-weight: 800;">Mehera International</h1>
          </div>

          <div style="padding: 30px; background-color: #fff; text-align: left;">
            <h2 style="color: #1a1a1a; margin-top: 0; font-family: serif; font-style: italic; font-size: 24px;">Order Created!</h2>
            <p style="color: #666; font-size: 14px;">Hi <b>${orderDetails.customer_name}</b>, your order summary is detailed below:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="border-bottom: 2px solid #b4a460; color: #b4a460; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">
                  <th style="padding: 10px; text-align: left;">Item Description</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            
            <div style="text-align: right; margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 10px; color: #999; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Total Amount</p>
              <span style="font-size: 24px; font-weight: 900; color: #000;">LKR ${Number(orderDetails.total_amount).toLocaleString()}</span>
            </div>

            <div style="margin-top: 30px; padding: 15px 20px; background-color: #fcfbf7; border-left: 3px solid #b4a460; border-radius: 8px;">
              <p style="margin: 0; font-size: 11px; color: #8a7b42; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">⚠️ Important Notice / කොන්දේසි:</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #666; line-height: 1.5; font-style: italic;">
                Please note that this order is currently subject to administrative review. If the administration decides to decline the order, this summary will be officially processed and utilized as a commercial quotation only.
                <br/>
                <span style="font-size: 11px; color: #888;">(මෙම ඇණවුම පරිපාලන අනුමැතියට යටත් වන අතර, කිසියම් හේතුවක් මත ඇණවුම ප්‍රතික්ෂේප වුවහොත් මෙම ලේඛනය මිල කැඳවීමක් (Quotation) ලෙස පමණක් වලංගු වේ.)</span>
              </p>
            </div>

          </div>
        </div>`
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Invoice Sent to Customer successfully:", info.messageId);
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
    to: 'info.meheraint@gmail.com', 
    replyTo: formData.reply_to,
    subject: `New Inquiry: ${formData.from_name}`,
    html: `
      <div style="font-family: sans-serif; border: 1px solid #b4a460; padding: 25px; border-radius: 20px; max-width: 550px; background-color: #fff; text-align: left;">
        <h2 style="color: #000; border-bottom: 2px solid #b4a460; padding-bottom: 10px; font-size: 18px; font-family: serif; font-style: italic;">New Inquiry Received</h2>
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

module.exports = { sendEmailInvoice, sendContactMessage };