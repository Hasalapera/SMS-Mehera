
const { Customer, CustomerNote, User, UserArea, sequelize } = require('../models'); // Take Sequelize models
const { Op } = require('sequelize'); // 👈 Sequelize Operators
const { encrypt, decrypt } = require('../utils/cryptoUtils'); // For encrypting/decrypting contact numbers


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
            phone1: encrypt(phone1), // Encrypt phone number before saving to DB
            phone2: phone2 ? encrypt(phone2) : null, // Encrypt if provided
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

        const decryptedCustomers = customers.map(c => {
            const customer = c.toJSON();
            // Optional: check if phone exists before decrypting
            customer.phone1 = customer.phone1 ? decrypt(customer.phone1) : null;
            customer.phone2 = customer.phone2 ? decrypt(customer.phone2) : null;
            return customer;
        });

        res.status(200).json(decryptedCustomers);
    } catch (err) {
        console.error("Controller Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

// Get single customer with notes
const getCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const customerData = await Customer.findByPk(id, {
            include: [{ model: CustomerNote, as: 'notes', separate: true, order: [['created_at', 'DESC']] }]
        });

        // make the cutsomer deatils write
        if (!customerData) { 
            return res.status(404).json({ error: 'Customer not found' });
        }

        const customer = customerData.toJSON();

        // Decrypt phone numbers
        customer.phone1 = decrypt(customer.phone1);
        customer.phone2 = decrypt(customer.phone2);

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

// get Customer Count Function
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
        const { q } = req.query; // the words come from the search bar

        if (!q) {
            return res.status(200).json([]);
        }

        const customers = await Customer.findAll({
            where: {
                [Op.or]: [
                    { saloon_name: { [Op.iLike]: `%${q}%` } }, // Saloon name search
                    { owner_name: { [Op.iLike]: `%${q}%` } },  // Owner name search
                    { phone1: { [Op.iLike]: `%${q}%` } }       // Phone number search
                ]
            },
            limit: 10 // results limit up to 10 shows
        });

        res.status(200).json(customers);
    } catch (err) {
        console.error("Search Error:", err.message);
        res.status(500).json({ error: "An error occurred while searching." });
    }
};

//assign sales rep to customer
const assignSalesRep = async (req, res) => {
    try {
        const { customer_id, sales_rep_id } = req.body; // customer_id එක දැන් Array එකක් වෙන්න පුළුවන්

        // 1. one customer or list convert into array
        const customerIds = Array.isArray(customer_id) ? customer_id : [customer_id];

        if (!customerIds.length || !sales_rep_id) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        // 2. get sales rep and thier district details
        const salesRep = await User.findByPk(sales_rep_id, {
            include: [{ model: UserArea, as: 'areas' }]
        });

        if (!salesRep || salesRep.role !== 'sales_rep') {
            return res.status(400).json({ error: "Invalid Sales Representative selection" });
        }

        const allowedDistricts = salesRep.areas.map(area => area.district_name);

        // 3. check that customer valid to that sales rep
        const customersToAssign = await Customer.findAll({
            where: { customer_id: { [Op.in]: customerIds } }
        });

        const invalidCustomers = customersToAssign.filter(c => !allowedDistricts.includes(c.district));

        if (invalidCustomers.length > 0) {
            const invalidNames = invalidCustomers.map(c => c.saloon_name).join(', ');
            return res.status(403).json({ 
                error: `Validation Failed: ${salesRep.name} cannot handle these districts: ${invalidNames}` 
            });
        }

        // 4. if all details ok then update (Bulk Update)
        await Customer.update(
            { sales_rep_id: sales_rep_id },
            { where: { customer_id: { [Op.in]: customerIds } } }
        );

        res.status(200).json({ 
            message: `Successfully assigned ${customerIds.length} customers to ${salesRep.name}!` 
        });

    } catch (err) {
        console.error("Assign Error:", err.message);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
};

// 2. Bulk Reassign (With District Validation for each customer)
const reassignCustomers = async (req, res) => {
    const { fromRepId, toRepId } = req.body;
    const transaction = await sequelize.transaction();//rool back details if there is error

    try {
        // get districts for the new sales rep
        const toRep = await User.findByPk(toRepId, {
            include: [{ model: UserArea, as: 'areas' }],
            transaction
        });

        if (!toRep) throw new Error("Target Sales Rep not found");
        const allowedDistricts = toRep.areas.map(area => area.district_name);

        // Select only the customers from the old rep who are 
        // located in the districts that the new rep is allowed to manage.

        const [updatedCount] = await Customer.update(
            { sales_rep_id: toRepId },
            { 
                where: { 
                    sales_rep_id: fromRepId,
                    district: { [Op.in]: allowedDistricts } // if district is only match
                },
                transaction 
            }
        );

        await transaction.commit();
        res.status(200).json({ 
            message: `Successfully reassigned ${updatedCount} customers to ${toRep.name}.`,
            note: "Customers in other districts were not moved."
        });
    } catch (err) {
        await transaction.rollback();
        res.status(500).json({ error: err.message });
    }
};

// 3. Get Customers By Rep
const getCustomersByRep = async (req, res) => {
    try {
        const { repId } = req.params;
        const customers = await Customer.findAll({ where: { sales_rep_id: repId } });

        const decryptedCustomers = customers.map(c => {
            const customer = c.toJSON();
            customer.phone1 = customer.phone1 ? decrypt(customer.phone1) : null;
            customer.phone2 = customer.phone2 ? decrypt(customer.phone2) : null;
            return customer;
        });

        res.status(200).json({ customers: decryptedCustomers });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Get Eligible Customers for a Rep
// (Take people who are in a rep's district and haven't been assigned to anyone yet.)
const getEligibleCustomersForRep = async (req, res) => {
    try {
        const { repId } = req.params;
        const rep = await User.findByPk(repId, { include: [{ model: UserArea, as: 'areas' }] });
        
        if (!rep) return res.status(404).json({ error: "Rep not found" });
        const allowedDistricts = rep.areas.map(a => a.district_name);

        const customers = await Customer.findAll({
            where: {
                sales_rep_id: null,
                district: { [Op.in]: allowedDistricts }
            }
        });

        res.status(200).json({ customers });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getUnassignedCustomers = async (req, res) => {
    try {
        const customers = await Customer.findAll({
            where: { sales_rep_id: null }
        });

        const decryptedCustomers = customers.map(c => {
            const customer = c.toJSON();
            customer.phone1 = customer.phone1 ? decrypt(customer.phone1) : null;
            customer.phone2 = customer.phone2 ? decrypt(customer.phone2) : null;
            return customer;
        });

        res.status(200).json({ customers: decryptedCustomers });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- get soft deleted sales reps for potential reassignment ---
const getDeletedSalesReps = async (req, res) => {
    try {
        const deletedReps = await User.findAll({
            where: { 
                role: 'sales_rep',
                deleted_at: { [Op.ne]: null } 
            },
            attributes: ['user_id', 'name', 'email', 'deleted_at'],
            paranoid: false,
            include: [{
                model: Customer,
                as: 'assignedCustomers', // given name for model association
                attributes: [], // no need customer data here, just want to check if there are assigned customers
                required: true  // INNER JOIN: only get sales reps who have assigned customers (even if they are deleted)
            }],
            group: ['User.user_id'] // group by user_id to avoid duplicates due to join with customers
        });
        res.status(200).json(deletedReps);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- get replacement candidates for a deleted sales rep ---
const getReplacementCandidates = async (req, res) => {
    try {
        const { deletedRepId } = req.params;

        // get the districts of the deleted sales rep
        const deletedRepAreas = await UserArea.findAll({ 
            where: { user_id: deletedRepId } 
        });
        const districtNames = deletedRepAreas.map(a => a.district_name);

        // get active sales reps who can cover those districts
        const candidates = await User.findAll({
            where: { 
                role: 'sales_rep',
                is_active: true
            },
            include: [{
                model: UserArea,
                as: 'areas',
                where: { district_name: { [Op.in]: districtNames } }
            }]
        });

        res.status(200).json(candidates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {  createCustomer, 
                    getAllCustomers, 
                    getCustomer, 
                    addNote, 
                    deleteNote, 
                    getCustomerCount, 
                    searchCustomers, 
                    assignSalesRep, 
                    reassignCustomers, 
                    getEligibleCustomersForRep, 
                    getCustomersByRep, 
                    getUnassignedCustomers,
                    getDeletedSalesReps,
                    getReplacementCandidates };
