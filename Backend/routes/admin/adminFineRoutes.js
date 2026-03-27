const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/adminFineController');

router.get('/', controller.getFines);
router.put('/:id/clear', controller.clearFine);
router.put('/:id/revert', controller.revertFine);

module.exports = router;
