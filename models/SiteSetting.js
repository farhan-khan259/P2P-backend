const mongoose = require('mongoose');

const siteSettingSchema = new mongoose.Schema(
  {
    settingKey: { type: String, required: true, unique: true, trim: true, index: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteSetting', siteSettingSchema);