'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('notifications');

    if (!table.target_user_id) {
      await queryInterface.addColumn('notifications', 'target_user_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Optional user recipient for targeted notifications',
      });
    }

    if (!table.target_role) {
      await queryInterface.addColumn('notifications', 'target_role', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Optional role recipient for targeted notifications',
      });
    }

    const indexes = await queryInterface.showIndex('notifications');
    const indexNames = new Set(indexes.map(index => index.name));

    if (!indexNames.has('notifications_target_user_id_idx')) {
      await queryInterface.addIndex('notifications', ['target_user_id'], {
        name: 'notifications_target_user_id_idx',
      });
    }

    if (!indexNames.has('notifications_target_role_idx')) {
      await queryInterface.addIndex('notifications', ['target_role'], {
        name: 'notifications_target_role_idx',
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('notifications');
    const indexes = await queryInterface.showIndex('notifications');
    const indexNames = new Set(indexes.map(index => index.name));

    if (indexNames.has('notifications_target_role_idx')) {
      await queryInterface.removeIndex('notifications', 'notifications_target_role_idx');
    }

    if (indexNames.has('notifications_target_user_id_idx')) {
      await queryInterface.removeIndex('notifications', 'notifications_target_user_id_idx');
    }

    if (table.target_role) {
      await queryInterface.removeColumn('notifications', 'target_role');
    }

    if (table.target_user_id) {
      await queryInterface.removeColumn('notifications', 'target_user_id');
    }
  },
};
