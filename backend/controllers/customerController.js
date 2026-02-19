// const supabase = require('../config/supabaseClient');

// const createCustomer = async (req, res) => {
//     try {
//         const { type, saloon_name, owner_name, phone_number } = req.body;

        
//         if (!type || !owner_name || !phone_number) {
//             return res.status(400).json({ error: "Type, Owner Name, and Phone Number are required." });
//         }

//         const { data, error } = await supabase
//             .from('customers')
//             .insert([{ type, saloon_name, owner_name, phone_number }])
//             .select();

//         if (error) {
            
//             console.error("Supabase Error:", error);
//             return res.status(400).json({ error: error.message });
//         }

//         res.status(201).json({ message: "Customer added!", data });

//     } catch (err) {
        
//         console.error("Server Crash:", err.message);
//         res.status(500).json({ error: "Internal Server Error", details: err.message });
//     }
// };

// const getAllCustomers = async (req, res) => {
//     try {
//         const { data, error } = await supabase
//             .from('customers')
//             .select('*');

//         if (error) throw error;

//         res.status(200).json(data);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// module.exports = { createCustomer, getAllCustomers };