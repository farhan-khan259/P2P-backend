const express = require('express');
const {
  getProfile,
  updateProfile,
  updateBankDetails,
  updatePaymentDetails,
  updateKycRequest,
  updateNomineeDetails,
  updateTransactionPassword,
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

// Submit/update KYC request
router.put('/kyc-request', updateKycRequest);

// Update transaction password
router.put('/transaction-password', updateTransactionPassword);

// Update nominee details
router.put('/nominee-details', updateNomineeDetails);

// Change password
router.put('/change-password', changePassword);

module.exports = router;
