const Customer = require('../models/Customer'); // 👈 Sequelize Model එක ගත්තා

const createCustomer = async (req, res) => {
    try {
        const { type, saloon_name, owner_name, phone1, phone2, lane1, lane2, district, additional_note, customer_display_id } = req.body;

        if (!saloon_name || !owner_name || !phone1 || !lane1 || !district) {
            return res.status(400).json({ error: "Required fields are missing." });
        }

        const newCustomer = await Customer.create({
            type,
            saloon_name,
            owner_name,
            phone1,
            phone2,
            lane1,
            lane2,
            district,
            additional_note,
            customer_display_id
        });

        res.status(201).json({ message: "Customer added successfully!", data: newCustomer });
    } catch (err) {
        console.error("Controller Error:", err.message);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
};

const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.findAll();
        res.status(200).json(customers);
    } catch (err) {
        console.error("Controller Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

// Customer Count එක ගන්න (Frontend එකේ ID Reference එකට ඕනේ නිසා)
const getCustomerCount = async (req, res) => {
    try {
        const count = await Customer.count();
        res.status(200).json({ count });
    } catch (err) {
        console.error("Count Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createCustomer, getAllCustomers, getCustomerCount };