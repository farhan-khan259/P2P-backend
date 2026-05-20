const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getDepositRequests,
  updateDepositStatus,
} = require('../controllers/depositsController');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/', getDepositRequests);
router.patch('/:orderNo/status', updateDepositStatus);

module.exports = router;
