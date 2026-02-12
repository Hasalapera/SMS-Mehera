// const isAdmin = (req, res, next) => {
//     const { role } = req.body; 

//     if (role && role === 'admin') {
//         next(); 
//     } else {
//         res.status(403).json({ message: "Access denied. Admins only!" });
//     }
// };

// module.exports = { isAdmin };

const isAdmin = (req, res, next) => {
    const { admin_key } = req.body; // Postman එකෙන් එවන key එක මෙතැනට එනවා

    if (admin_key === 'admin') {
        next(); // Key එක හරි නම් විතරක් ඉදිරියට යන්න දෙනවා
    } else {
        res.status(403).json({ message: "Access denied. Admins only!" });
    }
};

module.exports = { isAdmin };