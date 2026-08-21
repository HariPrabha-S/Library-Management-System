const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/adminResourceController');

router.get('/', controller.listResources);
router.get('/:id', controller.getResourceDetails);
router.post('/', controller.createResource);
router.put('/:id', controller.updateResource);
router.put('/:id/approve', controller.approveResource);
router.put('/:id/reject', controller.rejectResource);
router.delete('/:id', controller.deleteResource);

module.exports = router;
