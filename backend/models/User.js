const { DataTypes } = require('sequelize');
const sequelize = require('../db/db');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true, 
    field: 'user_id'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('admin', 'manager', 'sales_rep', 'online_store_keeper'),
        allowNull: false,
    },
    dob: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    contact_no: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    nic_no: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    is_default_password: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    default_password: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    profile_image: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'picture_url',
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    }, {
    tableName: 'users',
    timestamps: true,
    paranoid: true, // Enables soft deletes (uses deleted_at)
    underscored: true,
});

module.exports = User;