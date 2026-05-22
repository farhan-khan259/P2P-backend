const mongoose = require('mongoose');

const epinFranchiseSchema = new mongoose.Schema(
  {
    franchiseId: { type: String, required: true, unique: true, trim: true, index: true },
    franchiseName: { type: String, required: true, trim: true },
    upiId: { type: String, required: true, trim: true },
    whatsappNo: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    stock: { type: Number, default: 0 },
    status: { type: String, enum: ['SHOWING', 'HIDDEN'], default: 'SHOWING' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EpinFranchise', epinFranchiseSchema);