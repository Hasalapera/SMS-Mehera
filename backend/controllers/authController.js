require('dotenv').config();
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { decrypt } = require('../utils/cryptoUtils');

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email }, paranoid: false });

        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid email or password" 
            });
        }

        if (user.deleted_at || !user.is_active) {
            const admin = await User.findOne({ where: { role: 'admin' } });
            let displayContact = 'N/A';
            if (admin) {
                // change this if your admin contact field is different
                const rawContact = admin.contact_no || admin.phone1;

                if (rawContact) {
                    try {
                        // try for decrypt
                        displayContact = decrypt(rawContact);
                    } catch (e) {
                        //if cannot decrypt, use raw value (in case it's not encrypted)
                        displayContact = rawContact;
                    }
                }
            }
            return res.status(403).json({ 
                success: false,
                message: `Account deactivated. Please contact Administrator at ${displayContact}`,
                adminContact: displayContact
            });
        }

        const isMatch = await bcrypt.compare(password, user.password.trim());
        
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid email or password" 
            });
        }

        // 🔑 ACCESS TOKEN (15 minutes)
        const accessToken = jwt.sign(
            { user_id: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
        );

        // 🔑 REFRESH TOKEN (7 days)
        const refreshToken = jwt.sign(
            { user_id: user.user_id, role: user.role }, 
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
        );

        // Set HttpOnly cookies
        const accessTokenMaxAge = 15 * 60 * 1000; // 15 minutes
        const refreshTokenMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: accessTokenMaxAge,
            path: '/'
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: refreshTokenMaxAge,
            path: '/'
        });

        // Safe user
        const safeUser = user.toJSON();
        delete safeUser.password;

        // Decoded tokens
        const accessDecoded = jwt.decode(accessToken);
        const refreshDecoded = jwt.decode(refreshToken);

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            accessToken,
            refreshToken, // ⚠️ give for localStorage 
            user: safeUser,
            expiresAt: accessDecoded.exp,
            refreshExpiresAt: refreshDecoded.exp
        });

    } catch (err) {
        console.error("Login error:", err.message);
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
};

// 🆕 REFRESH TOKEN ROUTE
const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ 
                success: false,
                message: "Refresh token required" 
            });
        }

        try {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

            // Generate new access token
            const newAccessToken = jwt.sign(
                { user_id: decoded.user_id, role: decoded.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
            );

            // Set new cookie
            res.cookie('accessToken', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                maxAge: 15 * 60 * 1000,
                path: '/'
            });

            const decoded2 = jwt.decode(newAccessToken);

            res.status(200).json({
                success: true,
                message: "Access token refreshed",
                accessToken: newAccessToken,
                expiresAt: decoded2.exp
            });

        } catch (jwtErr) {
            return res.status(401).json({ 
                success: false,
                message: "Refresh token expired or invalid" 
            });
        }

    } catch (err) {
        console.error("Refresh error:", err.message);
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
};

const logoutUser = (req, res) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/'
    });

    res.clearCookie('refreshToken', {
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

module.exports = { loginUser, refreshAccessToken, logoutUser };