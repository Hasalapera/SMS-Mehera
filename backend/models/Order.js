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
    allowNull: true,
    references: {
      model: 'customers',
      key: 'customer_id'
    }
  },
  customer_name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  shipping_address: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  phone: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  
  // --- Additional Fields ---
  secondary_phone: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  email: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  district: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  order_type: { 
    type: DataTypes.STRING, 
    defaultValue: 'offline' // 'online' or 'offline'
  },

  // --- Money Related Fields (නිවැරදි පිළිවෙළ) ---
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    comment: 'Total before discount'
  },
  discount_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
    comment: 'Discount percentage (0-100)'
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    comment: 'Discount amount in LKR'
  },
  total_amount: {  // ✅ එක වතාවක් පමණක්
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Final payable amount after discount'
  },

  // --- Order Tracking ---
  courier_name: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  tracking_id: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  order_status: { 
    type: DataTypes.STRING, 
    defaultValue: 'pending' 
  },
  created_by: {
  type: DataTypes.UUID,
  allowNull: true, // Login වෙලා කරන ඕඩර් වලට විතරක් වැටෙන්න
  references: {
    model: 'users',
    key: 'user_id'
  }
}
}, {
  tableName: 'orders',
  timestamps: true,
  paranoid: true,      
  underscored: true,   
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});

module.exports = Order;