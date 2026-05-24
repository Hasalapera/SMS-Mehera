'use strict';
const bcrypt = require('bcryptjs');
const { User } = require('../models'); 
require('dotenv').config();

module.exports = {
  async up(queryInterface, Sequelize) {
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error("Skipping Seed: Credentials missing in .env");
      return;
    }

    // 1. Checking if the user exists by email
    const existingUser = await User.findOne({ 
      where: { email: adminEmail } 
    });

    // 2. If the user already exists, nothing will be done.
    if (existingUser) {
      console.log(`\x1b[33m%s\x1b[0m`, `ℹ️  Skipping Seed: Admin (${adminEmail}) already exists in shared DB.`);
      return;
    }

    // 3. Create a new user only if it does not exist.
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await User.create({
      // auto generate id from sequilize model
      name: 'Hasala Perera',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      is_active: true
    });

    console.log(`\x1b[32m%s\x1b[0m`, `✅ Success: New Admin account created with auto-generated UUID.`);
  },

  async down(queryInterface, Sequelize) {
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
    if (adminEmail) {
      return User.destroy({ where: { email: adminEmail } });
    }
  }
};