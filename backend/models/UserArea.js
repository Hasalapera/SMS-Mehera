const { DataTypes } = require('sequelize');
const sequelize = require('../db/db');

const UserArea = sequelize.define('UserArea', {
  user_area_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
  },
  district_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'user_areas',
  timestamps: false,
  underscored: true,
});

module.exports = UserArea;