// 📄 Migration file ekka updated fields (address -> TEXT, gender -> ENUM with 'other')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 🏠 Address column eka Users table ekata TEXT type eken add karanawa (Diga address unath crash wenne na)
    await queryInterface.addColumn('users', 'address', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // 👫 Gender ENUM column eka 'male', 'female', 'other' options ekka add karanawa
    await queryInterface.addColumn('users', 'gender', {
      type: Sequelize.ENUM('male', 'female', 'other'),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 🔄 Revert/Rollback kaloth column dekama database eken ain karanna meika oni වෙනවා
    await queryInterface.removeColumn('users', 'address');
    await queryInterface.removeColumn('users', 'gender');
  }
};