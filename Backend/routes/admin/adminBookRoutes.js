const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/adminBookController');

router.get('/', controller.getBooks);
router.post('/', controller.addBook);
router.put('/:id', controller.editBook);
router.delete('/bulk', controller.bulkDelete);
router.delete('/:id', controller.deleteBook);
router.post('/bulk-upload', controller.bulkUpload);

module.exports = router;
