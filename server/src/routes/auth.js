const express = require('express');
const { body } = require('express-validator');
const { register, login, verifyOtp, refreshToken, getMe, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

const router = express.Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid Indian phone number required'),
    body('role').isIn(['CUSTOMER', 'PROVIDER']).withMessage('Role must be CUSTOMER or PROVIDER'),
  ],
  validate,
  register
);

// POST /api/auth/login
router.post(
  '/login',
  [body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid Indian phone number required')],
  validate,
  login
);

// POST /api/auth/verify-otp
router.post(
  '/verify-otp',
  [
    body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid Indian phone number required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  validate,
  verifyOtp
);

// POST /api/auth/refresh-token
router.post('/refresh-token', refreshToken);

// GET /api/auth/me
router.get('/me', authenticate, getMe);

// PUT /api/auth/profile
router.put('/profile', authenticate, updateProfile);

module.exports = router;
