const nodemailer = require('nodemailer');
require('dotenv').config();

// This utility module provides functions to send various types of emails using the Nodemailer library. 
// It includes functions to send welcome emails, delivery OTPs, and thank-you emails. 
// Each function creates a transporter using Gmail's SMTP service and sends an email with the specified content and formatting.
// The sendWelcomeEmail function sends a welcome email to new users with their temporary credentials and role information.
const sendWelcomeEmail = async (userEmail, fullName, tempPassword, role) => { // added role parameter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

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
        officialRoleName = role; // if role is something unexpected, just use it as is
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

// This function sends a delivery OTP email to the customer. It includes the customer's name, order ID, and the OTP required for delivery verification. The email is formatted with HTML for better presentation.
// The sendThankYouEmail function sends a thank-you email to the customer after the successful delivery of their order. It includes the customer's name and order ID, expressing gratitude for their purchase and encouraging feedback or further assistance if needed.
const sendDeliveryOTP = async (userEmail, customerName, orderId, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    // Construct the email content with HTML formatting
    // The email includes the customer's name, order ID, and the OTP for delivery verification. It also provides instructions and a note for security purposes.
    // The email is designed to be visually appealing and easy to read, with clear sections for the OTP and important information.
    // The email content is structured with headings, paragraphs, and styled divs to enhance readability and user experience.
    const mailOptions = {
        from: '"Mehera International" <' + process.env.EMAIL_USER + '>',
        to: userEmail,
        subject: `Delivery Verification OTP - Order #${orderId.substring(0,8).toUpperCase()}`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #2c3e50;">Delivery Verification</h2>
                <p>Dear <b>${customerName || 'Customer'}</b>,</p>
                <p>Your order <b>#${orderId.substring(0,8).toUpperCase()}</b> is being delivered. Please provide the following OTP to the delivery agent to confirm receipt of your package:</p>
                <div style="background-color: #f9f9f9; padding: 15px; text-align: center; margin: 20px 0;">
                    <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #b4a460;">${otp}</span>
                </div>
                <p style="font-size: 0.9em; color: #7f8c8d;">If you did not request this, please contact our support.</p>
                <p style="font-size: 0.9em; color: #7f8c8d;">Best Regards,<br><strong>Mehera International (Pvt) Ltd.</strong></p>
            </div>`
    };
    await transporter.sendMail(mailOptions);
};

// This function sends a thank-you email to the customer after the successful delivery of their order. It includes the customer's name and order ID, expressing gratitude for their purchase and encouraging feedback or further assistance if needed.
const sendThankYouEmail = async (userEmail, customerName, orderId) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    const mailOptions = {
        from: '"Mehera International" <' + process.env.EMAIL_USER + '>',
        to: userEmail,
        subject: `Thank You for Your Purchase! - Order #${orderId.substring(0,8).toUpperCase()}`,
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px;"><h2 style="color: #b4a460;">Delivery Confirmed! 🎉</h2><p>Dear <b>${customerName || 'Customer'}</b>,</p><p>We have successfully delivered your order <b>#${orderId.substring(0,8).toUpperCase()}</b>.</p><p>Thank you for shopping with Mehera International! We hope you love your premium cosmetics. If you have any feedback or need further assistance, please do not hesitate to contact us.</p><hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"><p style="font-size: 0.9em; color: #7f8c8d;">Best Regards,<br><strong>Mehera International (Pvt) Ltd.</strong></p></div>`
    };
    await transporter.sendMail(mailOptions);
};

module.exports = { sendWelcomeEmail, sendDeliveryOTP, sendThankYouEmail };