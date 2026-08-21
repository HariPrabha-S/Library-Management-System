const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

async function run() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        await queryInterface.addColumn('students', 'is_locked', {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        });
        console.log("Column is_locked added successfully");
    } catch(e) {
        if (e.name === 'SequelizeDatabaseError' && e.message.includes('Duplicate column name')) {
            console.log("Column already exists");
        } else {
            console.error(e);
        }
    } finally {
        process.exit();
    }
}

run();
