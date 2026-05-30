const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createDepositRequest,
  getDepositRequests,
  getMyDepositRequests,
  getDepositSummary,
  updateDepositStatus,
} = require('../controllers/depositsController');

const router = express.Router();

router.use(protect);

router.post('/', createDepositRequest);
router.get('/me', getMyDepositRequests);
router.get('/summary', getDepositSummary);
router.get('/', authorize('admin'), getDepositRequests);
router.patch('/:orderNo/status', authorize('admin'), updateDepositStatus);

module.exports = router;
