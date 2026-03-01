const sequelize = require('../db/db');
const User = require('./User');
const UserArea = require('./UserArea');
const Product = require('./Product');
const ProductVariant = require('./ProductVariant');
const Brand = require('./Brand');

// 1. User Associations
// User ටේබල් එක කලින් හැදෙන්න ඕන නිසා මේ පිළිවෙළ වැදගත්
User.hasMany(UserArea, { foreignKey: 'user_id', as: 'areas', onDelete: 'CASCADE' });
UserArea.belongsTo(User, { foreignKey: 'user_id' });

// 2. Product and Brand Associations
Brand.hasMany(Product, { foreignKey: 'brand_id', as: 'products', onDelete: 'SET NULL' });
Product.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });

// 3. Product and Variant Associations
Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants', onDelete: 'CASCADE' });
ProductVariant.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// 🛡️ Sync Logic
// මුලින්ම 'force: true' දාලා error එක නැති කරගමු. එක සැරයක් run වුණාම මේක 'alter: true' කරන්න.
const syncDb = async () => {
  try {
    await sequelize.sync({ alter: true }); 
    console.log('✓ All models synchronized (Tables recreated)');
  } catch (err) {
    console.error('✗ Failed to sync database:', err);
  }
};

syncDb();

module.exports = {
  sequelize,
  User,
  UserArea,
  Product,
  Brand,
  ProductVariant
};