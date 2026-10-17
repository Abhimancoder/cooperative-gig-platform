const express = require('express');
const { createOrder, verifyPayment, getPaymentHistory } = require('../controllers/paymentController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// POST /api/payments/create-order
router.post('/create-order', authenticate, createOrder);

// POST /api/payments/verify
router.post('/verify', authenticate, verifyPayment);

// GET /api/payments/history
router.get('/history', authenticate, getPaymentHistory);

// POST /api/payments/webhook (Razorpay webhook - no auth)
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  // Razorpay webhook handler - verify signature
  res.json({ received: true });
});

module.exports = router;
