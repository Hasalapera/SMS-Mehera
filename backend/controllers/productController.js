const { Product, ProductVariant, sequelize, Category, Brand } = require('../models');

const addProduct = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        console.log("Files received:", req.files);
        console.log("Body received:", req.body);
        const { product_name, brand_id, category_id, description, variants } = req.body;

        let parsedVariants;
        try{
            parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
        }catch(e){
            return res.status(400).json({ error: 'Invalid variants format. Must be a JSON string or an array.' });
        }

        // 1. Main Image එක Cloudinary වලින් ලැබෙන URL එක ගැනීම
        const mainImageUrl = req.files['main_image'] ? req.files['main_image'][0].path : null;

        // 2. Product එක නිර්මාණය කිරීම
        const newProduct = await Product.create({
            product_name,
            brand_id,
            category_id,
            description,
            // සටහන: Product model එකේ image_url column එකක් නැතිනම් ඒක add කරගන්න
            image_url: mainImageUrl 
        }, { transaction: t });

        // 3. Variant Images ටික අරගැනීම
        // req.files['variant_images'] ඇතුළේ පිළිවෙළට images ටික තියෙනවා
        const variantImages = req.files['variant_images'] || [];

        let imageCounter = 0; // Variant images ටිකට අදාළ image URL එක map කිරීමේ counter එක

        // 4. Variants නිර්මාණය කිරීම
        const variantData = parsedVariants.map(variant => {
            let currentImageUrl = null;
            if(variant.hasImage){
                currentImageUrl = variantImages[imageCounter] ? variantImages[imageCounter].path : null;
                imageCounter++; // Variant image එකක් map කරලත් counter එක වැඩි කරන්න
            }
            return {
                product_id: newProduct.product_id,
                sku: variant.sku,
                variant_name: variant.variant_name,
                price: variant.price,
                stock_count: variant.stock_count,
                critical_stock_level: variant.critical_stock_level,
                // අදාළ variant එකට අදාළ image එක map කිරීම
                image_url: currentImageUrl
            };
        });

        await ProductVariant.bulkCreate(variantData, { transaction: t });

        await t.commit();
        res.status(201).json({ message: 'Product and variants added successfully!' });

    } catch (error) {
        if (t) await t.rollback();
        console.error('Add Product Error:', error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: `SKU '${error.errors[0].value}' already exists. Please change it.` });
        }
        res.status(500).json({ error: 'Internal server error: ' + error.message });
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