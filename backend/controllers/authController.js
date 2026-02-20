const pool = require('../db/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL', 
            [email]
        );
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: "The email or key is incorrect!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "The email or key is incorrect!" });
        }

        // Token එකට අවශ්‍ය දත්ත ඇතුළත් කිරීම
        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            process.env.JWT_SECRET || 'mehera_secret_key',
            { expiresIn: '1d' }
        );

        // 1. තාවකාලික මුරපදය පරීක්ෂාව
        if (user.is_default_password === true) {
            return res.status(200).json({
                message: "The temporary key must be changed!",
                mustChangePassword: true,
                redirectPath: "/change-password",
                token: token,
                user_id: user.user_id
            });
        }

        // 2. Role-based redirection logic එක
        const roleMap = {
            'admin': '/dashboard',
            'manager': '/dashboard',
            'sales_rep': '/sales-rep-dashboard',
            'online_store_keeper': '/store-keeper-dashboard'
        };
        const redirectPath = roleMap[user.role] || '/dashboard';

        res.status(200).json({
            message: "Logged In successfully",
            token,
            user: {
                user_id: user.user_id,
                full_name: user.full_name || user.name, // DB එකේ column එක full_name නම් එය ප්‍රමුඛ කරන්න
                email: user.email,
                role: user.role,
                contact_no: user.contact_no, 
                nic_no: user.nic_no,        
                dob: user.dob,              
                picture_url: user.picture_url,
                is_active: user.is_active,
                created_at: user.created_at,
                redirectPath 
            }
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { loginUser };