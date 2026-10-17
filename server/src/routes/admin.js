const express = require('express');
const {
  getDashboardStats,
  getAllProviders,
  approveProvider,
  rejectProvider,
  getAllBookings,
  getAllUsers,
  deactivateUser,
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// All admin routes require ADMIN role
router.use(authenticate, authorize('ADMIN'));

// GET /api/admin/stats
router.get('/stats', getDashboardStats);

// GET /api/admin/providers
router.get('/providers', getAllProviders);

// PUT /api/admin/providers/:id/approve
router.put('/providers/:id/approve', approveProvider);

// PUT /api/admin/providers/:id/reject
router.put('/providers/:id/reject', rejectProvider);

// GET /api/admin/bookings
router.get('/bookings', getAllBookings);

// GET /api/admin/users
router.get('/users', getAllUsers);

// PUT /api/admin/users/:id/deactivate
router.put('/users/:id/deactivate', deactivateUser);

module.exports = router;
