const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    order:     { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    body:      { type: String, required: true, trim: true, maxlength: 4000 },
    readAt:    { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);