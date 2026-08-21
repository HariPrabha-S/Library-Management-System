const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/adminRequestController');

router.get('/', controller.getRequests);
router.post('/approve/:id', controller.approveRequest);
router.post('/reject/:id', controller.rejectRequest);
router.delete('/:id', controller.deleteRequest);

module.exports = router;
