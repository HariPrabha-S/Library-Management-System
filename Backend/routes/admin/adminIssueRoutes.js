const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/adminIssueController');

router.get('/', controller.getIssues);
router.post('/', controller.issueBook);
router.put('/:id/return', controller.returnBook);
router.put('/:id/revert', controller.revertReturn);

module.exports = router;
