'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sales_targets', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      sales_rep_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users', // 💡 උඹේ DB එකේ users table එකේ නම (lowercase/plural) බලලා දාපන්
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      month: {
        type: Sequelize.STRING(7),
        allowNull: false,
      },
      active_customer_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      density_factor: {
        type: Sequelize.DECIMAL(4, 2),
        defaultValue: 1.00,
        allowNull: false,
      },
      base_target_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      adjusted_target_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      achieved_amount: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00,
        allowNull: false,
      },
      is_achieved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });

    // 🔒 Adding Unique Constraint for security block
    await queryInterface.addIndex('sales_targets', ['sales_rep_id', 'month'], {
      unique: true,
      name: 'unique_rep_month_target'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sales_targets');
  }
};