const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/adminDashboardController');

router.get('/stats', controller.getStats);
router.get('/overdue', controller.getOverduePriority);
router.get('/requests', controller.getRequests);
router.get('/recent', controller.getRecentTransactions);

module.exports = router;
