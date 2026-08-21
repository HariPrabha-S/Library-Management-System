const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/adminBookController');

router.get('/', controller.getBooks);
router.post('/export', controller.exportBooks);
router.get('/accession/:accessionNo', controller.getBookByAccession);
router.post('/', controller.addBook);
router.put('/:id', controller.editBook);
router.delete('/bulk', controller.bulkDelete);
router.delete('/:id', controller.deleteBook);
router.post('/bulk-upload', controller.bulkUpload);
router.post('/:id/copies', controller.addCopies);
router.get('/:id/copies', controller.getBookCopies);

module.exports = router;
