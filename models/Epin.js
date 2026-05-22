const mongoose = require('mongoose');

const epinSchema = new mongoose.Schema(
  {
    epinName: { type: String, required: true, trim: true },
    epinNo: { type: String, required: true, unique: true, trim: true, index: true },
    cost: { type: Number, required: true, default: 0 },
    generatedBy: { type: String, required: true, trim: true },
    currentOwner: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Unused', 'Used', 'Deleted'], default: 'Unused' },
    usedBy: { type: String, default: '-', trim: true },
    usedDate: { type: String, default: '-', trim: true },
    deletedBy: { type: String, default: '-', trim: true },
    deletedDate: { type: String, default: '-', trim: true },
    deletedReason: { type: String, default: '-', trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Epin', epinSchema);