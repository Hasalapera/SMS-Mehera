const {Brand, Product, sequelize} = require('../models');

const addBrand = async (req, res) => {
    try {
        // get name, description from frontend
        const { brand_name, description } = req.body;
        // url that brings back from cloudinary after uploading the image (multer middleware)
        const image_url = req.file ? req.file.path : null;

        // include data to the brand variable in database (Brand.create -> write data into database)
        const brand = await Brand.create({
            brand_name,
            description,
            image_url
        });

        res.status(201).json({
            message: "Brand added successfully!",
            brandId: brand.brand_id
        });

    } catch (err) {
        console.error("Add Brand Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

// Show brands
const getBrands = async (req, res) => {
    try {
        // get details of each registered brands
        const brands = await Brand.findAll({
            // check products table for each relevant brand, provide brand with products
            attributes: {
                include: [
                    // use subquery for get product count for each brand
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM products AS product
                            WHERE
                                product.brand_id = "Brand".brand_id
                                AND product.deleted_at IS NULL
                        )`),
                        'productCount' // get product count for relavant brand
                    ]
                ]
            },
            order: [['createdAt', 'DESC']] // Newest first
        });

        res.status(200).json({
            message: "Brands retrieved successfully",
            brands
        });

    } catch (err) {
        console.error("Get Brands Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

const deleteBrand = async (req, res) => {
    try {
        // check the which brand to delete from frontend request
        const { id } = req.params;

        // check brand with primary key
        const brand = await Brand.findByPk(id);
        if (!brand) {
            return res.status(404).json({ error: "Brand not found" });
        }
    
        // delete the brand  (paranoid:true -> soft delete only)
        await brand.destroy();

        res.status(200).json({
            message: "Brand deleted successfully"
        });

    } catch (err) {
        console.error("Delete Brand Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    addBrand,
    getBrands,
    deleteBrand
};  