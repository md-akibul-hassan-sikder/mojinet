const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendNewOrderNotification } = require('../utils/sendEmail');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const { productId, paymentMethod } = req.body;

  const reference = (req.body.paymentReference || '').toString().trim();
  const remark    = (req.body.paymentRemark    || '').toString().trim();

  const hasFile   = !!req.file;
  const hasRef    = !!reference;
  const hasRemark = !!remark;
  const codeCount = (hasRef ? 1 : 0) + (hasRemark ? 1 : 0);

  // ── at least one option required ──
  if (!hasFile && codeCount === 0) {
    res.status(400);
    throw new Error(
      'Please choose one option: upload a screenshot, enter the last 4 digits, or enter a payment remark.'
    );
  }

  // ── screenshot cannot be combined with transaction details ──
  if (hasFile && codeCount > 0) {
    res.status(400);
    throw new Error(
      'Please choose only one option — upload a screenshot OR provide transaction details, not both.'
    );
  }

  // ── within the code option, only ONE of the two fields is allowed ──
  if (codeCount > 1) {
    res.status(400);
    throw new Error(
      'Please provide only one of: last 4 digits OR payment remark — not both.'
    );
  }

  if (!['wechat', 'alipay'].includes(paymentMethod)) {
    res.status(400);
    throw new Error('Invalid payment method');
  }

  // ── field-level validation ──
  if (hasRef && !/^\d{4}$/.test(reference)) {
    res.status(400);
    throw new Error('Transaction reference must be exactly 4 digits.');
  }
  if (hasRemark && remark.length > 500) {
    res.status(400);
    throw new Error('Payment remark is too long (max 500 characters).');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  /* ------------------------------------------------------------------
     Cloudinary storage → req.file.path is the full HTTPS URL.
     Fall back to req.file.secure_url / req.file.url for safety in case
     multer-storage-cloudinary changes shape in a future version.
     ------------------------------------------------------------------ */
  const proofUrl = hasFile
    ? (req.file.path || req.file.secure_url || req.file.url || null)
    : null;

  const order = await Order.create({
    user: req.user._id,
    product: productId,
    amount: product.price,
    paymentMethod,
    paymentProof:     proofUrl,
    paymentReference: hasRef    ? reference         : null,
    paymentRemark:    hasRemark ? remark            : null,
    status: 'pending',
    deliveryContent: null,
    expiresAt: null,
  });

  // 📧 fire-and-forget — never blocks checkout
  (async () => {
    try {
      const customer = req.user.email
        ? req.user
        : await User.findById(req.user._id).select('name email');

      await sendNewOrderNotification({ order, customer, product });
      console.log(`📧 New order notification sent for #${String(order._id).slice(-6).toUpperCase()}`);
    } catch (err) {
      console.error('❌ Failed to send order notification email:', err.message);
    }
  })();

  res.status(201).json(order);
});

// GET /api/orders/my
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('product', 'title price durationDays isLifetime')
    .sort('-createdAt');
  res.json(orders);
});

module.exports = { createOrder, getMyOrders };