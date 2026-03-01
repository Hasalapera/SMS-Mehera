const {DataTypes} = require('sequelize');
const sequelize = require('../db/db');

const ProductVariant = sequelize.define('ProductVariant', {
    variant_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: 'variant_id'
    },
    product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'product_id',
    },
    sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    variant_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    stock_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    critical_stock_level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    tableName: 'product_variants',
    timestamps: true,
    underscored: true,
    paranoid: true, // Enable soft deletes (adds deletedAt field)
    deletedAt: 'deleted_at', // Use deleted_at instead of deletedAt
});

module.exports = ProductVariant;