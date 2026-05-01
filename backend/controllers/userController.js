const { User, UserArea, sequelize } = require('../models');
const bcrypt = require('bcrypt');
const { sendWelcomeEmail } = require('../utils/emailSender');


const addUserByAdmin = async (req, res) => {
    console.log("--- Add User Process Started ---");
    try {
        const { name, email, role, dob, contact_no, nic_no, selectedDistricts } = req.body;

        // Start a transaction
        const transaction = await sequelize.transaction();

        try {
            // Get count of users with this role
            const count = await User.count({ 
                where: { role },
                transaction 
            });
            
            const nextNumber = count + 1;
            const defaultPassword = `${role}${nextNumber}@user`;

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(defaultPassword, salt);

            // Create user
            const user = await User.create({
                name,
                email,
                password: hashedPassword,
                role,
                dob,
                contact_no,
                nic_no,
                is_active: true,
                is_default_password: true,
                default_password: defaultPassword
            }, { transaction });

            // Assign districts if sales_rep
            if (role === 'sales_rep' && selectedDistricts && selectedDistricts.length > 0) {
                const areaRecords = selectedDistricts.map(district => ({
                    user_id: user.user_id,
                    district_name: district
                }));
                await UserArea.bulkCreate(areaRecords, { transaction });
            }

            // Send welcome email
            await sendWelcomeEmail(email, name, defaultPassword, role);

            // Commit transaction
            await transaction.commit();

            res.status(201).json({
                message: "User and assigned areas added successfully!",
                userId: user.user_id
            });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (err) {
        console.error("Add User Error:", err.message);
        res.status(500).json({ error: err.message });
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

        res.status(200).json({
            message: "Users retrieved successfully",
            users
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
        // Get user ID from request parameters
        const { id } = req.params;
        // Validate that the ID is a valid UUID format to prevent unnecessary database queries
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        // If the ID is not valid, return a 400 Bad Request response
        if (!id || !uuidRegex.test(id)) {
            return res.status(400).json({ error: "Invalid user id format" });
        }

        // Fetch user profile along with assigned areas, excluding password fields
        const baseAttributes = { exclude: ['password', 'default_password'] };

        // Use paranoid: false to include soft-deleted users in the search, so that we can return a proper message if the user is deleted
        const user = await User.findOne({
            where: { user_id: id },
            include: [{
                model: UserArea,
                as: 'areas',
                attributes: ['district_name']
            }],
            attributes: baseAttributes
        });

        // If user not found, return 404
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Convert user instance to JSON and format districts for frontend
        const userData = user.toJSON();
        // Create a districts array based on the associated areas for easier frontend consumption
        userData.districts = userData.areas ? userData.areas.map(a => a.district_name) : [];

        res.status(200).json({
            message: "User profile retrieved",
            user: userData
        });

    } catch (err) {
        console.error("Sequelize Profile Fetch Error:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.user_id || req.body.user_id;
        if(!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const user = await User.findByPk(userId);
        
        if (!user) return res.status(404).json({ error: "User not found" });

        const updateData = {};
        
        // if name is provided and not empty, then add to updateData, otherwise ignore it (so it won't overwrite existing name with null or empty)
        const incomingName = req.body.name || req.body.full_name;
        if (incomingName && incomingName.trim() !== "") {
            updateData.name = incomingName.trim();
        }

        if (req.body.contact_no) updateData.contact_no = req.body.contact_no;
        if (req.body.dob && req.body.dob !== "") updateData.dob = req.body.dob;
        if (req.body.nic_no) updateData.nic_no = req.body.nic_no;
        
        if (req.file) {
            updateData.profile_image = req.file.path || req.file.secure_url;
        }

        // if there is data in updateData, then only update, otherwise skip the update to avoid overwriting existing data with null or empty values
        if (Object.keys(updateData).length > 0) {
            await user.update(updateData);
        }

        // Fetch the updated user profile to return in the response, excluding password fields
        const updatedUser = await User.findByPk(userId, {
            attributes: { exclude: ['password', 'default_password'] },
        });

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (err) {
        console.error("Update Error:", err.stack);
        res.status(500).json({ error: err.message });
    }
};

const resetToDefaultPassword = async (req, res) => {
    try {
        // 1. Get user_id from request body
        const { user_id } = req.body;

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

        // 6. Return success response
        res.status(200).json({ message: "Password reset to default" });

    } catch (err) {
        console.error("Reset Password Error:", err.message);
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
    updateProfile
};
