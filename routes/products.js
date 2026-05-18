const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getProducts,
  getProductById,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
  checkoutCart,
  getOrders,
  getOrderByNo,
  getAdminOrders,
  updateOrderStatus,
} = require('../controllers/productsController');

const router = express.Router();

router.get('/products', getProducts);

router.use(protect);

router.get('/products/admin/list', authorize('admin'), getAdminProducts);

router.post('/products/admin', authorize('admin'), createProduct);
router.put('/products/admin/:productId', authorize('admin'), updateProduct);
router.delete('/products/admin/:productId', authorize('admin'), deleteProduct);

router.get('/cart', getCart);
router.post('/cart/items', addCartItem);
router.patch('/cart/items/:productId', updateCartItem);
router.delete('/cart/items/:productId', removeCartItem);
router.delete('/cart', clearCart);

router.get('/orders', getOrders);
router.post('/orders/checkout', checkoutCart);
router.get('/orders/:orderNo', getOrderByNo);
router.get('/admin/orders', authorize('admin'), getAdminOrders);
router.patch('/admin/orders/:orderNo/status', authorize('admin'), updateOrderStatus);

router.get('/products/:productId', getProductById);

module.exports = router;