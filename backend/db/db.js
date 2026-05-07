const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  // Professional Optimization: Connection Pooling
  pool: {
    max: 5,           // උපරිම connections 5ක් (Render වගේ free/low tier DB වලට ගැලපෙනවා)
    min: 0,
    acquire: 30000,   // connection එකක් ගන්න උපරිම තත්පර 30ක් බලනවා
    idle: 10000       // පාවිච්චි නොවන connection එකක් තත්පර 10කින් නිවා දමනවා
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  // Development වලදී විතරක් SQL logs පෙන්වන්න
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

sequelize.authenticate()
  .then(() => console.log('Successfully connected to PostgreSQL!'))
  .catch(err => console.error('Unable to connect to the database:', err));

module.exports = sequelize;