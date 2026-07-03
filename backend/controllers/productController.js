const { Product, ProductVariant, sequelize, Category, Brand, User } = require('../models');
const { createNotification } = require('./notificationController');


/**
 * Handles Product and Variant creation with image uploading.
 * 1. Creates the main (parent) product first and gets its ID.
 * 2. Uses that ID to link multiple variants (e.g., sizes/colors) to the product.
 * 3. Maps each variant to its specific image correctly using an image counter.
 * 4. Saves all variants in parallel for better performance.
 */
const addProduct = async (req, res) => {
    try {
        // frontend url eken ena wistara tika aragannawa
        const { product_name, brand_id, category_id, description, variants } = req.body;
        const parsedVariants = JSON.parse(variants);
        const variantCount = parsedVariants.length;
        const brand = await Brand.findByPk(brand_id, { attributes: ['brand_name'] });
        const category = await Category.findByPk(category_id, { attributes: ['category_name'] });
        const loggedInUser = req.user || {};
        const userRecord = loggedInUser.user_id
            ? await User.findByPk(loggedInUser.user_id, { attributes: ['name'] })
            : null;
        const roleLabel = loggedInUser.role
            ? loggedInUser.role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
            : 'System';

        // 1. get main image URL 
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
        const variantImages = req.files['variant_images'] || [];
        // help to map relavant image for relavant variant
        let imageCounter = 0;

        // 4. create variants with their respective images

        //Array ekak widihata thiyna variants list eka haraha eka eka loop ekak yanawa. async use karala time eka yanwawanam wait karala thygnnw
        const variantPromises = parsedVariants.map(async (v, index) => {
            // indefaul null
            let vImgUrl = null;
            // check karanawa variant ekata image ekak tiyeda kiyala
            if (v.hasImage) {
                // Variant images liyisthuwe thiyena image counter ekata adalawa thiyena image path eka gannawa. eka vImgUrl ekata assign karanawa.
                vImgUrl = variantImages[imageCounter] ? variantImages[imageCounter].path : null;
                // ekak gaththa nisa, imageCounter eka ekakin wadi karanawa (0 thibba nam dan 1 wenawa).
                // Ethakota ilaga variant ekata yaddi ilaga image eka ganna puluwan.
                imageCounter++;
            }

            // ProductVariant table eke aluth record ekak hadanawa.
            return await ProductVariant.create({
                // main product eke ID eka methanadi variant ekata link karanawa.
                product_id: newProduct.product_id,
                sku: v.sku,
                variant_name: v.variant_name,
                price: v.price,
                stock_count: v.stock_count,
                critical_stock_level: v.critical_stock_level,
                image_url: vImgUrl // 👈 Variant URL
            });
        });

        // wait for all variants to be created
        await Promise.all(variantPromises);

        await createNotification(
            'product',
            '🆕 New Product Added',
            `${product_name} (${brand?.brand_name || ''} - ${category?.category_name || ''}) added with ${variantCount} variant(s) by ${userRecord?.name || 'System'} (${roleLabel})`,
            newProduct.product_id,
            'info'
        );

        res.status(201).json({ message: "Product added successfully!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Get all products with their variants, category, and brand
const getProducts = async (req, res) => {
    try {
        const user = req.user;
        const queryOptions = {
            include: [
                { model: Category, as: 'category' },
                { model: Brand, as: 'brand' },
                { model: ProductVariant, as: 'variants', paranoid: false }
            ]
        };

        if (user && (user.role === 'admin' || user.role === 'manager')) {
            queryOptions.paranoid = false;
        } else {
            queryOptions.where = { status: 'active' };
        }

        // Use eager loading to get associated category, brand, and variants in one query
        const products = await Product.findAll(queryOptions);

        res.status(200).json({
            message: "Products retrieved successfully",
            products
        });

    } catch (err) {
        console.error("Get Products Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

// Get single product by ID with its variants, category, and brand
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const queryOptions = {
            include: [
                { model: Category, as: 'category' },
                { model: Brand, as: 'brand' },
                { model: ProductVariant, as: 'variants', paranoid: false }
            ]
        };

        if (user && (user.role === 'admin' || user.role === 'manager')) {
            queryOptions.paranoid = false;
        } else {
            queryOptions.where = { status: 'active' };
        }

        // Use eager loading to get associated category, brand, and variants in one query
        const product = await Product.findByPk(id, queryOptions);

        // If product not found, return 404
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Return the product with its associations
        res.status(200).json({
            message: 'Product retrieved successfully',
            product
        });
    } catch (err) {
        console.error('Get Product By ID Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};


const parseVariantsInput = (variants) => {
    if (!variants) return [];

    if (Array.isArray(variants)) {
        return variants;
    }

    if (typeof variants === 'string') {
        return JSON.parse(variants);
    }

    return [];
};

// Update product details and variants in one request
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { product_name, brand_id, category_id, description, status, variants } = req.body;
        const parsedVariants = parseVariantsInput(variants);

        const product = await Product.findByPk(id, {
            paranoid: false,
            include: [{ model: ProductVariant, as: 'variants', paranoid: false }]
        });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const mainImageUrl = req.files?.['main_image']?.[0]?.path;
        const variantImages = req.files?.['variant_images'] || [];
        let imageCounter = 0;

        await sequelize.transaction(async (transaction) => {
            if (status === 'active') {
                await product.restore({ transaction });
                await ProductVariant.restore({ where: { product_id: product.product_id }, transaction });
            }

            await product.update({
                product_name,
                brand_id,
                category_id,
                description,
                status,
                ...(mainImageUrl ? { image_url: mainImageUrl } : {})
            }, { transaction });

            const existingVariants = product.variants || [];
            const existingVariantMap = new Map(existingVariants.map((variant) => [variant.variant_id, variant]));
            const submittedVariantIds = new Set();

            for (const variant of parsedVariants) {
                const variantId = variant.variant_id || null;
                const variantImageUrl = variant.hasImage
                    ? (variantImages[imageCounter] ? variantImages[imageCounter].path : null)
                    : (variant.existing_image_url || null);

                if (variant.hasImage) {
                    imageCounter += 1;
                }

                const payload = {
                    product_id: product.product_id,
                    sku: variant.sku,
                    variant_name: variant.variant_name,
                    price: variant.price,
                    stock_count: variant.stock_count,
                    critical_stock_level: variant.critical_stock_level,
                    image_url: variantImageUrl
                };

                if (variantId && existingVariantMap.has(variantId)) {
                    submittedVariantIds.add(variantId);
                    const existingModel = existingVariantMap.get(variantId);
                    if (existingModel.deletedAt) {
                        await existingModel.restore({ transaction });
                    }
                    await existingModel.update(payload, { transaction });
                } else {
                    await ProductVariant.create(payload, { transaction });
                }
            }

            const variantsToDelete = existingVariants.filter((variant) => !submittedVariantIds.has(variant.variant_id));
            for (const variant of variantsToDelete) {
                await variant.destroy({ transaction });
            }
        });

        const updatedProduct = await Product.findByPk(id, {
            paranoid: false,
            include: [
                { model: Category, as: 'category' },
                { model: Brand, as: 'brand' },
                { model: ProductVariant, as: 'variants', paranoid: false }
            ]
        });

        res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (err) {
        console.error("Update Product Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

// Deactivate a product so it stays visible in inventory but becomes unclickable
const deleteProduct = async (req, res) => {
    try {
        // Get the product ID from the request parameters
        const { id } = req.params;

        // Find the product by ID
        const product = await Product.findByPk(id, { paranoid: false });

        // If product not found, return 404
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Mark the product inactive, soft-delete it (updating deleted_at), and soft-delete its variants
        await product.update({
            status: 'inactive',
        });
        await product.destroy();

        await ProductVariant.destroy({
            where: { product_id: id }
        });

        // Return success response
        res.status(200).json({ message: "Product deactivated successfully" });

    } catch (err) {
        console.error("Delete Product Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

const deleteProductVariant = async (req, res) => {
    try {
        const { id, variantId } = req.params;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const variant = await ProductVariant.findOne({
            where: {
                variant_id: variantId,
                product_id: id,
            }
        });

        if (!variant) {
            return res.status(404).json({ error: 'Variant not found' });
        }

        await variant.destroy();

        res.status(200).json({ message: 'Variant deleted successfully' });
    } catch (err) {
        console.error('Delete Variant Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    addProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    deleteProductVariant
};