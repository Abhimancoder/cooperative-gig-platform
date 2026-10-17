const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  addReview,
} = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

const router = express.Router();

// POST /api/bookings - Create a new booking (Customer)
router.post(
  '/',
  authenticate,
  authorize('CUSTOMER'),
  [
    body('serviceId').notEmpty().withMessage('Service ID is required'),
    body('scheduledAt').isISO8601().withMessage('Valid date required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  ],
  validate,
  createBooking
);

// GET /api/bookings - Get my bookings
router.get('/', authenticate, getMyBookings);

// GET /api/bookings/:id
router.get('/:id', authenticate, getBookingById);

// PUT /api/bookings/:id/status - Update status (Provider)
router.put(
  '/:id/status',
  authenticate,
  authorize('PROVIDER', 'ADMIN'),
  [body('status').isIn(['ACCEPTED', 'IN_PROGRESS', 'COMPLETED']).withMessage('Invalid status')],
  validate,
  updateBookingStatus
);

// PUT /api/bookings/:id/cancel - Cancel booking
router.put(
  '/:id/cancel',
  authenticate,
  [body('reason').optional().trim()],
  validate,
  cancelBooking
);

// POST /api/bookings/:id/review - Add review (Customer)
router.post(
  '/:id/review',
  authenticate,
  authorize('CUSTOMER'),
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1-5'),
    body('comment').optional().trim(),
  ],
  validate,
  addReview
);

module.exports = router;
