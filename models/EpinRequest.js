const mongoose = require('mongoose');

const epinRequestSchema = new mongoose.Schema(
  {
    clientId: { type: String, required: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    packageCost: { type: String, required: true, trim: true },
    qty: { type: Number, required: true, default: 1 },
    paidAmount: { type: Number, required: true, default: 0 },
    mobile: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    note: { type: String, default: '-', trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EpinRequest', epinRequestSchema);