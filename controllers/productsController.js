const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const User = require('../models/User');
const productSeedData = require('../data/productSeedData');

const productToApiShape = (product) => ({
  id: product._id,
  _id: product._id,
  type: product.type,
  productCode: product.productCode,
  productName: product.productName,
  name: product.productName,
  category: product.category,
  hsnCode: product.hsnCode,
  mrp: product.mrp,
  dpPrice: product.dpPrice,
  price: product.dpPrice,
  discount: product.discount,
  gst: product.gst,
  shipping: product.shipping,
  bvPoint: product.bvPoint,
  bv: product.bvPoint,
  levelPoint: product.levelPoint,
  levelPlan: product.levelPoint,
  quantity: product.quantity,
  status: product.status,
  stock: product.quantity > 0 && product.status === 'SHOWING' ? 'In Stock' : 'Out of Stock',
  imageKey: product.imageKey || product.images?.[0] || '',
  images: product.images || [],
  description: product.description,
  specifications: product.specifications,
  features: product.features,
  size: product.size,
  color: product.color,
  weight: product.weight,
  dimension: product.dimension,
});

const getQueryType = (req) => String(req.query.type || '').trim().toLowerCase();

const buildOrderNo = async () => {
  let orderNo = '';
  let isUnique = false;

  while (!isUnique) {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    orderNo = `ORD${suffix}`;
    const existing = await Order.findOne({ orderNo });
    if (!existing) {
      isUnique = true;
    }
  }

  return orderNo;
};

const buildShippingInformation = (user) => [
  { label: 'Name', value: user?.name || '---' },
  { label: 'Contact No', value: user?.contactNo || '---' },
  { label: 'Address', value: user?.address || '---' },
  { label: 'Area', value: user?.city || user?.district || '---' },
  { label: 'State,City', value: [user?.state, user?.city].filter(Boolean).join(' , ') || '---' },
  { label: 'Pin Code', value: user?.pincode || '---' },
];

const findProduct = async (identifier) => {
  if (!identifier) {
    return null;
  }

  return Product.findOne({
    $or: [{ _id: identifier }, { productCode: identifier }],
  });
};

const toNumber = (value, fallback = 0) => {
  const normalized = String(value ?? '').trim().toLowerCase();

  if (!normalized || normalized === 'free') {
    return fallback;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
};

exports.seedProducts = async () => {
  const existingCount = await Product.countDocuments();
  if (existingCount > 0) {
    return;
  }

  await Product.insertMany(productSeedData);
};

exports.getProducts = async (req, res) => {
  try {
    const type = getQueryType(req);
    const filter = {};

    if (type) {
      filter.type = type;
    }

    const products = await Product.find(filter).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products: products.map(productToApiShape),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await findProduct(req.params.productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, product: productToApiShape(product) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminProducts = async (req, res) => {
  return exports.getProducts(req, res);
};

exports.createProduct = async (req, res) => {
  try {
    const payload = req.body || {};

    if (!payload.productCode || !payload.productName || !payload.type) {
      return res.status(400).json({
        success: false,
        message: 'productCode, productName, and type are required',
      });
    }

    const exists = await Product.findOne({ productCode: payload.productCode });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Product code already exists',
      });
    }

    const product = await Product.create({
      type: payload.type,
      productCode: payload.productCode,
      productName: payload.productName,
      category: payload.category || 'General',
      hsnCode: payload.hsnCode || '0000',
      mrp: toNumber(payload.mrp),
      dpPrice: toNumber(payload.dpPrice),
      discount: toNumber(payload.discount),
      gst: toNumber(payload.gst),
      shipping: toNumber(payload.shipping),
      bvPoint: toNumber(payload.bvPoint),
      levelPoint: toNumber(payload.levelPoint),
      quantity: toNumber(payload.quantity),
      status: payload.status || 'SHOWING',
      imageKey: payload.imageKey || payload.images?.[0] || '',
      images: Array.isArray(payload.images) ? payload.images : [],
      description: payload.description || '',
      specifications: payload.specifications || '',
      features: payload.features || '',
      size: payload.size || '',
      color: payload.color || '',
      weight: payload.weight || '',
      dimension: payload.dimension || '',
    });

    res.status(201).json({ success: true, product: productToApiShape(product) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await findProduct(req.params.productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updates = req.body || {};
    const fields = [
      'type',
      'productCode',
      'productName',
      'category',
      'hsnCode',
      'mrp',
      'dpPrice',
      'discount',
      'gst',
      'shipping',
      'bvPoint',
      'levelPoint',
      'quantity',
      'status',
      'imageKey',
      'images',
      'description',
      'specifications',
      'features',
      'size',
      'color',
      'weight',
      'dimension',
    ];

    fields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(updates, field)) {
        product[field] = updates[field];
      }
    });

    if (updates.mrp !== undefined) product.mrp = toNumber(updates.mrp);
    if (updates.dpPrice !== undefined) product.dpPrice = toNumber(updates.dpPrice);
    if (updates.discount !== undefined) product.discount = toNumber(updates.discount);
    if (updates.gst !== undefined) product.gst = toNumber(updates.gst);
    if (updates.shipping !== undefined) product.shipping = toNumber(updates.shipping);
    if (updates.bvPoint !== undefined) product.bvPoint = toNumber(updates.bvPoint);
    if (updates.levelPoint !== undefined) product.levelPoint = toNumber(updates.levelPoint);
    if (updates.quantity !== undefined) product.quantity = toNumber(updates.quantity);

    await product.save();

    res.status(200).json({ success: true, product: productToApiShape(product) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await findProduct(req.params.productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.deleteOne();

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    res.status(200).json({
      success: true,
      cart: cart || { items: [], userId: req.user.id },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addCartItem = async (req, res) => {
  try {
    const product = await findProduct(req.body.productId || req.body.productCode);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const quantity = Math.max(1, Number(req.body.quantity || 1));
    const cart = (await Cart.findOne({ userId: req.user.id })) ||
      new Cart({ userId: req.user.id, items: [] });

    const existingItem = cart.items.find(
      (item) => String(item.productId) === String(product._id)
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.totalPrice = existingItem.quantity * existingItem.price;
    } else {
      cart.items.push({
        productId: product._id,
        productCode: product.productCode,
        productName: product.productName,
        category: product.category,
        imageKey: product.imageKey,
        price: product.dpPrice,
        quantity,
        totalPrice: quantity * product.dpPrice,
        bvPoint: product.bvPoint,
      });
    }

    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.find((entry) => String(entry.productId) === String(req.params.productId));
    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    item.quantity = Math.max(1, Number(req.body.quantity || item.quantity));
    item.totalPrice = item.quantity * item.price;

    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter((entry) => String(entry.productId) !== String(req.params.productId));
    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(200).json({ success: true, cart: { items: [] } });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkoutCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+transactionPassword');
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart || !cart.items.length) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const paymentMode = String(req.body.paymentMode || '').trim();
    const transactionPassword = String(req.body.transactionPassword || '').trim();
    const confirmTransactionPassword = String(req.body.confirmTransactionPassword || '').trim();
    const paymentScreenshot = String(req.body.paymentScreenshot || '').trim();

    const allowedPaymentModes = ['E-Wallet', 'R-Wallet', 'UPI ID', 'BANK TRANSFER'];

    if (!paymentMode || !allowedPaymentModes.includes(paymentMode)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid payment mode',
      });
    }

    if (!paymentScreenshot) {
      return res.status(400).json({
        success: false,
        message: 'Please upload payment screenshot',
      });
    }

    if (!transactionPassword || !confirmTransactionPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both transaction passwords',
      });
    }

    if (transactionPassword !== confirmTransactionPassword) {
      return res.status(400).json({
        success: false,
        message: 'Transaction passwords do not match',
      });
    }

    if (!user?.transactionPassword) {
      return res.status(400).json({
        success: false,
        message: 'Transaction password is not set for this account',
      });
    }

    const isTransactionPasswordValid = await user.matchTransactionPassword(transactionPassword);

    if (!isTransactionPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Transaction password is incorrect',
      });
    }

    const orderNo = await buildOrderNo();
    const orderDate = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const totalPrice = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const shippingCharge = Number(req.body.shippingCharge || 0);
    const discountCoupon = Number(req.body.discountCoupon || 0);
    const finalTotal = totalPrice + shippingCharge - discountCoupon;
    const bvPoint = cart.items.reduce((sum, item) => sum + Number(item.bvPoint || 0), 0);
    const lvPoint = cart.items.reduce((sum, item) => sum + Number(item.levelPoint || 0), 0);

    const order = await Order.create({
      userId: req.user.id,
      orderNo,
      orderDate,
      paymentMode,
      paymentStatus: 'Paid',
      paymentScreenshot,
      orderStatus: 'Pending',
      orderItems: cart.items.length,
      totalPrice,
      lvPoint,
      bvPoint,
      startDate: orderDate,
      endDate: orderDate,
      shippingCharge,
      discountCoupon,
      finalTotal,
      shippingInformation: buildShippingInformation(user),
      items: cart.items.map((item) => ({
        productId: item.productId,
        productCode: item.productCode,
        name: item.productName,
        price: item.price,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        imageKey: item.imageKey,
      })),
    });

    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders: orders.map((order) => ({
        id: order._id,
        orderNo: order.orderNo,
        orderDate: order.orderDate,
        memberId: req.user.memberId || req.user.epin || String(req.user.id),
        items: `${order.orderItems} ITEMS`,
        totalPaid: order.finalTotal,
        payMode: order.paymentMode,
        payStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        lvPoint: Number(order.lvPoint || 0),
        bvPoint: Number(order.bvPoint || 0),
        startDate: order.startDate || order.orderDate,
        endDate: order.endDate || order.orderDate,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderByNo = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNo: req.params.orderNo }).populate('userId', 'memberId name contactNo');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (String(order.userId) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({
      success: true,
      order: {
        orderNo: order.orderNo,
        orderDate: order.orderDate,
        memberId: order.userId?.memberId || String(order.userId?._id || ''),
        paymentMode: order.paymentMode,
        orderItems: order.orderItems,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        totalPrice: order.totalPrice,
        lvPoint: Number(order.lvPoint || 0),
        bvPoint: Number(order.bvPoint || 0),
        startDate: order.startDate || order.orderDate,
        endDate: order.endDate || order.orderDate,
        shippingCharge: order.shippingCharge,
        discountCoupon: order.discountCoupon,
        finalTotal: order.finalTotal,
        shippingInformation: order.shippingInformation,
        items: order.items.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          imageKey: item.imageKey,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'memberId name contactNo').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders: orders.map((order, index) => ({
        sNo: index + 1,
        id: order._id,
        orderNo: order.orderNo,
        memberId: order.userId?.memberId || String(order.userId?._id || ''),
        orderDate: order.orderDate,
        items: `${order.orderItems} ITEMS`,
        totalPaid: order.finalTotal,
        payMode: order.paymentMode,
        payStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        lvPoint: Number(order.lvPoint || 0),
        bvPoint: Number(order.bvPoint || 0),
        startDate: order.startDate || order.orderDate,
        endDate: order.endDate || order.orderDate,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNo: req.params.orderNo });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (req.body.orderStatus) {
      order.orderStatus = req.body.orderStatus;
    }

    if (req.body.paymentStatus) {
      order.paymentStatus = req.body.paymentStatus;
    }

    await order.save();

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};