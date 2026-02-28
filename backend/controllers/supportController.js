const nodemailer = require('nodemailer');
const pool = require('../db/db'); 

const sendSupportEmail = async (req, res) => {
    const { subject, message, senderEmail, senderName } = req.body;
    const file = req.file; 
    const userRole = req.user?.role;

    try {
        let recipientEmails = [];
        let whatsappNumbers = [];

        // 1. Determine Recipients based on Role
        if (userRole && userRole.toLowerCase() === 'admin') {
            console.log("Logged Role Detected: admin");
            // If Admin, send to Developer Team
            const devEmail = process.env.DEV_TEAM_EMAIL;
            const devWA = process.env.DEV_TEAM_WHATSAPP;

            recipientEmails = devEmail ? [devEmail] : [];
            whatsappNumbers = devWA ? [devWA] : [];
        } else {
            console.log("Logged Role Detected: User/Sales_rep");
            // If User, send to all System Admins
            const adminEmailsResult = await pool.query(
                "SELECT email, contact_no FROM users WHERE role = 'admin' AND is_active = true"
            );
            
            recipientEmails = adminEmailsResult.rows.map(row => row.email);
            whatsappNumbers = adminEmailsResult.rows.filter(row => row.contact_no).map(row => row.contact_no);

            // Fallback if no admins found in DB
            if (recipientEmails.length === 0) {
                recipientEmails = [process.env.DEFAULT_SUPPORT_EMAIL];
                whatsappNumbers = [process.env.DEFAULT_SUPPORT_WHATSAPP];
            }
        }

        // 2. Format recipients for Nodemailer
        const finalRecipients = recipientEmails.filter(e => e).join(', ');
        
        console.log("Transmission Target Emails:", finalRecipients);
        console.log("Transmission Target WhatsApp:", whatsappNumbers);

        // 3. Nodemailer Configuration
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

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
            attachments: file ? [{ filename: file.originalname, content: file.buffer }] : []
        };

        // 4. Send the Email
        await transporter.sendMail(mailOptions);
        
        res.status(200).json({ 
            message: "Transmission Successful!", 
            whatsappNumbers: whatsappNumbers 
        });

    } catch (error) {
        console.error("Support Email Error Details:", error);
        res.status(500).json({ error: "Failed to transmit support request." });
    }
};

module.exports = { sendSupportEmail };