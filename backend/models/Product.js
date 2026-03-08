const { DataTypes } = require('sequelize');
const sequelize = require('../db/db');

const Product = sequelize.define('Product', {
    product_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: 'product_id'
    },
    brand_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'brand_id',
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    }
}, {
  tableName: 'products',
  timestamps: true,
  underscored: true,
  paranoid: true, // Enable soft deletes (adds deletedAt field)
  deletedAt: 'deleted_at', // Use deleted_at instead of deletedAt
});

module.exports = Product;