const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../../controllers/auth.controller');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/authenticate');
const {
  registerSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
} = require('../../validators/auth.validator');

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
});

const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { success: false, message: 'Too many OTP requests. Wait a minute.' },
});

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.post('/otp/send', otpLimiter, validate(sendOtpSchema), authController.sendOtp);
router.post('/otp/verify', otpLimiter, validate(verifyOtpSchema), authController.verifyOtp);

module.exports = router;
