const { Product, ProductVariant, sequelize, Category, Brand } = require('../models');

const addProduct = async (req, res) => {
    try {
        const { product_name, brand_id, category_id, description, variants } = req.body;
        
        // 1. get main image URL (if Provided)
        const mainImageUrl = req.files['main_image'] ? req.files['main_image'][0].path : null;

        // 2. create product 
        const newProduct = await Product.create({
            product_name,
            brand_id,
            category_id,
            description,
            image_url: mainImageUrl 
        });

        // 3. handle variants and their images
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
                image_url: vImgUrl // 👈 Variant URL
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
                { model: Category, as: 'category' },
                { model: Brand, as: 'brand' },
                { model: ProductVariant, as: 'variants' }
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

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id, {
            include: [
                { model: Category, as: 'category' },
                { model: Brand, as: 'brand' },
                { model: ProductVariant, as: 'variants' }
            ]
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({
            message: 'Product retrieved successfully',
            product
        });
    } catch (err) {
        console.error('Get Product By ID Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

const addStockToVariant = async (req, res) => {
    try {
        const { variantId } = req.params;
        const quantity = Number(req.body.quantity);

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({ error: 'Quantity must be a positive integer' });
        }

        const variant = await ProductVariant.findByPk(variantId);
        if (!variant) {
            return res.status(404).json({ error: 'Variant not found' });
        }

        const currentStock = Number(variant.stock_count || 0);
        const updatedStock = currentStock + quantity;

        await variant.update({ stock_count: updatedStock });

        res.status(200).json({
            message: 'Stock updated successfully',
            variant: {
                variant_id: variant.variant_id,
                stock_count: variant.stock_count
            }
        });
    } catch (err) {
        console.error('Add Stock Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

const batchAddStockToVariants = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { updates } = req.body;

        if (!Array.isArray(updates) || updates.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Updates array is required' });
        }

        const appliedUpdates = [];
        let totalUnits = 0;

        for (const update of updates) {
            const variantId = update?.variant_id;
            const quantity = Number(update?.quantity);

            if (!variantId || !Number.isInteger(quantity) || quantity <= 0) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Each update must include variant_id and positive integer quantity' });
            }

            const variant = await ProductVariant.findByPk(variantId, { transaction });
            if (!variant) {
                await transaction.rollback();
                return res.status(404).json({ error: `Variant not found: ${variantId}` });
            }

            const previousStock = Number(variant.stock_count || 0);
            const newStock = previousStock + quantity;

            await variant.update({ stock_count: newStock }, { transaction });

            appliedUpdates.push({
                variant_id: variant.variant_id,
                quantity,
                previous_stock: previousStock,
                new_stock: newStock
            });
            totalUnits += quantity;
        }

        await transaction.commit();
        res.status(200).json({
            message: 'Batch stock update successful',
            summary: {
                updatedVariants: appliedUpdates.length,
                totalUnits
            },
            appliedUpdates
        });
    } catch (err) {
        await transaction.rollback();
        console.error('Batch Add Stock Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

const batchRevertStockForVariants = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { updates } = req.body;

        if (!Array.isArray(updates) || updates.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Updates array is required' });
        }

        const revertedUpdates = [];
        let totalUnits = 0;

        for (const update of updates) {
            const variantId = update?.variant_id;
            const quantity = Number(update?.quantity);

            if (!variantId || !Number.isInteger(quantity) || quantity <= 0) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Each update must include variant_id and positive integer quantity' });
            }

            const variant = await ProductVariant.findByPk(variantId, { transaction });
            if (!variant) {
                await transaction.rollback();
                return res.status(404).json({ error: `Variant not found: ${variantId}` });
            }

            const previousStock = Number(variant.stock_count || 0);
            if (previousStock < quantity) {
                await transaction.rollback();
                return res.status(400).json({ error: `Cannot revert ${quantity} units for variant ${variantId}; current stock is ${previousStock}` });
            }

            const newStock = previousStock - quantity;
            await variant.update({ stock_count: newStock }, { transaction });

            revertedUpdates.push({
                variant_id: variant.variant_id,
                quantity,
                previous_stock: previousStock,
                new_stock: newStock
            });
            totalUnits += quantity;
        }

        await transaction.commit();
        res.status(200).json({
            message: 'Batch stock revert successful',
            summary: {
                revertedVariants: revertedUpdates.length,
                totalUnits
            },
            revertedUpdates
        });
    } catch (err) {
        await transaction.rollback();
        console.error('Batch Revert Stock Error:', err.message);
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
    getProductById,
    addStockToVariant,
    batchAddStockToVariants,
    batchRevertStockForVariants,
    updateProduct,
    deleteProduct
};