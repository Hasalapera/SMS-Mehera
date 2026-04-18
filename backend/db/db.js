const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  ssl: true,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

// Test connection
sequelize.authenticate()
  .then(() => console.log('✓ Successfully connected to PostgreSQL via Sequelize!'))
  .catch(err => console.error('Unable to connect to the database:', err));

module.exports = sequelize;