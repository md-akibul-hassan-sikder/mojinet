const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['wechat', 'alipay'],
      required: true,
    },

    // Option A — uploaded screenshot (filename on disk)
    paymentProof: { type: String, default: null },

    // Option B — last 4 digits + the remark the customer typed at payment
    paymentReference: { type: String, default: null },
    paymentRemark:    { type: String, default: null },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      required: true,
      default: 'pending',
      index: true,
    },
    adminNote: { type: String, default: '' },
    deliveryContent: { type: String, default: null },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);