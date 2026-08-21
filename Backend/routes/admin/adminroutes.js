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
const adminRequestRoutes = require('./adminRequestRoutes');
const adminResourceRoutes = require('./adminResourceRoutes');
const adminReservationRoutes = require('./adminReservationRoutes');
const adminSubEntryRoutes = require('./adminSubEntryRoutes');

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
router.use('/requests', adminRequestRoutes);
router.use('/resources', adminResourceRoutes);
router.use('/reservations', adminReservationRoutes);
router.use('/subentries', adminSubEntryRoutes);

module.exports = router;
