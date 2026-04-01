const { connectDB, sequelize } = require('../config/db');

async function testConnection() {
    try {
        console.log('--- Database Connection Test ---');
        await connectDB();
        console.log('Checking tables in database...');
        const [results] = await sequelize.query('SHOW TABLES');
        console.log('Found tables:', results.map(r => Object.values(r)[0]));
        console.log('--- Test Finished Successfully ---');
        process.exit(0);
    } catch (err) {
        console.error('--- Test Failed ---');
        console.error(err);
        process.exit(1);
    }
}

testConnection();
