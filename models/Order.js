const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productCode: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    imageKey: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const shippingFieldSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    orderDate: {
      type: String,
      required: true,
    },
    paymentMode: {
      type: String,
      default: 'E-wallet',
    },
    paymentStatus: {
      type: String,
      default: 'Paid',
    },
    paymentScreenshot: {
      type: String,
      default: '',
    },
    orderStatus: {
      type: String,
      default: 'Pending',
    },
    remark: {
      type: String,
      default: '-',
      trim: true,
    },
    orderItems: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    lvPoint: {
      type: Number,
      default: 0,
    },
    bvPoint: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: String,
      default: '',
    },
    endDate: {
      type: String,
      default: '',
    },
    shippingCharge: {
      type: Number,
      default: 0,
    },
    discountCoupon: {
      type: Number,
      default: 0,
    },
    finalTotal: {
      type: Number,
      default: 0,
    },
    shippingInformation: {
      type: [shippingFieldSchema],
      default: [],
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);