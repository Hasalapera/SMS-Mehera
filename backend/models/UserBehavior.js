const { DataTypes } = require('sequelize');
const sequelize = require('../db/db');
const User = require('./User'); // User model එක import කරගන්න

const UserBehavior = sequelize.define('UserBehavior', {
    note_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'user_id',
        },
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'ID of the Admin or Manager who recorded this'
    },
    behavior_category: {
        type: DataTypes.ENUM('Excellent', 'Good', 'Average', 'Poor', 'Warning'),
        allowNull: false,
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    current_status: {
        type: DataTypes.ENUM('new', 'active', 'inactive'),
        defaultValue: 'active',
    },
    role: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    tableName: 'user_behaviors',
    timestamps: true,
    paranoid: true,
    underscored: true,
});

module.exports = UserBehavior;