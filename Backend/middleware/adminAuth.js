const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/adminResponse');

// NOTE: Since the frontend doesn't have login set up yet (or we haven't implemented it yet),
// this middleware might block requests when testing the dashboard endpoints.
// We can temporarily bypass it by checking an environment variable or commenting it out.

const adminAuth = (req, res, next) => {
    // TEMPORARY BYPASS for development ease if no token is planned immediately
    // If you want to enforce auth right away, remove this return next();
    if (process.env.NODE_ENV !== 'production' && !process.env.ENFORCE_AUTH) {
        req.admin = { id: 1, role: 'admin' };
        return next();
    }

    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendError(res, 'Authorization token missing or invalid format', 401);
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return sendError(res, 'No token provided', 401);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach admin info to request
        req.admin = decoded;
        
        next();
    } catch (error) {
        return sendError(res, 'Invalid or expired token', 401);
    }
};

module.exports = adminAuth;
