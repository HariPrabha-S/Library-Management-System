const express = require('express');
const cors = require('cors');
require('express-async-errors'); // To catch unhandled async exceptions

const adminErrorHandler = require('./middleware/adminErrorHandler');

// Import routers
const adminRoutes = require('./routes/admin/adminRoutes');
// const studentRoutes = require('./routes/student/studentRoutes'); // Assuming placeholders for later
// const facultyRoutes = require('./routes/faculty/facultyRoutes'); // Assuming placeholders for later

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Admin Routes Prefix
app.use('/api/admin', adminRoutes);

// Other Routes (For Student and Faculty teams to configure later)
// app.use('/api/student', studentRoutes);
// app.use('/api/faculty', facultyRoutes);

// 404 handler for undefined routes
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: 'API Route Not Found' });
});

// Global Error Handler
app.use(adminErrorHandler);

module.exports = app;
