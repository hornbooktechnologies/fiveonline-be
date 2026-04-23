const express = require('express');
const router = express.Router();
const caseStudyController = require('../controllers/caseStudyController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.get('/', caseStudyController.getAll);
router.get('/:page_url', caseStudyController.getByPageUrl);
router.get('/id/:id', caseStudyController.getById);

// Protected routes
router.post('/', authMiddleware, caseStudyController.create);
router.put('/:id', authMiddleware, caseStudyController.update);
router.delete('/:id', authMiddleware, caseStudyController.delete);

module.exports = router;
