// p2pbackend/routes/auth.js

const express = require('express');
const { body, validationRules } = require('express-validator');
const { registerUser, loginUser, getMe, getSponsorDetails } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 * Validation: name (non-empty), email (valid email format), password (min 6 chars)
 */
router.post(
  '/register',
  [
    body('name', 'Name is required and must be a string').trim().notEmpty(),
    body('email', 'Please provide a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  registerUser
);

/**
 * POST /api/auth/login
 * Login user and receive JWT token
 * Validation: email (valid email format), password (required)
 */
router.post(
  '/login',
  [
    body('email', 'Please provide a valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required').notEmpty(),
  ],
  loginUser
);

/**
 * GET /api/auth/me
 * Get current logged-in user profile
 * Protected route (requires valid JWT token)
 */
router.get('/me', protect, getMe);

/**
 * GET /api/auth/sponsor/:id
 * Get sponsor details by member ID or sponsor ID
 * Public route (no authentication required)
 */
router.get('/sponsor/:id', getSponsorDetails);

module.exports = router;
