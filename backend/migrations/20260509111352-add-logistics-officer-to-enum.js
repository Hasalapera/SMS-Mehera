'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 💡 Postgres වල ENUM එකකට අගයක් ඇඩ් කරන විදිහ
    return queryInterface.sequelize.query(
      `ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'logistics_officer'`
    );
  },

  down: async (queryInterface, Sequelize) => {
    // ⚠️ Postgres වල ENUM එකකින් අගයක් අයින් කරන එක ලේසි නැහැ. 
    // ඒ නිසා සාමාන්‍යයෙන් මේක හිස්ව තැබීම හෝ නෝට් එකක් දැමීම තමයි කරන්නේ.
    console.log('PostgreSQL does not support removing values from an ENUM easily.');
  }
};