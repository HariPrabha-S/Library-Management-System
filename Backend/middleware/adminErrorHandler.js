const { sendError } = require('../utils/adminResponse');

const adminErrorHandler = (err, req, res, next) => {
    console.error('Unhandled Error:', err.message);
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Handle Sequelize validation errors
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        const errors = err.errors.map(e => e.message);
        return sendError(res, 'Validation Error', 400, errors);
    }

    return sendError(res, message, statusCode);
};

module.exports = adminErrorHandler;
