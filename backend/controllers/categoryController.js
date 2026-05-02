const { Category, Product } = require('../models');

const addCategory = async (req, res) => {
    // destructure data from the frontend request body
    const { name, description } = req.body;

    try {
        // 1. check if category with the same name already exists (case-insensitive)
        const existingCategory = await Category.findOne({ 
            where: { category_name: name } 
        });

        if (existingCategory) {
            return res.status(400).json({ error: 'මෙම කාණ්ඩය (Category) දැනටමත් පද්ධතියට ඇතුළත් කර ඇත.' });
        }

        // 2. create new category
        const newCategory = await Category.create({
            category_name: name,
            category_description: description
        });

        // 3. success response
        return res.status(201).json({
            message: 'Category added successfully!',
            category: newCategory
        });

    } catch (error) {
        console.error('Error adding category:', error);
        
        // If the error is due to unique constraint violation, send a specific message
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'මෙම Category නාමය දැනටමත් පවතී.' });
        }

        return res.status(500).json({ error: 'සර්වර් එකේ දෝෂයක් පවතී. කරුණාකර නැවත උත්සාහ කරන්න.' });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            include: [{ 
                model: Product, 
                as: 'products' // model association alias 
            }],
            order: [['category_name', 'ASC']]
        });
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    addCategory,
    getCategories
};