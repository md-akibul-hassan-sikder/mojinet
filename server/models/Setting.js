const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  wechatQr: { type: String, required: true },
  alipayQr: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);