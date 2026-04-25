require('dotenv').config();
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    // The token is usually in the format
    const token = authHeader && authHeader.split(' ')[1];   

    // If no token, return 401
    if(!token) return res.status(401).json({message: "No token, authorization denied!"});
    
    try {
        // Verify token and attach user info to request object
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach user info to request object for use in other middlewares or route handlers
        req.user = decoded;
        // If token is valid, proceed to the next middleware or route handler
        next();
    } catch(err) {
        // If token is invalid or expired, return 401
        console.error("JWT Verification Error:", err.message);
        res.status(401).json({message: "Token is not valid!"});
    }
}

const isAdmin = (req, res, next) => {
    // check the token first, then check if the user is admin
    verifyToken(req, res, () => {
        if (req.user.role === 'admin') {
            next(); // if user is admin, proceed to the next middleware or route handler
        } else {
            return res.status(403).json({ message: "Access denied, Admins only!" });
        }
    });
};

// 3. check if user is admin or manager
const isAdminOrManager = (req, res, next) => {
    // check the token first, then check if the user is admin or manager
    verifyToken(req, res, () => {
        // If user role is admin or manager, proceed to the next middleware or route handler
        if (req.user.role === 'admin' || req.user.role === 'manager') {
            next();
        } else {
            return res.status(403).json({ message: "Access denied, Admins or Managers only!" });
        }
    });
};

module.exports = { isAdmin, isAdminOrManager, verifyToken };