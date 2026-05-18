const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['repurchase', 'shopping', 'joining'],
      required: true,
      index: true,
    },
    productCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    hsnCode: {
      type: String,
      required: true,
      trim: true,
    },
    mrp: {
      type: Number,
      default: 0,
    },
    dpPrice: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    gst: {
      type: Number,
      default: 0,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    bvPoint: {
      type: Number,
      default: 0,
    },
    levelPoint: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['SHOWING', 'HIDDEN'],
      default: 'SHOWING',
    },
    imageKey: {
      type: String,
      default: '',
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: '',
    },
    specifications: {
      type: String,
      default: '',
    },
    features: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '',
    },
    weight: {
      type: String,
      default: '',
    },
    dimension: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);