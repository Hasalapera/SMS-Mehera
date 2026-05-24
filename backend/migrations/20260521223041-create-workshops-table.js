'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('workshops', {
      workshop_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      capacity: {
        type: Sequelize.STRING,
        allowNull: true
      },
      speakers: {
        type: Sequelize.STRING,
        allowNull: true
      },
      duration: {
        type: Sequelize.STRING,
        allowNull: true
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      type: {
        // ENUM එක PostgreSQL වලදී දාද්දී මෙන්න මේ විදිහටයි ලියන්නේ මචං 💡
        type: Sequelize.ENUM('flagship', 'past', 'series'),
        defaultValue: 'series',
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('workshops');
    
    // 💡 PostgreSQL වල ENUM එකක් drop කරද්දී ටේබල් එක විතරක් මදි, මුළු type එකම අයින් කරන්න ඕනේ
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_workshops_type";');
  }
};