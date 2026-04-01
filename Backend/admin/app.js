const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('../config/db');

const app = express();

// Database connection
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Admin Routes
const adminRoutes = require('../routes/admin/adminroutes');
app.use('/api/admin', adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.send('Library Management System Backend is running...');
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

module.exports = app;
