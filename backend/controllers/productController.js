const { Product, ProductVariant, sequelize, Category, Brand } = require('../models');


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
        res.status(201).json({ message: "Product added successfully!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Get all products with their variants, category, and brand
const getProducts = async (req, res) => {
    try {
        // Use eager loading to get associated category, brand, and variants in one query
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

// Get single product by ID with its variants, category, and brand
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        // Use eager loading to get associated category, brand, and variants in one query
        const product = await Product.findByPk(id, {
            include: [
                { model: Category, as: 'category' },
                { model: Brand, as: 'brand' },
                { model: ProductVariant, as: 'variants' }
            ]
        });

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
        // For simplicity, we are only updating the main product details here. Variants can be updated through a separate endpoint if needed.
        const { id } = req.params;
        // Get the update data from the request body
        const updateData = req.body;

        // If there's a new main image, get its URL
        const product = await Product.findByPk(id);
        
        // If product not found, return 404
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // If a new main image is uploaded, update the image_url
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

// Delete a product (soft delete)
const deleteProduct = async (req, res) => {
    try {
        // Get the product ID from the request parameters
        const { id } = req.params;

        // Find the product by ID
        const product = await Product.findByPk(id);
        
        // If product not found, return 404
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Soft delete the product (set deletedAt timestamp)
        await product.destroy();

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