const mongoose = require('mongoose');

const withdrawalRequestSchema = new mongoose.Schema(
  {
    requestId: {
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
    requestDate: {
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
    upiId: {
      type: String,
      trim: true,
      default: '-',
    },
    bankAccountNo: {
      type: String,
      trim: true,
      default: '-',
    },
    bankName: {
      type: String,
      trim: true,
      default: '-',
    },
    branch: {
      type: String,
      trim: true,
      default: '-',
    },
    ifscCode: {
      type: String,
      trim: true,
      default: '-',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    charges: {
      type: Number,
      default: 0,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approve', 'Reject', 'Succeed'],
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

module.exports = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);