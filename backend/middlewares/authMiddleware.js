require('dotenv').config();
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];   

    if(!token) return res.status(401).json({message: "No token, authorization denied!"});
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch(err) {
        res.status(401).json({message: "Token is not valid!"});
    }
}

// const isAdmin = (req, res, next) => {
//     const authHeader = req.headers['authorization'];
//     console.log("Authorization Header Received:", authHeader);

//     const token = authHeader && authHeader.split(' ')[1];
//     console.log("Extracted Token:", token);

//     if(!token){
//         return res.status(401).json({message: "No token, authorisation denied!"});
//     }

//     try{
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         if(decoded.role !== 'admin'){
//             return res.status(403).json({message: "Access denied, Admins only!"});
//         }

//         req.user = decoded;

//         next();
//     }catch(err){
//         console.error("JWT Verification Error:", err.message);
//         res.status(401).json({message: "Token is not valid!"});
//     }
// };

// const isAdminOrManager = (req, res, next) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     if(!token) return res.status(401).json({message: "No token, authorization denied!"});

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
//         if(decoded.role === 'admin' || decoded.role === 'manager'){
//             req.user = decoded;
//             next();
//         } else {
//             return res.status(403).json({message: "Access denied, Admins or Managers only!"});
//         }
//     } catch(err) {
//         res.status(401).json({message: "Token is not valid!"});
//     }
// };

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
    verifyToken(req, res, () => {
        if (req.user.role === 'admin' || req.user.role === 'manager') {
            next();
        } else {
            return res.status(403).json({ message: "Access denied, Admins or Managers only!" });
        }
    });
};

module.exports = { isAdmin, isAdminOrManager, verifyToken };