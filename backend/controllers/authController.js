const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user with paranoid: false to include soft-deleted users for checking
        const user = await User.findOne({ where: { email }, paranoid: false });

        if (!user) {
            return res.status(401).json({ message: "That email address is not registered!" });
        }

        if (user.deleted_at) {
            return res.status(401).json({ message: "This account has been deleted!" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password.trim());
        
        if (!isMatch) {
            return res.status(401).json({ message: "The password you entered is incorrect!" });
        }

        // Create JWT token
        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            process.env.JWT_SECRET || 'mehera_secret_key',
            { expiresIn: '1d' }
        );

        // Check if default password needs changing
        if (user.is_default_password === true) {
            return res.status(200).json({
                message: "තාවකාලික මුරපදය වෙනස් කළ යුතුයි!",
                mustChangePassword: true,
                role: user.role, 
                token,
                user_id: user.user_id,
                full_name: user.name 
            });
        }

        // Remove password before sending
        const safeUser = user.toJSON();
        delete safeUser.password;

        res.status(200).json({
            message: "සාර්ථකව ලොග් විය",
            token,
            user: safeUser,
        });

    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { loginUser };