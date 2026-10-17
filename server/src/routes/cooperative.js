const express = require('express');
const { body } = require('express-validator');
const {
  getActiveVotes,
  getVoteById,
  castVote,
  createVote,
  closeVote,
  getWelfareFund,
  contributeToWelfare,
} = require('../controllers/cooperativeController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

const router = express.Router();

// GET /api/cooperative/votes - Get all active votes
router.get('/votes', authenticate, getActiveVotes);

// GET /api/cooperative/votes/:id
router.get('/votes/:id', authenticate, getVoteById);

// POST /api/cooperative/votes/:id/cast - Cast a vote (Cooperative members)
router.post(
  '/votes/:id/cast',
  authenticate,
  authorize('PROVIDER'),
  [body('selectedOption').notEmpty().withMessage('Selected option is required')],
  validate,
  castVote
);

// POST /api/cooperative/votes - Create a new vote (Admin)
router.post(
  '/votes',
  authenticate,
  authorize('ADMIN'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('options').isArray({ min: 2 }).withMessage('At least 2 options required'),
  ],
  validate,
  createVote
);

// PUT /api/cooperative/votes/:id/close - Close vote (Admin)
router.put('/votes/:id/close', authenticate, authorize('ADMIN'), closeVote);

// GET /api/cooperative/welfare - Get welfare fund details
router.get('/welfare', authenticate, authorize('PROVIDER'), getWelfareFund);

// POST /api/cooperative/welfare/contribute - Contribute to welfare fund
router.post(
  '/welfare/contribute',
  authenticate,
  authorize('PROVIDER'),
  [body('amount').isFloat({ min: 1 }).withMessage('Valid amount required')],
  validate,
  contributeToWelfare
);

module.exports = router;
