const { DataTypes } = require('sequelize');
const sequelize = require('../db/db');

const Customer = sequelize.define('Customer', {
    customer_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: 'customer_id'
    },
    // ID Reference (CUS-0001 වැනි දේ සේව් කර ගැනීමට)
    customer_display_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'customer_display_id'
    },
    type: {
        type: DataTypes.ENUM('Saloon', 'Wholesale', 'Retail'),
        defaultValue: 'Saloon',
        allowNull: false
    },
    saloon_name: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'saloon_name'
    },
    owner_name: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'owner_name'
    },
    phone1: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'phone1'
    },
    phone2: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'phone2'
    },
    // ලිපිනය Lane 01 සහ 02 ලෙස වෙන් කර ගබඩා කිරීම වඩාත් සුදුසුයි
    lane1: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'lane1'
    },
    lane2: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'lane2'
    },
    district: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'district'
    },
    additional_note: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'additional_note'
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'customers',
    timestamps: true,
    underscored: true,
    paranoid: true, // Soft deletes සක්‍රීය කිරීම
    deletedAt: 'deleted_at'
});

module.exports = Customer;