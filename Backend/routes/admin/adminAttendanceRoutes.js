const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/adminAttendanceController');

router.get('/', controller.getTodayAttendance);
router.post('/scan', controller.scanId);
router.put('/move-out', controller.moveOut);
router.delete('/clear-out', controller.clearOut); // Uses query params or clears all out for the day

module.exports = router;
