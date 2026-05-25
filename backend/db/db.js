const { Sequelize } = require('sequelize');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  // Professional Optimization: Connection Pooling
  pool: {
    max: isProduction ? 15 : 5,  // Production එකේදී connections ගාණ වැඩි කරනවා, Local එකේදී 5ක් ඇති
    min: 0,
    acquire: 30000,   // connection එකක් ගන්න උපරිම තත්පර 30ක් බලනවා
    idle: 10000       // පාවිච්චි නොවන connection එකක් තත්පර 10කින් නිවා දමනවා
  },
  dialectOptions: {
    // DBeaver සහ Live Remote DB දෙකටම SSL අවශ්‍ය නිසා require: true ලෙසම තබා ඇත
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  // Development වලදී විතරක් SQL logs පෙන්වන්න
  logging: isProduction ? false : console.log,
});

sequelize.authenticate()
  .then(() => console.log('Successfully connected to PostgreSQL!'))
  .catch(err => console.error('Unable to connect to the database:', err));

module.exports = sequelize;