const mongoose = require('mongoose');

const depositRequestSchema = new mongoose.Schema(
  {
    depositId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    depositDate: {
      type: String,
      required: true,
    },
    memberId: {
      type: String,
      required: true,
      trim: true,
    },
    memberName: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNo: {
      type: String,
      required: true,
      trim: true,
    },
    paymentMode: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    utrNumber: {
      type: String,
      required: true,
      trim: true,
    },
    slip: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: 'E-Wallet',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approve', 'Succeed', 'Rejected'],
      default: 'Pending',
    },
    remark: {
      type: String,
      default: '-',
      trim: true,
    },
    approvedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DepositRequest', depositRequestSchema);