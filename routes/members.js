const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getAdminKycRequests,
  updateKycStatus,
  getAllMembersList,
  getMembersLocation,
  getMemberPerformance,
} = require('../controllers/membersController');

const router = express.Router();

router.use(protect);

router.get('/kyc-requests', authorize('admin'), getAdminKycRequests);
router.patch('/kyc-requests/:memberId/status', authorize('admin'), updateKycStatus);
router.get('/all-members', authorize('admin'), getAllMembersList);
router.get('/locations', authorize('admin'), getMembersLocation);
router.get('/performance', authorize('admin'), getMemberPerformance);

module.exports = router;