const { Sequelize } = require('sequelize');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  // Professional Optimization: Connection Pooling
  pool: {
    max: isProduction ? 15 : 5,  // Increase connections in production, 5 is enough for local
    min: 0,
    acquire: 30000,   // Wait a maximum of 30 seconds to get a connection
    idle: 10000       // Close an unused connection after 10 seconds
  },
  dialectOptions: {
    // SSL is required for both DBeaver and the live remote DB, so require: true is kept
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  // Show SQL logs only in development
  logging: isProduction ? false : console.log,
});

sequelize.authenticate()
  .then(() => console.log('Successfully connected to PostgreSQL!'))
  .catch(err => console.error('Unable to connect to the database:', err));

module.exports = sequelize;