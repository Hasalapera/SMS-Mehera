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
            return res.status(400).json({ error: 'This category name is already in use.' });
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
            return res.status(400).json({ error: 'This category name is already in use.' });
        }

        return res.status(500).json({ error: 'There is an error on the server. Please try again.' });
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

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);

        if (!category) return res.status(404).json({ error: "Category not found" });

        // paranoid: true -> this will soft delete the category (set deletedAt timestamp) instead of hard deleting the record
        await category.destroy();

        res.status(200).json({ message: "Category archived successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    addCategory,
    getCategories,
    deleteCategory
};