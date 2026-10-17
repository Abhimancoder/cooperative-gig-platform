const express = require('express');
const { body } = require('express-validator');
const {
  getProviderProfile,
  updateProviderProfile,
  submitKyc,
  getAvailableProviders,
  updateAvailability,
  getProviderJobs,
  getProviderEarnings,
} = require('../controllers/providerController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { uploadKyc } = require('../middlewares/upload');

const router = express.Router();

// GET /api/providers - Get available providers (with smart matching)
router.get('/', getAvailableProviders);

// GET /api/providers/profile - Get own provider profile
router.get('/profile', authenticate, authorize('PROVIDER'), getProviderProfile);

// GET /api/providers/jobs - Get provider's jobs
router.get('/jobs', authenticate, authorize('PROVIDER'), getProviderJobs);

// GET /api/providers/earnings - Get provider's earnings
router.get('/earnings', authenticate, authorize('PROVIDER'), getProviderEarnings);

// PUT /api/providers/profile - Update provider profile
router.put(
  '/profile',
  authenticate,
  authorize('PROVIDER'),
  [
    body('bio').optional().trim(),
    body('skills').optional().isArray(),
    body('experience').optional().isInt({ min: 0 }),
    body('city').optional().trim(),
  ],
  validate,
  updateProviderProfile
);

// POST /api/providers/kyc - Submit KYC documents
router.post(
  '/kyc',
  authenticate,
  authorize('PROVIDER'),
  uploadKyc,
  submitKyc
);

// PUT /api/providers/availability - Toggle availability
router.put('/availability', authenticate, authorize('PROVIDER'), updateAvailability);

module.exports = router;
