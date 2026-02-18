const pool = require('../db/db');
const bcrypt = require('bcryptjs');
const { sendWelcomeEmail } = require('../utils/emailSender');

const addUserByAdmin = async (req, res) => {
    try {
        // 1. Frontend Form එකේ දත්ත වලට ගැළපෙන සේ මේවා වෙනස් කළා
        const { name, email, role, dob, contact_no } = req.body;

        const countRes = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', [role]);
        const nextNumber = parseInt(countRes.rows[0].count) + 1;
        const defaultPassword = `${role}${nextNumber}@user`;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        // 2. ඩේටාබේස් එකේ තියෙන dob, contact_no වැනි අලුත් fields මෙතැනට ඇතුළත් කළා
        const result = await pool.query(
            `INSERT INTO users (name, email, password, role, dob, contact_no, is_active, is_default_password) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [name, email, hashedPassword, role, dob, contact_no, true, true]
        );

        await sendWelcomeEmail(email, name, defaultPassword, role);

        res.status(201).json({
            message: "User added successfully! Details sent by email.",
            user: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const resetToDefaultPassword = async (req, res) => {
    try {
        // 3. දැන් Admin ගේ විස්තර Middleware එකෙන් req.user හරහා ලැබෙනවා
        const { user_id, role, email, name } = req.body;

        // Admin ගේ password එක body එකෙන් පරීක්ෂා කිරීම අවශ්‍ය නැහැ, 
        // මොකද Middleware එකෙන් ඔහුගේ Token එක දැනටමත් verify කරලා ඉවරයි

        const newDefault = `${role}reset@user`;
        const salt = await bcrypt.genSalt(10);
        const hashedResetPassword = await bcrypt.hash(newDefault, salt);

        await pool.query(
            'UPDATE users SET password = $1, is_default_password = true WHERE user_id = $2',
            [hashedResetPassword, user_id]
        );

        await sendWelcomeEmail(email, name, newDefault, role);
        res.status(200).json({ message: "Password reset successful!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { user_id, new_password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);

        await pool.query(
            'UPDATE users SET password = $1, is_default_password = false WHERE user_id = $2',
            [hashedPassword, user_id]
        );

        res.status(200).json({ message: "Password updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const getAllUsers = async (req, res) => {
    try {
        // Retrieving all those who were and were not soft deleted
        const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const softDeleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // deleted_at එකට වර්තමාන වේලාව ඇතුළත් කිරීම (Soft Delete)
        const result = await pool.query(
            'UPDATE users SET deleted_at = CURRENT_TIMESTAMP, is_active = false WHERE user_id = $1 RETURNING *',
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.status(200).json({ message: "User archived successfully!", user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { addUserByAdmin, updatePassword, resetToDefaultPassword, getAllUsers, softDeleteUser };