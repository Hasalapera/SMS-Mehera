'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      light_logo_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      dark_logo_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      default_language: {
        type: Sequelize.STRING,
        defaultValue: 'en'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('settings');
  }
};