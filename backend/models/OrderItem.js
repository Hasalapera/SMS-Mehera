const { DataTypes } = require('sequelize');
const sequelize = require('../db/db'); 

const OrderItem = sequelize.define('OrderItem', {
  item_id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  order_id: { 
    type: DataTypes.UUID, 
    allowNull: false,
    references: {
      model: 'orders',
      key: 'order_id'
    }
  },
  product_id: { 
    type: DataTypes.UUID, // Product ID එකත් UUID ලෙස සකස් කර ඇත
    allowNull: false 
  },
  variant_id: { // Diagram එකේ තිබූ field එක
    type: DataTypes.INTEGER, 
    allowNull: true 
  },
  qty: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, {
  tableName: 'order_items',
  timestamps: false
});

module.exports = OrderItem;