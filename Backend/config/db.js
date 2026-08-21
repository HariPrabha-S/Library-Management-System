const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            timezone: 'local',
        },
        define: {
            underscored: true,
        },
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully');
        const { Reservation, Notification, Department, Language, Vendor, Subject, Holiday, Publisher } = require('../models/admin/adminmodels');
        await Reservation.sync();
        await Notification.sync();
        await Promise.all([Department.sync(), Language.sync(), Vendor.sync(), Subject.sync(), Holiday.sync(), Publisher.sync()]);
        const queryInterface = sequelize.getQueryInterface();
        const columns = await queryInterface.describeTable('books');
        const references = [
            ['department_id', 'departments'], ['language_id', 'languages'], ['subject_id', 'subjects'],
            ['publisher_id', 'publishers'], ['vendor_id', 'vendors']
        ];
        for (const [column, table] of references) {
            if (!columns[column]) {
                await queryInterface.addColumn('books', column, { type: Sequelize.INTEGER, allowNull: true });
            }
            const constraints = await queryInterface.getForeignKeyReferencesForTable('books');
            if (!constraints.some((constraint) => constraint.columnName === column)) {
                await queryInterface.addConstraint('books', {
                    fields: [column], type: 'foreign key', name: `fk_books_${column}`,
                    references: { table, field: 'id' }, onDelete: 'RESTRICT', onUpdate: 'CASCADE'
                });
            }
        }
    } catch (error) {
        console.error('Database connection failed:', error.message || error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
