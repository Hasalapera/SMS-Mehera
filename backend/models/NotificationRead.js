module.exports = (sequelize, DataTypes) => {
  const NotificationRead = sequelize.define(
    'NotificationRead',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      notification_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'Reference to notification',
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'Reference to user who read the notification',
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
      tableName: 'notification_reads',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          // One record per user per notification
          unique: true,
          fields: ['notification_id', 'user_id'],
        },
      ],
    }
  );

  return NotificationRead;
};