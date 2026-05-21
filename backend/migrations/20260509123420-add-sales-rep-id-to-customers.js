'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('customers', 'sales_rep_id', {
      type: Sequelize.UUID, // උඹේ යූසර් ID එක UUID නිසා මෙතනත් UUID වෙන්න ඕනේ
      allowNull: true,
      references: {
        model: 'users', // අදාළ ටේබල් එකේ නම
        key: 'user_id'   // අදාළ primary key එක
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // සේල්ස් රෙප් කෙනෙක් මැකුණොත් කස්ටමර් ඉතිරි වෙනවා, හැබැයි රෙප් ID එක null වෙනවා
    });
  },

  down: async (queryInterface, Sequelize) => {
    // මොකක් හරි වෙලා මයිග්‍රේෂන් එක undo කළොත් මේ column එක අයින් වෙන්න ඕනේ
    await queryInterface.removeColumn('customers', 'sales_rep_id');
  }
};