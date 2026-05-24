const express = require('express');
const { protect } = require('../middleware/auth');
const { getTransactionHistory } = require('../controllers/transactionsController');

const router = express.Router();

router.get('/', protect, getTransactionHistory);

module.exports = router;