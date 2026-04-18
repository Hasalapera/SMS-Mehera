
const { Customer, CustomerNote } = require('../models'); // 👈 Sequelize Models එක ගත්තා
const { Op } = require('sequelize'); // 👈 Sequelize Operators


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

// Get single customer with notes
const getCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await Customer.findByPk(id, {
            include: [{ model: CustomerNote, as: 'notes', separate: true, order: [['created_at', 'DESC']] }]
        });

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.status(200).json({
            message: 'Customer retrieved successfully',
            customer
        });
    } catch (err) {
        console.error('Get Customer Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// Add note to customer
const addNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { note_text, tag } = req.body;
        const user = req.user; // From auth middleware

        if (!note_text || !note_text.trim()) {
            return res.status(400).json({ error: 'Note text is required' });
        }

        const customer = await Customer.findByPk(id);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const note = await CustomerNote.create({
            customer_id: id,
            note_text: note_text.trim(),
            tag: tag || 'general',
            added_by: user?.full_name || 'System',
            role: user?.role || 'system'
        });

        res.status(201).json({
            message: 'Note added successfully',
            note
        });
    } catch (err) {
        console.error('Add Note Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// Delete note from customer
const deleteNote = async (req, res) => {
    try {
        const { id, noteId } = req.params;

        const note = await CustomerNote.findByPk(noteId);
        if (!note || note.customer_id !== id) {
            return res.status(404).json({ error: 'Note not found' });
        }

        await note.destroy();
        res.status(200).json({ message: 'Note deleted successfully' });
    } catch (err) {
        console.error('Delete Note Error:', err.message);
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

// Customer Search Function
const searchCustomers = async (req, res) => {
    try {
        const { q } = req.query; // Frontend එකෙන් එන සර්ච් පදය

        if (!q) {
            return res.status(200).json([]);
        }

        const customers = await Customer.findAll({
            where: {
                [Op.or]: [
                    { saloon_name: { [Op.iLike]: `%${q}%` } }, // Saloon නම අනුව
                    { owner_name: { [Op.iLike]: `%${q}%` } },  // අයිතිකරුගේ නම අනුව
                    { phone1: { [Op.iLike]: `%${q}%` } }       // ෆෝන් නම්බර් එක අනුව
                ]
            },
            limit: 10 // රිසල්ට් 10කට සීමා කිරීම (Performance සඳහා)
        });

        res.status(200).json(customers);
    } catch (err) {
        console.error("Search Error:", err.message);
        res.status(500).json({ error: "සෙවීමේදී දෝෂයක් ඇති විය" });
    }
};

module.exports = { createCustomer, getAllCustomers, getCustomer, addNote, deleteNote, getCustomerCount, searchCustomers };

