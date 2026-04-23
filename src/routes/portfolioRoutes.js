const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { portfolioUpload } = require('../middleware/uploadMiddleware');

router.use(authMiddleware);

router.get('/', portfolioController.getPortfolios);
router.post('/', portfolioUpload.single('image'), portfolioController.createPortfolio);
router.put('/:id', portfolioUpload.single('image'), portfolioController.updatePortfolio);
router.delete('/:id', portfolioController.deletePortfolio);

module.exports = router;
