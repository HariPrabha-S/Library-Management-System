const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/adminReservationController');

router.get('/my-reservations', controller.getMyReservations);
router.post('/reserve', controller.createReservation);
router.post('/cancel/:id', controller.cancelReservation);
router.get('/admin-list', controller.getAdminReservations);
router.post('/collect/:id', controller.collectReservedBook);
router.get('/notifications', controller.getNotifications);
router.put('/notifications/:id/read', controller.markNotificationRead);

module.exports = router;
