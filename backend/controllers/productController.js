const { Product, ProductVariant, sequelize, Category, Brand } = require('../models');

const addProduct = async (req, res) => {
    try {
        const { product_name, brand_id, category_id, description, variants } = req.body;
        
        // 1. Main Image URL එක ගැනීම
        const mainImageUrl = req.files['main_image'] ? req.files['main_image'][0].path : null;

        // 2. Product එක Create කිරීම
        const newProduct = await Product.create({
            product_name,
            brand_id,
            category_id,
            description,
            image_url: mainImageUrl // 👈 මෙතන තමයි DB එකට යන්නේ
        });

        // 3. Variants සහ ඒවයේ පින්තූර Handle කිරීම
        const parsedVariants = JSON.parse(variants);
        const variantImages = req.files['variant_images'] || [];
        let imageCounter = 0;

        const variantPromises = parsedVariants.map(async (v, index) => {
            let vImgUrl = null;
            if (v.hasImage) {
                vImgUrl = variantImages[imageCounter] ? variantImages[imageCounter].path : null;
                imageCounter++;
            }

            return await ProductVariant.create({
                product_id: newProduct.product_id,
                sku: v.sku,
                variant_name: v.variant_name,
                price: v.price,
                stock_count: v.stock_count,
                critical_stock_level: v.critical_stock_level,
                image_url: vImgUrl // 👈 Variant එකේ URL එක
            });
        });

        await Promise.all(variantPromises);
        res.status(201).json({ message: "Product added successfully!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

const getProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [
                {
                    model: Category, as: 'category',
                    model: Brand, as: 'brand',
                    model: ProductVariant, as: 'variants'
                }
            ]
        });

        res.status(200).json({
            message: "Products retrieved successfully",
            products
        });

    } catch (err) {
        console.error("Get Products Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const product = await Product.findByPk(id);
        
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        await product.update(updateData);

        res.status(200).json({
            message: "Product updated successfully",
            product
        });

    } catch (err) {
        console.error("Update Product Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);
        
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        await product.destroy();

        res.status(200).json({ message: "Product deleted successfully" });

    } catch (err) {
        console.error("Delete Product Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    addProduct,
    getProducts,
    updateProduct,
    deleteProduct
};