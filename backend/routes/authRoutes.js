const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');

router.post('/send-otp', authController.sendOtp);
router.post('/resend-otp', authController.resendOtp); 
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
