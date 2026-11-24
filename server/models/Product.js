const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true, trim: true },
    description:  { type: String, required: true, trim: true },
    price:        { type: Number, required: true, min: 0 },
    originalPrice:{ type: Number, default: null, min: 0 },

    // Lifetime = no expiry. When true, `durationDays` is ignored.
    isLifetime:   { type: Boolean, default: false, index: true },
    durationDays: { type: Number, default: 30, min: 0 },

    deviceInfo:   { type: String, default: 'Unlimited — works on all devices' },
    category:     { type: String, default: '' },
    features:     { type: [String], default: [] },
    image:        { type: String, default: '' },
    deliveryUrl:  { type: String, default: '' },
    wechatQr:     { type: String, default: null },
    alipayQr:     { type: String, default: null },
    isActive:     { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);