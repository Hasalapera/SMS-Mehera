'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
      notification_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      type: {
        type: Sequelize.ENUM('stock', 'customer', 'user', 'order'),
        allowNull: false,
        comment: 'Type of notification'
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Short notification title'
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Full notification message'
      },
      reference_id: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'ID of related entity'
      },
      severity: {
        type: Sequelize.ENUM('info', 'warning', 'critical'),
        allowNull: false,
        defaultValue: 'info',
        comment: 'Notification severity level'
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      read_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notifications');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_notifications_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_notifications_severity";');
  }
};