const pool = require('../db/db');
const bcrypt = require('bcryptjs');
const { sendWelcomeEmail } = require('../utils/emailSender');

const addUserByAdmin = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { name, email, role, dob, contact_no, nic_no, selectedDistricts } = req.body;

        await client.query('BEGIN'); 

        const countRes = await client.query('SELECT COUNT(*) FROM users WHERE role = $1', [role]);
        const nextNumber = parseInt(countRes.rows[0].count) + 1;
        const defaultPassword = `${role}${nextNumber}@user`;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        const userResult = await client.query(
            `INSERT INTO users (
                name, email, password, role, dob, contact_no, 
                nic_no, is_active, is_default_password, default_password
            ) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING user_id`,
            [
                name, email, hashedPassword, role, dob, contact_no, 
                nic_no, true, true, defaultPassword 
            ]
        );

        const userId = userResult.rows[0].user_id;

        if (role === 'sales_rep' && selectedDistricts && selectedDistricts.length > 0) {
            const areaQuery = 'INSERT INTO user_areas (user_id, district_name) VALUES ($1, $2)';
            for (const district of selectedDistricts) {
                await client.query(areaQuery, [userId, district]);
            }
        }

        await sendWelcomeEmail(email, name, defaultPassword, role);
        
        await client.query('COMMIT'); 

        res.status(201).json({
            message: "User and assigned areas added successfully!",
            userId: userId
        });

    } catch (err) {
        await client.query('ROLLBACK'); 
        console.error("Add User Backend Error:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release(); 
    }
};

const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const softDeleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'UPDATE users SET deleted_at = CURRENT_TIMESTAMP, is_active = false WHERE user_id = $1 RETURNING *',
            [id]
        );
        if (result.rowCount === 0) return res.status(404).json({ message: "User not found!" });
        res.status(200).json({ message: "User archived successfully!", user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const restoreUser = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query(
            'UPDATE users SET deleted_at = NULL, is_active = true WHERE user_id = $1',
            [id]
        );
        res.status(200).json({ message: "User account restored successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const resetToDefaultPassword = async (req, res) => {
    try {
        const { user_id, role, email, name } = req.body;
        const newDefault = `${role}reset@user`;
        const salt = await bcrypt.genSalt(10);
        const hashedResetPassword = await bcrypt.hash(newDefault, salt);
        await pool.query('UPDATE users SET password = $1, is_default_password = true WHERE user_id = $2', [hashedResetPassword, user_id]);
        await sendWelcomeEmail(email, name, newDefault, role);
        res.status(200).json({ message: "Password reset successful!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { user_id, new_password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);
        await pool.query('UPDATE users SET password = $1, is_default_password = false WHERE user_id = $2', [hashedPassword, user_id]);
        res.status(200).json({ message: "Password updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { user_id, full_name, contact_no, dob, nic_no } = req.body;
        
        let imageUrl = req.body.picture_url; 
        if (req.file) {
            imageUrl = req.file.path; 
        }

        const result = await pool.query(
            `UPDATE users 
             SET name = $1, contact_no = $2, dob = $3, nic_no = $4, picture_url = $5 
             WHERE user_id = $6 RETURNING *`,
            [full_name, contact_no, dob, nic_no, imageUrl, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found in registry!" });
        }

        const updatedUser = result.rows[0];

        res.status(200).json({
            message: "Profile synchronized successfully",
            user: {
                user_id: updatedUser.user_id,
                full_name: updatedUser.name, 
                email: updatedUser.email,
                role: updatedUser.role,
                contact_no: updatedUser.contact_no,
                nic_no: updatedUser.nic_no,
                dob: updatedUser.dob,
                picture_url: updatedUser.picture_url,
                is_active: updatedUser.is_active,
                created_at: updatedUser.created_at
            }
        });

    } catch (err) {
        console.error("Update Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

const changePassword = async (req, res) => {
  const { user_id, currentPassword, newPassword } = req.body;
  
  try {
    // 1. පවතින hash එක ලබාගැනීම
    const result = await pool.query('SELECT password FROM users WHERE user_id = $1', [user_id]);
    const user = result.rows[0];

    // 2. දැනට තියෙන password එක පරීක්ෂා කිරීම
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Access Denied: Current security key is incorrect." });
    }

    // 3. නව password එක hash කර Update කිරීම
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password = $1 WHERE user_id = $2', [hashedPass, user_id]);

    res.status(200).json({ message: "Success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { 
    addUserByAdmin, 
    updatePassword, 
    resetToDefaultPassword, 
    getAllUsers, 
    softDeleteUser,
    restoreUser,
    updateProfile,
    changePassword 
};