const { DataTypes } = require('sequelize');
const sequelize = require('../db/db');

const Category = sequelize.define('Category', {
    category_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    category_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    category_description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'categories',
    timestamps: true,
    underscored: true
});

module.exports = Category;