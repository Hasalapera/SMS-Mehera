'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add 'target' and 'product' values to notifications.type enum
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_notifications_type" ADD VALUE IF NOT EXISTS 'target';`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_notifications_type" ADD VALUE IF NOT EXISTS 'product';`
    );
  },

  async down(queryInterface, Sequelize) {
    // PostgreSQL enum values cannot be removed safely without recreating the type.
    // Keep the migration reversible by no-op on down.
  }
};
