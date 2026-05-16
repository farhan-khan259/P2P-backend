const express = require('express');
const {
  getProfile,
  updateProfile,
  updateBankDetails,
  updatePaymentDetails,
  updateNomineeDetails,
  changePassword,
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

// Get user profile
router.get('/me', getProfile);

// Update profile
router.put('/update', updateProfile);

// Update bank details
router.put('/bank-details', updateBankDetails);

// Update payment details
router.put('/payment-details', updatePaymentDetails);

// Update nominee details
router.put('/nominee-details', updateNomineeDetails);

// Change password
router.put('/change-password', changePassword);

module.exports = router;
