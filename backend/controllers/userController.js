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
    try {
        // 1. old_password එක මෙතනින් අයින් කළා
        const { user_id, new_password } = req.body;

        const user = await User.findByPk(user_id);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 🛡️ 2. පරණ පාස්වර්ඩ් එක චෙක් කරන කොටස (bcrypt.compare) සම්පූර්ණයෙන්ම අයින් කළා.
        // මොකද යූසර් දැනටමත් තාවකාලික පාස්වර්ඩ් එකෙන් ලොග් වෙලා ඉන්නේ.

        // 3. අලුත් පාස්වර්ඩ් එක Hash කිරීම
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);

        // 4. යූසර්ගේ පාස්වර්ඩ් එක අප්ඩේට් කරලා flag එක වෙනස් කිරීම
        await user.update({
            password: hashedPassword,
            is_default_password: false // මින් පස්සේ ආයේ මේ පේජ් එකට එන්නේ නැහැ
        });

        res.status(200).json({ message: "Password updated successfully" });

    } catch (err) {
        console.error("Update Password Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
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
        const userId = req.body.userId || req.body.user_id;
        const oldPassword = req.body.oldPassword || req.body.currentPassword;
        const newPassword = req.body.newPassword;

        if (!userId || !oldPassword || !newPassword) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const user = await User.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ error: "Current password is incorrect" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await user.update({
            password: hashedPassword,
            is_default_password: false
        });

        res.status(200).json({ message: "Password changed successfully" });

    } catch (err) {
        console.error("Change Password Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        if (!id || !uuidRegex.test(id)) {
            return res.status(400).json({ error: "Invalid user id format" });
        }

        // define attributes here to avoid 'baseAttributes is not defined' error
        const baseAttributes = { exclude: ['password', 'default_password'] };

        const user = await User.findOne({
            where: { user_id: id },
            include: [{
                model: UserArea,
                as: 'areas',
                attributes: ['district_name']
            }],
            attributes: baseAttributes
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const userData = user.toJSON();
        // Frontend එකේ districts map කරන නිසා මෙතනින් ඒක සකස් කරලා යවමු
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
        
        // 🛡️ වැදගත්ම කොටස: නම තිබුණොත් විතරක් updateData එකට දාන්න
        // frontend එකෙන් 'name' ලෙස එවන නිසා ඒක මුලින්ම බලන්න
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

        // 🚀 UpdateData හි දත්ත තිබේ නම් පමණක් update කරන්න
        if (Object.keys(updateData).length > 0) {
            await user.update(updateData);
        }

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
        const { user_id } = req.body;

        const user = await User.findByPk(user_id);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const defaultPassword = user.default_password;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        await user.update({
            password: hashedPassword,
            is_default_password: true
        });

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
