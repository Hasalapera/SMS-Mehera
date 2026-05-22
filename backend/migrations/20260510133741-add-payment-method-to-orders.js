'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. මුලින්ම ENUM එක Database එකේ create කරගන්නවා
    await queryInterface.addColumn('orders', 'payment_method', {
      type: Sequelize.ENUM('cash', 'credit'),
      allowNull: false,
      defaultValue: 'cash',
      comment: 'Payment method for the order'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Column එක අයින් කරනවා
    await queryInterface.removeColumn('orders', 'payment_method');
    
    // 2. ENUM එක Database එකෙන් සම්පූර්ණයෙන්ම අයින් කරනවා (PostgreSQL වලදී වැදගත්)
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_payment_method";');
  }
};