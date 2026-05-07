const nodemailer = require('nodemailer');
const pool = require('../db/db'); 
const crypto = require('crypto');
const {User, sequelize} = require('../models');


const decryptContact = (text) => {
    if (!text) return "";
    
    // 💡 පරණ ඒවා Encrypt වෙලා නැති නිසා, ඒවායේ සාමාන්‍යයෙන් ":" නැහැ.
    // ඒ වගේම ඒවා කෙලින්ම නම්බර් එකක් විදිහට තියෙන්නේ.
    if (!text.includes(':')) return text; 

    try {
        const [ivText, encryptedText] = text.split(':');
        const iv = Buffer.from(ivText, 'hex');
        const encrypted = Buffer.from(encryptedText, 'hex');
        
        // ඔයා පාවිච්චි කරන Algorithm සහ Secret Key එක මෙතනට දෙන්න
        const decipher = crypto.createDecipheriv(
            'aes-256-cbc', 
            Buffer.from(process.env.CRYPTO_SECRET_KEY, 'hex'), 
            iv
        );
        
        let decrypted = decipher.update(encrypted);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (err) {
        // Decrypt කරන්න බැරි වුණොත් (සමහර විට පරණ ඩේටා නිසා) කෙලින්ම text එක යවනවා
        return text;
    }
};

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
            const adminEmailsResult = await pool.query(
                "SELECT email, contact_no FROM users WHERE role = 'admin' AND is_active = true",
                { type: pool.QueryTypes.SELECT }
            );
            
            recipientEmails = adminEmailsResult.map(row => row.email);
            
            // 🚨 මෙතනදී Decrypt කරලා තමයි නම්බර්ස් ටික ගන්නේ
            whatsappNumbers = adminEmailsResult
                .filter(row => row.contact_no)
                .map(row => decryptContact(row.contact_no)); // Decrypt function එක පාවිච්චි කළා

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

const getAdminContacts = async (req, res) => {
    try {
        const admins = await User.findAll({
            where: { role: 'admin', is_active: true },
            attributes: ['contact_no']
        });

        // 🚨 Frontend එකට යවන්න කලින් මෙතනත් Decrypt කරනවා
        const decryptedAdmins = admins.map(admin => ({
            contact_no: decryptContact(admin.contact_no)
        }));

        res.status(200).json({ admins: decryptedAdmins });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


module.exports = { sendSupportEmail, getAdminContacts, decryptContact };