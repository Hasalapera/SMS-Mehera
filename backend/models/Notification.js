const { DataTypes } = require('sequelize');
const sequelize = require('../db/db');

// Define the Notification model
const Notification = sequelize.define('Notification', {
    notification_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    type: {
        type: DataTypes.ENUM('stock', 'product', 'customer', 'user', 'order', 'target'),
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    reference_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    initiator_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    target_user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    target_role: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    severity: {
        type: DataTypes.ENUM('info', 'warning', 'critical'),
        defaultValue: 'info',
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    read_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'notifications',
    timestamps: true,
    paranoid: true,
    underscored: true,
});

module.exports = Notification;
