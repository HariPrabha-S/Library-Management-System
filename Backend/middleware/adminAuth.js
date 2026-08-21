const { authenticateToken, requireRole } = require('./auth');

const adminAuth = [
    authenticateToken,
    requireRole(['admin'])
];

module.exports = adminAuth;

