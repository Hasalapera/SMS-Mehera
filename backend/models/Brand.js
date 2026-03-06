const {DataTypes} = require('sequelize');
const sequelize = require('../db/db');

const Brand = sequelize.define('Brand', {
    brand_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: 'brand_id'
    },
    brand_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    tableName: 'brands',
    timestamps: true,
    underscored: true
});

module.exports = Brand;