const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login endpoint - unified for all roles
router.post('/login', authController.login);

// Verify token endpoint
router.get('/verify', authController.verifyToken, (req, res) => {
    res.json({ 
        success: true, 
        user: req.user 
    });
});

module.exports = router;
