const express = require('express');
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// GET /api/notifications
router.get('/', authenticate, getNotifications);

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticate, markAsRead);

// PUT /api/notifications/read-all
router.put('/read-all', authenticate, markAllAsRead);

module.exports = router;
