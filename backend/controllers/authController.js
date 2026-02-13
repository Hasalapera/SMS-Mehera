const supabase = require('../config/supabaseClient');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // 1. Bcrypt මැෂින් එක ගෙන්නගන්න

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Email එකෙන් පරිශීලකයාව හොයමු
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({ message: "Email එක හෝ යතුර වැරදියි!" });
        }


        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Email එක හෝ යතුර වැරදියි!" });
        }

        
        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            process.env.JWT_SECRET || 'mehera_secret_key', 
            { expiresIn: '1d' }
        );

        
        if (user.is_default_password === true) {
            return res.status(200).json({
                message: "The temporary key must be changed!",
                mustChangePassword: true,
                redirectPath: "/change-password",
                token: token,
                user_id: user.user_id 
            });
        }

        
        let redirectPath = '/dashboard';
        if (user.role === 'admin') redirectPath = '/admin-dashboard';
        else if (user.role === 'manager') redirectPath = '/manager-dashboard';
        else if (user.role === 'sales_rep') redirectPath = '/sales-rep-dashboard';
        else if (user.role === 'online_store_keeper') redirectPath = '/store-keeper-dashboard';

        res.status(200).json({
            message: "Logged In successfully",
            token,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                role: user.role,
                redirectPath
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { loginUser };