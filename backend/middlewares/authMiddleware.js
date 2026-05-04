require('dotenv').config();
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Authorization header එකෙන් token ගන්න
    const authHeader = req.headers['authorization'];
    const tokenFromHeader = authHeader && authHeader.split(' ')[1];
    
    // Cookie එකෙන් token ගන්න
    const tokenFromCookie = req.cookies?.accessToken;
    
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: "No token, authorization denied!",
            code: 'NO_TOKEN'
        });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: "Access token expired",
                code: 'TOKEN_EXPIRED'
            });
        }
        return res.status(401).json({ 
            success: false,
            message: "Token is not valid!",
            code: 'INVALID_TOKEN'
        });
    }
};

const isAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'admin') {
            next();
        } else {
            return res.status(403).json({ 
                success: false,
                message: "Access denied, Admins only!" 
            });
        }
    });
};

const isAdminOrManager = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'admin' || req.user.role === 'manager') {
            next();
        } else {
            return res.status(403).json({ 
                success: false,
                message: "Access denied, Admins or Managers only!" 
            });
        }
    });
};

module.exports = { verifyToken, isAdmin, isAdminOrManager };