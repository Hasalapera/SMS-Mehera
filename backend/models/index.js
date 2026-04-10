const sequelize = require('../db/db');
const User = require('./User');
const UserArea = require('./UserArea');
const Product = require('./Product');
const ProductVariant = require('./ProductVariant');
const Brand = require('./Brand');
const Category = require('./Category');

// 1. User Associations
// User ටේබල් එක කලින් හැදෙන්න ඕන නිසා මේ පිළිවෙළ වැදගත්
User.hasMany(UserArea, { foreignKey: 'user_id', as: 'areas', onDelete: 'CASCADE' });
UserArea.belongsTo(User, { foreignKey: 'user_id' });

// 2. Product and Brand Associations
Brand.hasMany(Product, { foreignKey: 'brand_id', as: 'products', onDelete: 'SET NULL' });
Product.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });

// 3. Category & Product Associations (අලුතින් එකතු කළා)
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products', onDelete: 'SET NULL' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// 3. Product and Variant Associations
Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants', onDelete: 'CASCADE' });
ProductVariant.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

module.exports = {
  sequelize,
  User,
  UserArea,
  Product,
  Brand,
  Category,
  ProductVariant
};