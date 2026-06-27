'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_behaviors', {
      note_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'user_id' },
        onDelete: 'CASCADE'
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'user_id' }
      },
      behavior_category: {
        type: Sequelize.ENUM('Excellent', 'Good', 'Average', 'Poor', 'Warning'),
        allowNull: false
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      current_status: {
        type: Sequelize.ENUM('new', 'active', 'inactive'),
        defaultValue: 'active'
      },
      role: {
        type: Sequelize.STRING,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_behaviors');
  }
};