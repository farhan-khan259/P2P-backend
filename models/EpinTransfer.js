const mongoose = require('mongoose');

const epinTransferSchema = new mongoose.Schema(
  {
    epinNo: { type: String, required: true, trim: true, index: true },
    fromMember: { type: String, required: true, trim: true },
    toMember: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['Success', 'Pending', 'Failed'], default: 'Success' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EpinTransfer', epinTransferSchema);