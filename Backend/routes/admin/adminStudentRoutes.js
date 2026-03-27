const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/adminStudentController');

router.get('/', controller.getStudents);
router.post('/', controller.addStudent);
router.put('/:id', controller.editStudent);
router.delete('/bulk', controller.bulkDelete);
router.delete('/:id', controller.deleteStudent);
router.post('/bulk-upload', controller.bulkUpload);

module.exports = router;
