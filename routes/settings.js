const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getPlanSetting, updatePlanSetting, getBankAccount, updateBankAccount } = require('../controllers/settingsController');

const router = express.Router();

router.use(protect);

router.get('/plan', authorize('admin'), getPlanSetting);
router.put('/plan', authorize('admin'), updatePlanSetting);
router.get('/bank-account', getBankAccount);
router.put('/bank-account', authorize('admin'), updateBankAccount);

module.exports = router;