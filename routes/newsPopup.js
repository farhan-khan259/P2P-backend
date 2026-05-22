const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getNewsPopupList, createNewsPopup, updateNewsPopup, deleteNewsPopup } = require('../controllers/newsPopupController');

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin'), getNewsPopupList);
router.post('/', authorize('admin'), createNewsPopup);
router.put('/:newsId', authorize('admin'), updateNewsPopup);
router.delete('/:newsId', authorize('admin'), deleteNewsPopup);

module.exports = router;