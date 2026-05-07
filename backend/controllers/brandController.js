const {Brand, sequelize} = require('../models');

const addBrand = async (req, res) => {
    try {
        const { brand_name, description } = req.body;
        // url that brings back from cloudinary after uploading the image
        const image_url = req.file ? req.file.path : null;

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

const getBrands = async (req, res) => {
    try {
        const brands = await Brand.findAll();

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
        const { id } = req.params;

        const brand = await Brand.findByPk(id);
        if (!brand) {
            return res.status(404).json({ error: "Brand not found" });
        }

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