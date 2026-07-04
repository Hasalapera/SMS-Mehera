const { Product, ProductVariant, sequelize, Category, Brand, User } = require('../models');
const { createNotification } = require('./notificationController');

const parseVariantsInput = (variants) => {
    if (typeof variants === 'string') {
        try {
            return JSON.parse(variants);
        } catch (e) {
            console.error("Failed to parse variants JSON string:", e);
            return [];
        }
    }
    if (Array.isArray(variants)) {
        return variants;
    }
    return [];
};

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

        // Create a global notification for the new product
        if (req.user) { // Ensure user is logged in
            let initiatorString = 'an administrator';
            if (req.user.name && req.user.role) {
                const roleFormatted = req.user.role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                initiatorString = `${req.user.name} (${roleFormatted})`;
            }
            await createNotification(
                'product',
                'New Product Added',
                `A new product "${newProduct.product_name}" was added to the inventory by ${initiatorString}.`,
                {
                    reference_id: newProduct.product_id,
                    initiator_id: req.user.user_id,
                    severity: 'info'
                }
            );
        }
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
        const isAdminOrManager = user && (user.role === 'admin' || user.role === 'manager');

        const queryOptions = {
            include: [
                { model: Category, as: 'category' },
                { model: Brand, as: 'brand' },
                {
                    model: ProductVariant,
                    as: 'variants',
                    ...(isAdminOrManager && { paranoid: false })
                }
            ]
        };

        if (isAdminOrManager) {
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
        const isAdminOrManager = user && (user.role === 'admin' || user.role === 'manager');

        const whereClause = { product_id: id };
        if (!isAdminOrManager) {
            whereClause.status = 'active';
        }

        const queryOptions = {
            where: whereClause,
            include: [
                { model: Category, as: 'category' },
                { model: Brand, as: 'brand' },
                {
                    model: ProductVariant,
                    as: 'variants',
                    ...(isAdminOrManager && { paranoid: false })
                }
            ],
        };

        if (isAdminOrManager) {
            queryOptions.paranoid = false;
        }

        // Use eager loading to get associated category, brand, and variants in one query
        const product = await Product.findOne(queryOptions);

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


// Update product details (excluding variants for simplicity)
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { product_name, brand_id, category_id, description, status, variants } = req.body;
        const parsedVariants = parseVariantsInput(variants);

        const product = await Product.findByPk(id, {
            paranoid: false,
            include: [{ model: ProductVariant, as: 'variants', paranoid: false }]
        });
        
        // If product not found, return 404
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // --- Start tracking changes for granular notifications ---
        const changes = {
            productDetails: false,
            newVariants: [],
            restoredVariants: [],
            deletedVariants: [],
            stockUpdates: [],
            priceUpdates: [],
            otherVariantUpdates: []
        };
        const initiatorId = req.user?.user_id || null;
        let initiatorString = 'an administrator';
        if (req.user && req.user.name && req.user.role) {
            const roleFormatted = req.user.role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            initiatorString = `${req.user.name} (${roleFormatted})`;
        }
        // ---

        const mainImageUrl = req.files?.['main_image']?.[0]?.path;
        const variantImages = req.files?.['variant_images'] || [];
        let imageCounter = 0;

        const transaction = await sequelize.transaction();
        try {
            // --- Track Product Detail Changes ---
            const oldStatus = product.status;
            if (
                product.product_name !== product_name ||
                String(product.brand_id) !== String(brand_id) ||
                String(product.category_id) !== String(category_id) ||
                product.description !== description ||
                product.status !== status ||
                mainImageUrl
            ) {
                changes.productDetails = true;
            }

            if (status === 'active' && oldStatus !== 'active') {
                await product.restore({ transaction });
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

                    // --- Track Variant Changes ---
                    const oldStock = Number(existingModel.stock_count);
                    const newStock = Number(payload.stock_count);
                    const oldPrice = Number(existingModel.price);
                    const newPrice = Number(payload.price);

                    if (existingModel.deletedAt) {
                        changes.restoredVariants.push(existingModel.variant_name);
                        await existingModel.restore({ transaction });
                    }
                    
                    if (oldStock !== newStock) {
                        changes.stockUpdates.push({ name: existingModel.variant_name, from: oldStock, to: newStock });
                    }
                    if (oldPrice !== newPrice) {
                        changes.priceUpdates.push({ name: existingModel.variant_name, from: oldPrice, to: newPrice });
                    }
                    if (
                        existingModel.sku !== payload.sku ||
                        existingModel.variant_name !== payload.variant_name ||
                        (variantImageUrl && existingModel.image_url !== variantImageUrl)
                    ) {
                        changes.otherVariantUpdates.push(existingModel.variant_name);
                    }

                    await existingModel.update(payload, { transaction });
                } else {
                    const newVariant = await ProductVariant.create(payload, { transaction });
                    changes.newVariants.push(newVariant.variant_name);
                }
            }

            const variantsToDelete = existingVariants.filter((variant) => !submittedVariantIds.has(variant.variant_id));
            for (const variant of variantsToDelete) {
                changes.deletedVariants.push(variant.variant_name);
                await variant.destroy({ transaction });
            }

            await transaction.commit();

        } catch (err) {
            await transaction.rollback();
            console.error("Update Product Transaction Error:", err.message);
            return res.status(500).json({ error: "Failed to update product during transaction." });
        }

        const updatedProduct = await Product.findByPk(id, {
            paranoid: false,
            include: [
                { model: Category, as: 'category' },
                { model: Brand, as: 'brand' },
                { model: ProductVariant, as: 'variants', paranoid: false }
            ]
        });

        // --- Generate Granular Notifications ---
        if (initiatorId) {
            const commonOptions = {
                reference_id: updatedProduct.product_id,
                initiator_id: initiatorId,
            };

            // 1. Product Details Update
            if (changes.productDetails) {
                await createNotification('product', 'Product Details Updated', `Details for "${updatedProduct.product_name}" were updated by ${initiatorString}.`, { ...commonOptions, severity: 'info' });
            }

            // 2. Stock Updates
            for (const update of changes.stockUpdates) {
                const change = update.to - update.from;
                const sign = change > 0 ? '+' : '';
                await createNotification('stock', 'Stock Level Adjusted', `Stock for ${update.name} (${updatedProduct.product_name}) was adjusted from ${update.from} to ${update.to} (${sign}${change}) by ${initiatorString}.`, { ...commonOptions, severity: 'info' });
            }

            // 3. Price Updates
            for (const update of changes.priceUpdates) {
                await createNotification('product', 'Price Updated', `Price for ${update.name} (${updatedProduct.product_name}) was changed from Rs. ${update.from.toLocaleString()} to Rs. ${update.to.toLocaleString()} by ${initiatorString}.`, { ...commonOptions, severity: 'warning' });
            }

            // 4. New Variants
            if (changes.newVariants.length > 0) {
                await createNotification('product', 'New Variant Added', `${changes.newVariants.length} new variant(s) (${changes.newVariants.join(', ')}) were added to "${updatedProduct.product_name}" by ${initiatorString}.`, { ...commonOptions, severity: 'info' });
            }
            
            // 5. Restored Variants
            if (changes.restoredVariants.length > 0) {
                await createNotification('product', 'Variant Restored', `${changes.restoredVariants.length} variant(s) (${changes.restoredVariants.join(', ')}) were restored for "${updatedProduct.product_name}" by ${initiatorString}.`, { ...commonOptions, severity: 'info' });
            }

            // 6. Other Variant Updates (SKU, name, image)
            if (changes.otherVariantUpdates.length > 0) {
                const uniqueNames = [...new Set(changes.otherVariantUpdates)];
                await createNotification('product', 'Variant Details Updated', `Details for variant(s) (${uniqueNames.join(', ')}) of "${updatedProduct.product_name}" were updated by ${initiatorString}.`, { ...commonOptions, severity: 'info' });
            }

            // 7. Deleted Variants
            if (changes.deletedVariants.length > 0) {
                await createNotification('product', 'Variant Removed', `${changes.deletedVariants.length} variant(s) were removed from "${updatedProduct.product_name}" by ${initiatorString}.`, { ...commonOptions, severity: 'warning' });
            }

            // If no specific changes were tracked but the save was successful, send a generic one.
            if (Object.values(changes).every(v => (Array.isArray(v) ? v.length === 0 : !v))) {
                 await createNotification('product', 'Product Re-saved', `Product "${updatedProduct.product_name}" was re-saved by ${initiatorString} with no major changes.`, { ...commonOptions, severity: 'info' });
            }
        }

        res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (err) {
        console.error("Update Product Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

// Delete a product (soft delete)
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

        // Create a notification for the product deletion
        if (req.user) {
            let initiatorString = 'an administrator';
            if (req.user.name && req.user.role) {
                const roleFormatted = req.user.role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                initiatorString = `${req.user.name} (${roleFormatted})`;
            }
            await createNotification(
                'product',
                'Product Archived',
                `Product "${product.product_name}" was archived by ${initiatorString}.`,
                {
                    reference_id: product.product_id,
                    initiator_id: req.user.user_id,
                    severity: 'warning'
                }
            );
        }

        // Return success response
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
    updateProduct,
    deleteProduct
};