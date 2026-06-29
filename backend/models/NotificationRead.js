const { DataTypes } = require('sequelize');
const sequelize = require('../db/db');
const Notification = require('./Notification');
const User = require('./User');

const NotificationRead = sequelize.define('NotificationRead', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    notification_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: Notification, key: 'notification_id' }
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: User, key: 'user_id' }
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
    tableName: 'notification_reads',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['notification_id', 'user_id'],
        },
    ],
});

module.exports = NotificationRead;