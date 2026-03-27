const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/adminFacultyController');

router.get('/', controller.getFaculties);
router.post('/', controller.addFaculty);
router.put('/:id', controller.editFaculty);
router.delete('/bulk', controller.bulkDelete);
router.delete('/:id', controller.deleteFaculty);
router.post('/bulk-upload', controller.bulkUpload);

module.exports = router;
