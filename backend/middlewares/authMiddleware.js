

const isAdmin = (req, res, next) => {
    const { admin_key } = req.body; 

    if (admin_key === 'admin') {
        next(); 
    } else {
        res.status(403).json({ message: "Access denied. Admins only!" });
    }
};

module.exports = { isAdmin };