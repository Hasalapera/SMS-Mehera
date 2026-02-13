const supabase = require('../config/supabaseClient');
const bcrypt = require('bcryptjs'); 
const { sendWelcomeEmail } = require('../utils/emailSender'); 

const addUserByAdmin = async (req, res) => {
    try {
        const { full_name, email, role, status } = req.body;

        if (!full_name || !email || !role) {
            return res.status(400).json({ error: "Name, email, and roll are mandatory." });
        }

        
        const { count } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', role);
        const nextNumber = (count || 0) + 1;
        const defaultPassword = `${role}${nextNumber}@user`;

        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        
        const { data, error } = await supabase
            .from('users')
            .insert([{ 
                full_name, 
                email, 
                password: hashedPassword, 
                role, 
                status: status || 'active', 
                is_default_password: true 
            }])
            .select();

        if (error) return res.status(400).json({ error: error.message });

        
        await sendWelcomeEmail(email, full_name, defaultPassword, role);

        res.status(201).json({ 
            message: "User added successfully! Details sent by email.", 
            tempPassword: defaultPassword 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const resetToDefaultPassword = async (req, res) => {
    try {
        
        const { user_id, role, email, full_name, admin_id, admin_password } = req.body;

        if (!user_id || !role || !admin_id || !admin_password) {
            return res.status(400).json({ error: "Not all required data has been provided." });
        }

        
        const { data: admin, error: adminErr } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', admin_id)
            .single();

        if (adminErr || !admin) {
            return res.status(404).json({ message: "Unable to recognize Admin!" });
        }

        const isAdminPassMatch = await bcrypt.compare(admin_password, admin.password);
        if (!isAdminPassMatch) {
            return res.status(403).json({ message: "The admin password is incorrect. Cannot be reset!" });
        }

        
        const newDefault = `${role}reset@user`;
        const salt = await bcrypt.genSalt(10);
        const hashedResetPassword = await bcrypt.hash(newDefault, salt);

        
        const { error } = await supabase
            .from('users')
            .update({ 
                password: hashedResetPassword, 
                is_default_password: true 
            })
            .eq('user_id', user_id);

        if (error) throw error;

        
        await sendWelcomeEmail(email, full_name, newDefault, role);

        res.status(200).json({ 
            message: "Password reset successful and email sent to user!" 
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { user_id, new_password } = req.body;
        if (!user_id || !new_password) {
            return res.status(400).json({ error: "User ID සහ අලුත් Password එක අවශ්‍යයි." });
        }

        
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(new_password, salt);

        const { error } = await supabase
            .from('users')
            .update({ 
                password: hashedNewPassword, 
                is_default_password: false 
            })
            .eq('user_id', user_id);

        if (error) throw error;
        res.status(200).json({ message: "Password updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { addUserByAdmin, resetToDefaultPassword, updatePassword };

