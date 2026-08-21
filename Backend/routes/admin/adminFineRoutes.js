const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/adminFineController');

router.get('/', controller.getFines);
router.put('/:id/clear', controller.clearFine);

module.exports = router;
