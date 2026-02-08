const supabase = require('../config/supabaseClient');
const bcrypt = require('bcryptjs'); // Bcrypt ගෙන්නගන්න
const { sendWelcomeEmail } = require('../utils/emailSender'); // ඊමේල් යවන මැෂින් එක

const addUserByAdmin = async (req, res) => {
    try {
        const { full_name, email, role, status } = req.body;

        if (!full_name || !email || !role) {
            return res.status(400).json({ error: "නම, ඊමේල් සහ රෝල් එක අනිවාර්යයි." });
        }

        // 1. කලින් හිටපු ගණන බලා අංකය තීරණය කිරීම
        const { count } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', role);
        const nextNumber = (count || 0) + 1;
        const defaultPassword = `${role}${nextNumber}@user`;

        // 2. *** රහස් කේතයක් (Hash) බවට පත් කිරීම ***
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        // 3. Database එකට දත්ත ඇතුළත් කිරීම (Hashed Password එක සේව් වේ)
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

        // 4. *** පරිශීලකයාට ඊමේල් එකක් යැවීම ***
        await sendWelcomeEmail(email, full_name, defaultPassword, role);

        res.status(201).json({ 
            message: "පරිශීලකයා සාර්ථකව එක් කළා! විස්තර ඊමේල් මගින් යවා ඇත.", 
            tempPassword: defaultPassword 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const resetToDefaultPassword = async (req, res) => {
    try {
        // 1. Admin ගේ විස්තර සහ අදාළ පරිශීලකයාගේ විස්තර Body එකෙන් ගන්නවා
        const { user_id, role, email, full_name, admin_id, admin_password } = req.body;

        if (!user_id || !role || !admin_id || !admin_password) {
            return res.status(400).json({ error: "අවශ්‍ය සියලුම දත්ත ලබා දී නැත." });
        }

        // 2. මුලින්ම Admin ගේ Password එක පරීක්ෂා කරමු
        const { data: admin, error: adminErr } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', admin_id)
            .single();

        if (adminErr || !admin) {
            return res.status(404).json({ message: "Admin හඳුනාගත නොහැක!" });
        }

        const isAdminPassMatch = await bcrypt.compare(admin_password, admin.password);
        if (!isAdminPassMatch) {
            return res.status(403).json({ message: "Admin මුරපදය වැරදියි. Reset කළ නොහැක!" });
        }

        // 3. දැන් අදාළ පරිශීලකයාට අලුත් Reset Password එකක් හදමු
        const newDefault = `${role}reset@user`;
        const salt = await bcrypt.genSalt(10);
        const hashedResetPassword = await bcrypt.hash(newDefault, salt);

        // 4. Database එකේ Update කරමු
        const { error } = await supabase
            .from('users')
            .update({ 
                password: hashedResetPassword, 
                is_default_password: true 
            })
            .eq('user_id', user_id);

        if (error) throw error;

        // 5. පරිශීලකයාට අලුත් Password එක සමඟ Email එක යැවීම
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

        // 1. පරිශීලකයා දුන් අලුත් යතුර Hash කිරීම
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(new_password, salt);

        const { error } = await supabase
            .from('users')
            .update({ 
                password: hashedNewPassword, 
                is_default_password: false // දැන් මේක false වෙනවා
            })
            .eq('user_id', user_id);

        if (error) throw error;
        res.status(200).json({ message: "මුරපදය සාර්ථකව යාවත්කාලීන කළා!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { addUserByAdmin, resetToDefaultPassword, updatePassword };

