const express = require('express');
const router = express.Router();
const {
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
