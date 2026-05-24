const sequelize = require('../db/db');
const { DataTypes } = require('sequelize');
const User = require('./User');
const UserArea = require('./UserArea');
const Product = require('./Product');
const ProductVariant = require('./ProductVariant');
const Brand = require('./Brand');
const Category = require('./Category');
const Customer = require('./Customer');
const CustomerNote = require('./CustomerNote');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Workshop = require('./Workshop'); 
const SalesTarget = require('./SalesTarget');
const SettingModel = require('./Setting');
const Setting = SettingModel(sequelize, DataTypes);
const NotificationModel = require('./Notification');
const Notification = NotificationModel(sequelize, DataTypes);

// 1. User Associations
User.hasMany(UserArea, { foreignKey: 'user_id', as: 'areas', onDelete: 'CASCADE' });
UserArea.belongsTo(User, { foreignKey: 'user_id' });

// 2. Product and Brand Associations
Brand.hasMany(Product, { foreignKey: 'brand_id', as: 'products', onDelete: 'SET NULL' });
Product.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });

// 3. Category & Product Associations
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products', onDelete: 'SET NULL' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// 4. Product and Variant Associations
Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants', onDelete: 'CASCADE' });
ProductVariant.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// 5. Customer and CustomerNote Associations
Customer.hasMany(CustomerNote, { foreignKey: 'customer_id', as: 'notes', onDelete: 'CASCADE' });
CustomerNote.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

// 6. Order and OrderItem Associations
Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

// 7. ProductVariant and OrderItem Associations 
OrderItem.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });
ProductVariant.hasMany(OrderItem, { foreignKey: 'variant_id' });

// 8. User and Order Associations 
Order.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });
User.hasMany(Order, { foreignKey: 'created_by' });

// 9. User and Customer Associations (Sales Rep)
User.hasMany(Customer, { foreignKey: 'sales_rep_id', as: 'assignedCustomers' });
Customer.belongsTo(User, { foreignKey: 'sales_rep_id', as: 'salesRep' });

// 10. Order and Customer Associations 
Order.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' }); 
Customer.hasMany(Order, { foreignKey: 'customer_id' });

// 11. User and SalesTarget Associations
User.hasMany(SalesTarget, { foreignKey: 'sales_rep_id', as: 'targets', onDelete: 'CASCADE' });
SalesTarget.belongsTo(User, { foreignKey: 'sales_rep_id', as: 'salesRep' });

module.exports = {
  sequelize,
  User,
  UserArea,
  Product,
  Brand,
  Category,
  ProductVariant,
  Customer,
  CustomerNote,
  Order,
  OrderItem,
  Setting,
  Notification,
  Workshop,
  SalesTarget 
};