const { DataTypes } = require('sequelize');
const sequelize = require('../db/db');

const Setting = sequelize.define('Setting', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    light_logo_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    dark_logo_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    default_language: {
        type: DataTypes.STRING,
        defaultValue: 'en'
    }
}, {
    tableName: 'settings',
    timestamps: true,
});

module.exports = Setting;