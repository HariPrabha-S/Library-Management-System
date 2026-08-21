const express = require('express');
const controller = require('../../controllers/admin/adminSubEntryController');
const router = express.Router();

const validTypes = new Set(['departments', 'languages', 'vendors', 'subjects', 'holidays', 'publishers']);
router.param('type', (req, res, next, type) => {
  if (!validTypes.has(type)) return res.status(404).json({ success: false, message: 'Sub-entry type not found' });
  next();
});

router.get('/:type', controller.list);
router.get('/:type/:id', controller.get);
router.post('/:type', controller.create);
router.put('/:type/:id', controller.update);
router.delete('/:type/:id', controller.remove);

module.exports = router;
