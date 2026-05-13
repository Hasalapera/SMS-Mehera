module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    'Notification',
    {
      notification_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      type: {
        type: DataTypes.ENUM('stock', 'customer', 'user', 'order'),
        allowNull: false,
        comment: 'Type of notification',
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Short notification title',
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Full notification message',
      },
      reference_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'ID of related entity (product_id, customer_id, etc)',
      },
      severity: {
        type: DataTypes.ENUM('info', 'warning', 'critical'),
        defaultValue: 'info',
        comment: 'For stock: info (ok), warning (low), critical (out)',
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      read_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'notifications',
      timestamps: true,
      paranoid: true, // Soft delete enabled
      underscored: true,
    }
  );

  return Notification;
};