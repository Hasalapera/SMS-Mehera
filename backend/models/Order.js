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
    allowNull: true, // 
    references: {
      model: 'customers',
      key: 'customer_id'
    }
  },
  customer_name: { type: DataTypes.STRING, allowNull: false },
  shipping_address: { type: DataTypes.TEXT, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  
  // --- ✅ අලුතින් එක් කළ Fields ---
  secondary_phone: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: true },
  district: { type: DataTypes.STRING, allowNull: true },
  order_type: { 
    type: DataTypes.STRING, 
    defaultValue: 'offline' // 'online' හෝ 'offline' ලෙස සේව් වේ
  },
  // -----------------------------

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