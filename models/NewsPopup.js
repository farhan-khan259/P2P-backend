const mongoose = require('mongoose');

const newsPopupSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    displayOn: { type: String, required: true, trim: true },
    publishDate: { type: String, required: true, trim: true },
    uptoDate: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Published', 'Draft'], default: 'Published' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('NewsPopup', newsPopupSchema);