const nodemailer = require('nodemailer');
require('dotenv').config();

const sendWelcomeEmail = async (userEmail, fullName, tempPassword, role) => { // මෙතැනට role එකත් ගමු
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // 1. මෙතැනදී අපි භාෂා පරිවර්තනයක් වගේ වැඩක් කරනවා
    let officialRoleName = "";

    if (role === 'admin') {
        officialRoleName = "Administrator";
    } else if (role === 'manager') {
        officialRoleName = "Regional Manager";
    } else if (role === 'sales_rep') {
        officialRoleName = "Sales Representative";
    } else if (role === 'online_store_keeper') {
        officialRoleName = "Online Store Keeper";
    } else {
        officialRoleName = role; // වෙනත් එකක් ආවොත් තිබුණු නමම ගන්නවා
    }

    const mailOptions = {
        from: '"Mehera International" <' + process.env.EMAIL_USER + '>',
        to: userEmail,
        subject: 'Welcome to Mehera Sales Management System',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #2c3e50;">Welcome to Mehera International!</h2>
                <p>Dear <b>${fullName}</b>,</p>
                <p>Your account has been successfully created in the <b>Mehera Sales Management System</b>. You can now log in using the temporary credentials provided below:</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-left: 5px solid #2ecc71; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Designation (Role):</strong> ${officialRoleName}</p>
                    <p style="margin: 5px 0;"><strong>Login Email:</strong> ${userEmail}</p>
                    <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <span style="background: #fff; border: 1px dashed #999; padding: 2px 5px;">${tempPassword}</span></p>
                </div>

                <p style="color: #e74c3c; font-weight: bold;">Important:</p>
                <p>For security purposes, you are required to change this temporary password immediately after your first login.</p>
                
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 0.9em; color: #7f8c8d;">This is an automated message. Please do not reply to this email.</p>
                <p style="font-size: 0.9em; color: #7f8c8d;">Best Regards,<br><strong>System Admin - Mehera International (Pvt) Ltd.</strong></p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendWelcomeEmail };