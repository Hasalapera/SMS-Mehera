const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // 💡 උඹේ ප්‍රොජෙක්ට් එකේ හැටියට database config path එක මාරු කරපන්

const SalesTarget = sequelize.define('SalesTarget', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  sales_rep_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users', // 💡 Sales Rep ලා ඉන්නේ Users table එකේ නම් ඒ නම දාපන්
      key: 'user_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  },
  month: {
    type: DataTypes.STRING(7), // 📅 Format: "YYYY-MM" (e.g., "2026-05")
    allowNull: false,
  },
  active_customer_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0, // 📍 ඒ ඒරියා එකේ රෙප් යටතේ ඉන්න active saloons ගණන
    allowNull: false,
  },
  density_factor: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 1.00, // 📐 Area capacity එක අනුව හැදුණු බර තැබීමේ සාධකය
    allowNull: false,
  },
  base_target_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false, // 💰 කිසිම adjustment එකක් නැතුව එන මූලික ටාගට් එක
  },
  adjusted_target_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false, // 🚀 Seasonality/Growth එකතු වූ පසු අවසාන පියවිය යුතු ටාගට් එක
  },
  achieved_amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00, // 📈 රිපෝට් එකෙන් Live එකතු වෙන Net Sales Volume එක
    allowNull: false,
  },
  is_achieved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
}, {
  timestamps: true,
  underscored: true, // created_at, updated_at විදිහට DB එකේ වදින්න
  tableName: 'sales_targets',
  indexes: [
    {
      unique: true,
      fields: ['sales_rep_id', 'month'], // 🔒 එක රෙප් කෙනෙක්ට එක මාසෙකට තියෙන්න පුළුවන් එක ටාගට් එකක් විතරයි
    }
  ]
});

module.exports = SalesTarget;