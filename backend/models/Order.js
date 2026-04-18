const { DataTypes } = require('sequelize');
const sequelize = require('../db/db'); 

const Order = sequelize.define('Order', {
  order_id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  customer_id: { 
    type: DataTypes.UUID, 
    allowNull: false,
    references: {
      model: 'customers', // 'customers' table එක සමඟ සම්බන්ධය (Relationship)
      key: 'customer_id'
    }
  },
  customer_name: { type: DataTypes.STRING, allowNull: false },
  shipping_address: { type: DataTypes.TEXT, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  secondary_phone: { type: DataTypes.STRING, allowNull: true },
  total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  courier_name: { type: DataTypes.STRING, allowNull: true },
  tracking_id: { type: DataTypes.STRING, allowNull: true },
  order_status: { 
    type: DataTypes.STRING, 
    defaultValue: 'pending' 
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'orders',
  timestamps: false
});

module.exports = Order;