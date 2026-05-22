
const sequelize = require('../db/db'); 
const { DataTypes } = require('sequelize');

const Workshop = sequelize.define('Workshop', {
  workshop_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  capacity: {
    type: DataTypes.STRING,
    allowNull: true
  },
  speakers: {
    type: DataTypes.STRING,
    allowNull: true
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('flagship', 'past', 'series'),
    defaultValue: 'series'
  }
}, {
  tableName: 'workshops',
  timestamps: true
});

module.exports = Workshop;