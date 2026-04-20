const nodemailer = require('nodemailer');

const sendEmailInvoice = async (customerEmail, orderDetails) => {
  // 1. Email යැවීමට අවශ්‍ය Transporter එක සෑදීම
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'info.meheraint@gmail.com', // 👈 ඔයාගේ Gmail ලිපිනය මෙතනට දාන්න
      pass: 'yvfm dfev siyh vuld'     // 👈 Google App Password එක මෙතනට දාන්න
    }
  });

  // 2. භාණ්ඩ ලැයිස්තුව HTML Table එකක් ලෙස සෑදීම
  const itemsHtml = orderDetails.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 13px; color: #333;">
        <b>${item.name}</b>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; font-size: 13px;">${item.qty}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-size: 13px; font-weight: bold;">
        LKR ${Number(item.price).toLocaleString()}
      </td>
    </tr>
  `).join('');

  // 3. Email එකේ අන්තර්ගතය (HTML/CSS)
  const mailOptions = {
    from: '"Mehera International" <gihankaveesha@gmail.com>',
    to: customerEmail,
    subject: `Your Mehera Order Invoice - #${orderDetails.order_id.slice(0, 8)}`,
    html: `
      <div style="max-width: 600px; margin: auto; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; border: 1px solid #e0e0e0; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        
        <div style="background-color: #000; padding: 40px 20px; text-align: center;">
          <img src="https://i.postimg.cc/nzwPbHWj/mehera-logo.png" 
               alt="Mehera International" 
               style="width: 120px; height: auto; margin-bottom: 15px;"
          />
          <h1 style="color: #b4a460; margin: 0; letter-spacing: 3px; font-size: 22px; text-transform: uppercase;">Mehera International</h1>
          <p style="color: #ffffff; font-size: 9px; text-transform: uppercase; margin-top: 8px; letter-spacing: 2px; opacity: 0.7;">Premium Beauty & Care Solutions</p>
        </div>
        
        <div style="padding: 40px; background-color: #fff;">
          <h2 style="color: #1a1a1a; margin-top: 0; font-size: 22px; font-weight: 900;">Order Confirmed!</h2>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">Hi <b>${orderDetails.customer_name}</b>,<br/> 
          Great news! We've received your order and our team is already working on it. Here's a summary of your purchase:</p>
          
          <div style="margin: 25px 0; padding: 20px; background-color: #fcfaf2; border-left: 4px solid #b4a460; border-radius: 8px;">
            <p style="margin: 5px 0; font-size: 13px; color: #444;"><b>Order ID:</b> #${orderDetails.order_id}</p>
            <p style="margin: 5px 0; font-size: 13px; color: #444;"><b>Delivery to:</b> ${orderDetails.shipping_address}, ${orderDetails.district}</p>
            <p style="margin: 5px 0; font-size: 13px; color: #444;"><b>Contact:</b> ${orderDetails.primary_phone}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="border-bottom: 2px solid #b4a460;">
                <th style="padding: 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #b4a460;">Item Description</th>
                <th style="padding: 12px; text-align: center; font-size: 11px; text-transform: uppercase; color: #b4a460;">Qty</th>
                <th style="padding: 12px; text-align: right; font-size: 11px; text-transform: uppercase; color: #b4a460;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 20px 12px; text-align: right; font-size: 14px; font-weight: bold; color: #666;">Grand Total:</td>
                <td style="padding: 20px 12px; text-align: right; font-size: 20px; font-weight: 900; color: #000;">LKR ${Number(orderDetails.total_amount).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #999; font-size: 12px;">If you have any questions regarding this invoice, please contact our support team.</p>
          </div>
        </div>

        <div style="background-color: #fafafa; padding: 25px; text-align: center; border-top: 1px solid #eee;">
          <p style="margin: 0; color: #333; font-size: 12px; font-weight: bold;">MEHERA INTERNATIONAL (PVT) LTD</p>
          <p style="margin: 5px 0 0; color: #bbb; font-size: 10px;">&copy; 2026 Mehera International. All rights reserved.</p>
        </div>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendEmailInvoice;