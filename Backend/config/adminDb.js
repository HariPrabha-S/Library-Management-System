const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize instance
const sequelize = new Sequelize(
    process.env.DB_NAME || 'lms_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false, // Set to true to see SQL queries in console
    }
);

// Helper function to test connection
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL Database connected successfully via Sequelize.');
        
        // Sync models (creates tables if they don't exist based on the defined schema)
        // Caution in production: alter: true might inadvertently drop columns if schema changes
        await sequelize.sync({ alter: true });
        console.log('All models were synchronized successfully.');

    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }
};

module.exports = { sequelize, connectDB };
