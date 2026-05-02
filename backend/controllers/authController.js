const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email }, paranoid: false });

        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: "That email address is not registered!" 
            });
        }

        if (user.deleted_at) {
            return res.status(401).json({ 
                success: false,
                message: "This account has been deleted!" 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password.trim());
        
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                message: "The password you entered is incorrect!" 
            });
        }

        // 🔑 JWT TOKEN සෑදීම
        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        // 🍪 HttpOnly Cookie එක Set කිරීම (Frontend JS වලට access කරන්න බෑ)
        const cookieMaxAge = parseInt(process.env.JWT_EXPIRES_IN || '1d') === parseInt(process.env.JWT_EXPIRES_IN)
            ? (process.env.JWT_EXPIRES_IN.includes('s') ? parseInt(process.env.JWT_EXPIRES_IN) * 1000 : 
               process.env.JWT_EXPIRES_IN.includes('m') ? parseInt(process.env.JWT_EXPIRES_IN) * 60 * 1000 : 
               24 * 60 * 60 * 1000)
            : 30 * 1000; // Default 30 seconds
        
        res.cookie('token', token, {
            httpOnly: true,           // ✅ JavaScript වලට access නොහැක
            secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
            sameSite: 'Lax',          // CSRF protection
            maxAge: cookieMaxAge,     // milliseconds
            path: '/'
        });

        // Safe user object (password remove කරන්න)
        const safeUser = user.toJSON();
        delete safeUser.password;

        // 📤 Frontend එකට expiresAt time එක දෙන්න (countdown එකට)
        const decoded = jwt.decode(token);
        
        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: safeUser,
            token: token,  // localStorage එකට තබන්න
            expiresAt: decoded.exp,  // Frontend countdown එකට
            mustChangePassword: user.is_default_password
        });

    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
};

const logoutUser = (req, res) => {
    // 🍪 Cookie clear කිරීම
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/'
    });
    
    res.status(200).json({ 
        success: true,
        message: "Logged out successfully" 
    });
};

module.exports = { loginUser, logoutUser };