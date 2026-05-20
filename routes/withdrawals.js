const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createWithdrawalRequest,
  getWithdrawalRequests,
  getWithdrawalSummary,
  updateWithdrawalStatus,
} = require('../controllers/withdrawalsController');

const router = express.Router();

router.use(protect);

router.post('/', createWithdrawalRequest);
router.get('/me', getWithdrawalRequests);
router.get('/summary', getWithdrawalSummary);
router.get('/admin', authorize('admin'), getWithdrawalRequests);
router.patch('/:requestId/status', authorize('admin'), updateWithdrawalStatus);

module.exports = router;
