const fs = require('fs');
const path = require('path');
const { sequelize } = require('../models');

const runMigrations = async () => {
    try {
        console.log('\n🔄 Starting migrations...\n');
        
        const migrationsDir = __dirname;
        const files = fs.readdirSync(migrationsDir)
            .filter(f => 
                f.startsWith('202') && 
                f.endsWith('.js') && 
                f !== 'migrator.js'
            )
            .sort();

        if (files.length === 0) {
            console.log('ℹ️  No migrations to run\n');
            return;
        }

        for (const file of files) {
            const migration = require(path.join(migrationsDir, file));
            console.log(`📋 Running: ${file}`);
            
            try {
                await migration.up(sequelize.queryInterface, sequelize.Sequelize);
                console.log(`✅ ${file} completed\n`);
            } catch (err) {
                if (err.message.includes('already exists')) {
                    console.log(`⏭️  ${file} already applied\n`);
                } else {
                    console.error(`❌ ${file} failed:`, err.message);
                    throw err;
                }
            }
        }
        
        console.log('✅ All migrations completed\n');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
};

const rollbackMigrations = async () => {
    try {
        console.log('\n⬅️ Rolling back migrations...\n');
        
        const migrationsDir = __dirname;
        const files = fs.readdirSync(migrationsDir)
            .filter(f => 
                f.startsWith('202') && 
                f.endsWith('.js') && 
                f !== 'migrator.js'
            )
            .sort()
            .reverse();

        for (const file of files) {
            const migration = require(path.join(migrationsDir, file));
            console.log(`📋 Rolling back: ${file}`);
            
            try {
                await migration.down(sequelize.queryInterface, sequelize.Sequelize);
                console.log(`✅ ${file} rolled back\n`);
            } catch (err) {
                console.error(`❌ ${file} rollback failed:`, err.message);
            }
        }
        
        console.log('✅ Rollback completed\n');
    } catch (err) {
        console.error('❌ Rollback failed:', err.message);
        process.exit(1);
    }
};

module.exports = { runMigrations, rollbackMigrations };