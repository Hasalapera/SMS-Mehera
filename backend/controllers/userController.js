const { User, UserArea, Customer, sequelize } = require('../models');
const bcrypt = require('bcrypt');
const { sendWelcomeEmail } = require('../utils/emailSender');
const { encrypt, decrypt } = require('../utils/cryptoUtils');


const addUserByAdmin = async (req, res) => {
    console.log("--- Add User Process Started ---");
    try {
        const { name, email, role, dob, contact_no, nic_no, selectedDistricts } = req.body;

        if (!name || !email || !role) {
            return res.status(400).json({ message: "Name, email and role are required." });
        }

        if (role === 'sales_rep' && (!selectedDistricts || selectedDistricts.length === 0)) {
            return res.status(400).json({ message: "Sales rep must have at least one district." });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "A user with this email already exists." });
        }

        const transaction = await sequelize.transaction();

        try {
            const count = await User.count({ where: { role }, transaction });
            const nextNumber = count + 1;
            const defaultPassword = `${role}${nextNumber}@user`;

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(defaultPassword, salt);

            const user = await User.create({
                name,
                email,
                password: hashedPassword,
                role,
                dob,
                contact_no: encrypt(contact_no),
                nic_no,
                is_active: true,
                is_default_password: true,
                default_password: defaultPassword
            }, { transaction });

            if (role === 'sales_rep' && selectedDistricts?.length > 0) {
                const areaRecords = selectedDistricts.map(district => ({
                    user_id: user.user_id,
                    district_name: district
                }));
                await UserArea.bulkCreate(areaRecords, { transaction });
            }

            await transaction.commit();

            let emailSent = true;
            try {
                await sendWelcomeEmail(email, name, defaultPassword, role);
            } catch (mailErr) {
                emailSent = false;
                console.error("Welcome email failed:", mailErr);
            }

            return res.status(201).json({
                message: emailSent
                    ? "User and assigned areas added successfully!"
                    : "User created, but welcome email could not be sent.",
                userId: user.user_id
            });

        } catch (err) {
            await transaction.rollback();
            console.error("Add User Inner Error:", err);
            return res.status(500).json({ message: err.message || "Failed to add user." });
        }

    } catch (err) {
        console.error("Add User Error:", err);
        return res.status(500).json({ message: err.message || "Internal server error." });
    }
};

const updatePassword = async (req, res) => {
    // console.log("--- Update Password Process Started ---");
    try {
        // 1. Get user_id and new_password from request body
        const { user_id, new_password } = req.body;

        // 2. Find the user by user_id
        const user = await User.findByPk(user_id);
        
        // If user not found, return 404
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 3. Hash the new password before saving to the database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);

        // 4. Update the user's password and flag
        await user.update({
            password: hashedPassword,
            is_default_password: false // Set to false since it's no longer the default password
        });

        res.status(200).json({ message: "Password updated successfully" });

    } catch (err) {
        console.error("Update Password Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        // Fetch all users along with their assigned areas (if any), excluding passwords and including soft-deleted users
        const users = await User.findAll({
            include: [{
                model: UserArea,
                as: 'areas',
                attributes: ['district_name']
            }],
            attributes: { exclude: ['password'] },
            paranoid: false // Include soft-deleted users
        });

        const decryptedUsers = users.map(user => {
            const userData = user.toJSON();
            if (userData.contact_no) {
                userData.contact_no = decrypt(userData.contact_no); // Decrypt contact number before sending to frontend
            }
            return userData;
        });

        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            users: decryptedUsers
        });

    } catch (err) {
        console.error("Get Users Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

const softDeleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        await user.update({ is_active: false });

        // Soft delete using Sequelize (sets deleted_at)
        await user.destroy();

        res.status(200).json({ message: "User deleted successfully" });

    } catch (err) {
        console.error("Delete User Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

const restoreUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Find even soft-deleted users
        const user = await User.findByPk(id, { paranoid: false });
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Restore soft-deleted user
        await user.restore();

        // Reactivate the user by setting is_active to true
        await user.update({ is_active: true });

        res.status(200).json({ message: "User restored successfully" });

    } catch (err) {
        console.error("Restore User Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

const changePassword = async (req, res) => {
    try {
        // 1. Get user_id, old_password, and new_password from request body
        const userId = req.body.userId || req.body.user_id;
        const oldPassword = req.body.oldPassword || req.body.currentPassword;
        const newPassword = req.body.newPassword;

        // 2. Validate input
        if (!userId || !oldPassword || !newPassword) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // 3. Find the user by user_id
        const user = await User.findByPk(userId);
        
        // If user not found, return 404
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 4. Compare old password with the stored hashed password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        
        // If passwords don't match, return 401
        if (!isMatch) {
            return res.status(401).json({ error: "Current password is incorrect" });
        }

        // 5. Hash the new password before saving to the database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 6. Update the user's password and set is_default_password to false
        await user.update({
            password: hashedPassword,
            is_default_password: false
        });

        // 7. Return success response
        res.status(200).json({ message: "Password changed successfully" });

    } catch (err) {
        console.error("Change Password Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({
            where: { user_id: id },
            include: [{ model: UserArea, as: 'areas', attributes: ['district_name'] }],
            attributes: { exclude: ['password', 'default_password'] },
            paranoid: false // 👈 අයින් කරපු අයවත් පේන්න මේක ඕනේ
        });

        if (!user) return res.status(404).json({ error: "User not found" });

        const userData = user.toJSON();
        if (userData.contact_no) userData.contact_no = decrypt(userData.contact_no);
        
        res.status(200).json({ user: userData });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// 💡 2. අලුත් ඒරියා එකක් ඇඩ් කිරීම
const addUserArea = async (req, res) => {
  try {
    const { id } = req.params; // URL එකෙන් ID එක ගන්නවා (:id)
    const { district } = req.body; // Body එකෙන් district එක ගන්නවා

    const existing = await UserArea.findOne({ where: { user_id: id, district_name: district } });
    if (existing) return res.status(400).json({ error: "District already assigned" });

    await UserArea.create({ user_id: id, district_name: district });
    res.status(201).json({ message: "District added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeUserArea = async (req, res) => {
  // 💡 Transaction එකක් පාවිච්චි කරමු වැඩ දෙකම එකවර වෙන්න ඕන නිසා
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params; // සේල්ස් රෙප්ගේ ID එක
    const { district } = req.body; // අයින් කරන දිස්ත්‍රික්කය

    if (!district) {
      return res.status(400).json({ error: "District name is required" });
    }

    // 1. සේල්ස් රෙප්ගෙන් ඒ දිස්ත්‍රික්කය ඉවත් කරනවා
    await UserArea.destroy({
      where: { user_id: id, district_name: district },
      transaction
    });

    // 2. 🛡️ වැදගත්ම කොටස: 
    // මේ සේල්ස් රෙප්ට අයිති, මේ දිස්ත්‍රික්කයේ ඉන්න කස්ටමර්ස්ලාව නිදහස් කරනවා (Unassign)
    // මෙතනදී කස්ටමර්ගේ දිස්ත්‍රික්කය වෙනස් වෙන්නේ නැහැ!
    await Customer.update(
      { sales_rep_id: null }, 
      { 
        where: { 
          sales_rep_id: id, 
          district: district 
        },
        transaction 
      }
    );

    await transaction.commit();
    res.status(200).json({ 
      message: `District ${district} removed. Customers are now unassigned and ready for reassignment.` 
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Remove Area Error:", err.message);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.user_id || req.body.user_id;
        if(!userId) return res.status(400).json({ error: "User ID is required" });

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const updateData = {};
        if (req.body.contact_no) {
            updateData.contact_no = encrypt(req.body.contact_no); // ✅ Encrypt කරනවා
        }
        
        const incomingName = req.body.name || req.body.full_name;
        if (incomingName && incomingName.trim() !== "") {
            updateData.name = incomingName.trim();
        }

        if (req.body.dob && req.body.dob !== "") updateData.dob = req.body.dob;
        if (req.body.nic_no) updateData.nic_no = req.body.nic_no;
        
        if (req.file) {
            updateData.profile_image = req.file.path || req.file.secure_url;
        }

        if (Object.keys(updateData).length > 0) {
            await user.update(updateData);
        }

        const updatedUserInstance = await User.findByPk(userId, {
            attributes: { exclude: ['password', 'default_password'] },
        });

        // ✅ මචං මෙතන තමයි 'userData' define කළේ. දැන් error එක එන්නේ නැහැ.
        const userData = updatedUserInstance.toJSON(); 
        if (userData.contact_no) {
            userData.contact_no = decrypt(userData.contact_no);
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: userData 
        });

    } catch (err) {
        console.error("Update Error:", err.stack);
        res.status(500).json({ error: err.message });
    }
};

const resetToDefaultPassword = async (req, res) => {
    try {
        // 1. Get user_id from request body
        const { user_id, adminPassword } = req.body;
        const loggedInAdminId = req.user?.user_id;

        const adminUser = await User.findByPk(loggedInAdminId);
        if (!adminUser) return res.status(404).json({ error: "Admin session not found." });

        const isMatch = await bcrypt.compare(adminPassword, adminUser.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Authentication failed: Invalid admin password." });
        }

        // 2. Find the user by user_id
        const user = await User.findByPk(user_id);
        
        // If user not found, return 404
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 3. Hash the default password before saving to the database
        const defaultPassword = user.default_password;
        // 4. Update the user's password and set is_default_password to true
        const salt = await bcrypt.genSalt(10);
        // 4. Update the user's password and set is_default_password to true
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        // 5. Update the user's password and set is_default_password to true
        await user.update({
            password: hashedPassword,
            is_default_password: true
        });

        // send email to user with the default password
        try {
            await sendWelcomeEmail(user.email, user.name, defaultPassword, user.role);
        } catch (mailErr) {
            console.error("Email Sending Error:", mailErr.message);
            // Email එක යැවුණේ නැතත් password එක reset වුණු නිසා success response එකක් යවනවා 
            // හැබැයි warning එකක් එක්ක
            return res.status(200).json({ 
                message: "Password reset in DB, but failed to send email.",
                warning: "Email not sent."
            });
        }

        // 6. Return success response
        res.status(200).json({ message: "Password reset to default" });

    } catch (err) {
        console.error("Reset Password Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

const verifySession = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.user_id, {
            attributes: { exclude: ['password'] }
        });
        
        if (!user || !user.is_active || user.deleted_at) {
            return res.status(401).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error("Verify Session Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

const getSalesReps = async (req, res) => {
    try {
        const salesReps = await User.findAll({
            where: { role: 'sales_rep', is_active: true },
            attributes: ['user_id', 'name', 'email'],
            include: {
                model: UserArea,
                as: 'areas',
                attributes: ['district_name']
            }
        });
        res.status(200).json({ users: salesReps });
    } catch (err) {
        console.error("Get Sales Reps Error:", err.message);
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
    changePassword,
    getUserProfile,
    updateProfile,
    getSalesReps,
    verifySession,
    addUserArea,
    removeUserArea
};
