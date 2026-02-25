const pool = require('../db/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. User පරීක්ෂාව
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL', 
            [email]
        );
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: "එම ඊමේල් ලිපිනය පද්ධතියේ ලියාපදිංචි කර නැත!" });
        }

        // 2. Password එක පරීක්ෂා කිරීම
        const isMatch = await bcrypt.compare(password, user.password.trim());
        
        if (!isMatch) {
            return res.status(401).json({ message: "ඔබ ඇතුළත් කළ මුරපදය වැරදියි!" });
        }

        // Token එක නිර්මාණය කිරීම
        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            process.env.JWT_SECRET || 'mehera_secret_key',
            { expiresIn: '1d' }
        );

        // 3. තාවකාලික මුරපදය පරීක්ෂාව
        if (user.is_default_password === true) {
            return res.status(200).json({
                message: "තාවකාලික මුරපදය වෙනස් කළ යුතුයි!",
                mustChangePassword: true,
                role: user.role, 
                token: token,
                user_id: user.user_id,
                full_name: user.name // මුලින්ම නම පෙන්වීමට
            });
        }

        // 4. Role-based redirection logic
        const roleMap = {
            'admin': '/dashboard',
            'manager': '/dashboard',
            'sales_rep': '/home',
            'online_store_keeper': '/home'
        };
        const redirectPath = roleMap[user.role] || '/dashboard';

        // 🔴 SECURITY TIP: Password Hash එක අයින් කර ආරක්ෂිත දත්ත පමණක් යැවීම
        const { password: _, ...safeUserData } = user;

        res.status(200).json({
            message: "සාර්ථකව ලොග් විය",
            token,
            user: {
                ...safeUserData,
                full_name: user.name,
                redirectPath 
            }
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { loginUser };