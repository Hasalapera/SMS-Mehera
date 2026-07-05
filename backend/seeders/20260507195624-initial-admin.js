'use strict';
const bcrypt = require('bcryptjs');
const { User } = require('../models'); 
require('dotenv').config();

// This seeder creates an initial admin user if it doesn't already exist in the database.
// The admin's email and password are taken from environment variables for security reasons.
// The password is hashed before being stored in the database.
// The seeder checks if the admin user already exists by email. If it does, it skips creation.
// If the admin user does not exist, it creates a new user with the role of 'admin' and sets the is_active flag to true.
// The seeder also provides a down function to remove the admin user if needed, based on the email provided in the environment variables.
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