const nodemailer = require('nodemailer');
const pool = require('../db/db'); 
const crypto = require('crypto');
const {User, sequelize} = require('../models');

// Support Controller - Handles support email sending and admin contact retrieval
const decryptContact = (text) => {
    // If text is empty or doesn't contain ':', return it as is (not encrypted)
    if (!text) return "";
    // If text doesn't contain ':', it's not in the expected encrypted format, return as is
    if (!text.includes(':')) return text; 

    // Try to decrypt, if fails, return original text
    try {
        // Split the text into IV and encrypted data
        const [ivText, encryptedText] = text.split(':');
        // Convert IV and encrypted data from hex to buffers
        const iv = Buffer.from(ivText, 'hex');
        // Convert the encrypted text from hex to buffer
        const encrypted = Buffer.from(encryptedText, 'hex');
        
        // Enter the Algorithm and Secret Key you are using here.
        // Make sure the secret key is 32 bytes for AES-256
        const decipher = crypto.createDecipheriv(
            'aes-256-cbc', 
            Buffer.from(process.env.CRYPTO_SECRET_KEY, 'hex'), 
            iv
        );
        
        // Decrypt the data
        let decrypted = decipher.update(encrypted);
        // Finalize decryption
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        // Return the decrypted text as a string
        return decrypted.toString();
    } catch (err) {
        // If decryption is not possible (perhaps due to old data), the text is sent directly.
        return text;
    }
};

// Send support email with optional attachment
const sendSupportEmail = async (req, res) => {
    // Extract necessary fields from the request body and file from multer
    const { subject, message, senderEmail, senderName } = req.body;
    // The uploaded file (if any) will be available in req.file thanks to multer
    const file = req.file; 
    // Get the user's role from the authenticated request (assuming you have authentication middleware that sets req.user)
    const userRole = req.user?.role;

    // Log the incoming support request details for debugging
    try {
        // 1. Determine Recipients based on Role
        let recipientEmails = [];
        // WhatsApp numbers for admins 
        let whatsappNumbers = [];

        // 1. Determine Recipients based on Role
        if (userRole && userRole.toLowerCase() === 'admin') {
            // If the sender is an Admin, send the support request to the Developer Team
            console.log("Logged Role Detected: admin");
            // If Admin, send to Developer Team
            const devEmail = process.env.DEV_TEAM_EMAIL;
            // If DEV_TEAM_EMAIL is not set, we can log a warning and use a default email or skip sending
            const devWA = process.env.DEV_TEAM_WHATSAPP;

            // If dev email is set, use it; otherwise, log a warning and use a default email
            recipientEmails = devEmail ? [devEmail] : [];
            // If dev WhatsApp is set, use it; otherwise, log a warning and use a default WhatsApp number
            whatsappNumbers = devWA ? [devWA] : [];
        } else {
            // For non-admin users, send the support request to all active admins
            const adminEmailsResult = await pool.query(
                // Make sure to only select active admins to avoid sending emails to deactivated accounts
                "SELECT email, contact_no FROM users WHERE role = 'admin' AND is_active = true",
                { type: pool.QueryTypes.SELECT }
            );
            
            // Extract emails and decrypt contact numbers for WhatsApp
            recipientEmails = adminEmailsResult.map(row => row.email);
            
            // Decrypt contact numbers for WhatsApp and filter out any empty or null values
            whatsappNumbers = adminEmailsResult
                .filter(row => row.contact_no)
                .map(row => decryptContact(row.contact_no)); // use the decryptContact function to handle decryption and fallback

            // If no active admins found, use default support contact from environment variables

            if (recipientEmails.length === 0) {
                recipientEmails = [process.env.DEFAULT_SUPPORT_EMAIL];
                whatsappNumbers = [process.env.DEFAULT_SUPPORT_WHATSAPP];
            }
        }

        // 2. Format recipients for Nodemailer
        const finalRecipients = recipientEmails.filter(e => e).join(', ');
        
        // Log the final recipients for debugging
        console.log("Transmission Target Emails:", finalRecipients);
        // Log the WhatsApp numbers for debugging
        console.log("Transmission Target WhatsApp:", whatsappNumbers);

        // 3. Nodemailer Configuration
        const transporter = nodemailer.createTransport({
            // Using Gmail as the email service, but you can configure it for other services or SMTP servers
            service: 'gmail',
            auth: {
                // Use environment variables for email credentials to keep them secure
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // 4. Email Content - You can customize the HTML content as needed
        const mailOptions = {
            from: process.env.EMAIL_USER,
            replyTo: senderEmail,
            to: finalRecipients, // Use the filtered list here
            subject: `Support Request [${userRole?.toUpperCase()}]: ${subject}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #b4a460;">New Support Inquiry</h2>
                    <p><b>Sender Name:</b> ${senderName}</p>
                    <p><b>Sender Email:</b> ${senderEmail}</p>
                    <p><b>Role:</b> ${userRole}</p>
                    <hr />
                    <p><b>Message:</b></p>
                    <p>${message}</p>
                </div>
            `,
            // If there's an uploaded file, attach it to the email
            attachments: file ? [{ filename: file.originalname, content: file.buffer }] : []
        };

        // 4. Send the Email
        await transporter.sendMail(mailOptions);
        console.log("Support Email Sent Successfully!");
        res.status(200).json({ 
            message: "Transmission Successful!", 
            whatsappNumbers: whatsappNumbers 
        });

    } catch (error) {
        console.error("Support Email Error Details:", error);
        res.status(500).json({ error: "Failed to transmit support request." });
    }
};

// Get admin contacts for support (with decryption)
const getAdminContacts = async (req, res) => {
    try {
        // Fetch active admins' contact numbers from the database
        const admins = await User.findAll({
            // Only select active admins to ensure we don't return contacts for deactivated accounts
            where: { role: 'admin', is_active: true },
            // Only select the contact_no field since that's what we need for support contact purposes
            attributes: ['contact_no']
        });

        // Decrypted here before sending to the frontend
        const decryptedAdmins = admins.map(admin => ({
            contact_no: decryptContact(admin.contact_no)
        }));

        res.status(200).json({ admins: decryptedAdmins });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


module.exports = { sendSupportEmail, getAdminContacts, decryptContact };