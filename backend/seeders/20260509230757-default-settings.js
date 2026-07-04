'use strict';

// This seeder inserts default settings into the 'settings' table in the database.
// It is designed to be run once to initialize the settings with default values.
// The seeder provides an 'up' function to insert the default settings and a 'down' function to remove them if needed.
// The default settings include light and dark logo URLs and a default language setting.
// The 'up' function uses the Sequelize queryInterface to perform a bulk insert operation, while the 'down' function performs a bulk delete operation to remove the inserted settings.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up (queryInterface, Sequelize) {
        return queryInterface.bulkInsert('settings', [{
      light_logo_url: '', 
      dark_logo_url: '',
      default_language: 'en',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  // The 'down' function is used to revert the changes made by the 'up' function. In this case, it deletes all entries from the 'settings' table, effectively removing the default settings that were inserted. This is useful for rolling back the database to its previous state if needed.
  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('settings', null, {});
  }
};
