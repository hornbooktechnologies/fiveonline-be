const express = require('express');
const router = express.Router();
const masterController = require('../controllers/masterController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All routes use :type to distinguish between industries, revenue-goals, etc.
router.use(authMiddleware);

router.get('/:type', masterController.getMasters);
router.post('/:type', masterController.createMaster);
router.put('/:type/:id', masterController.updateMaster);
router.patch('/:type/reorder', masterController.updateOrder);
router.delete('/:type/:id', masterController.deleteMaster);

module.exports = router;
