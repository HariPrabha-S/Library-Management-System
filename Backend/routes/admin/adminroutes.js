const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');

// Import individual route modules
const adminDashboardRoutes = require('./adminDashboardRoutes');
const adminBookRoutes = require('./adminBookRoutes');
const adminStudentRoutes = require('./adminStudentRoutes');
const adminFacultyRoutes = require('./adminFacultyRoutes');
const adminIssueRoutes = require('./adminIssueRoutes');
const adminFineRoutes = require('./adminFineRoutes');
const adminAttendanceRoutes = require('./adminAttendanceRoutes');
const adminRequestRoutes = require('./adminRequestRoutes');

// Apply authentication middleware to all admin routes
// We bypass in development if not strictly testing auth
router.use(adminAuth);

// Mount routes
router.use('/dashboard', adminDashboardRoutes);
router.use('/books', adminBookRoutes);
router.use('/students', adminStudentRoutes);
router.use('/faculties', adminFacultyRoutes);
router.use('/issues', adminIssueRoutes);
router.use('/fines', adminFineRoutes);
router.use('/attendance', adminAttendanceRoutes);
router.use('/requests', adminRequestRoutes);

module.exports = router;
