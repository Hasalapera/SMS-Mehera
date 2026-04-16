const { DataTypes } = require('sequelize');
const sequelize = require('../db/db');

const CustomerNote = sequelize.define('CustomerNote', {
    note_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: 'note_id'
    },
    customer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'customer_id'
    },
    note_text: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'note_text'
    },
    tag: {
        type: DataTypes.ENUM('payment', 'behavior', 'general'),
        defaultValue: 'general',
        allowNull: false,
        field: 'tag'
    },
    added_by: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'added_by'
    },
    role: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'role'
    }
}, {
    tableName: 'customer_notes',
    timestamps: true,
    underscored: true,
    paranoid: true,
    deletedAt: 'deleted_at',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = CustomerNote;
