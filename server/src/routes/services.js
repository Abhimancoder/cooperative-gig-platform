const express = require('express');
const { getServices, getServiceById, createService, updateService, deleteService } = require('../controllers/serviceController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// GET /api/services
router.get('/', getServices);

// GET /api/services/:id
router.get('/:id', getServiceById);

// POST /api/services (Admin only)
router.post('/', authenticate, authorize('ADMIN'), createService);

// PUT /api/services/:id (Admin only)
router.put('/:id', authenticate, authorize('ADMIN'), updateService);

// DELETE /api/services/:id (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), deleteService);

module.exports = router;
