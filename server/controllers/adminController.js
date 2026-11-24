const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const {
  sendOrderApprovedEmail,
  sendOrderRejectedEmail,
} = require('../utils/sendEmail');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* ============================================================
   ORDERS
   ============================================================ */

const getPendingOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ status: 'pending' })
    .populate('user', 'name email')
    .populate('product', 'title price durationDays isLifetime')
    .sort('createdAt');
  res.json(orders);
});

const approveOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('product');
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (order.status !== 'pending') { res.status(400); throw new Error('Order already processed'); }

  const content = ((req.body && (req.body.deliveryContent ?? req.body.deliveryUrl)) || '')
    .toString()
    .trim();
  if (!content) { res.status(400); throw new Error('Please type the content to send to the customer'); }

  order.status = 'approved';
  order.deliveryContent = content;

  const isLifetime = order.product?.isLifetime === true;
  if (!isLifetime && order.product?.durationDays) {
    order.expiresAt = new Date(order.createdAt.getTime() + order.product.durationDays * 86400000);
  } else {
    order.expiresAt = null;
  }

  await order.save();

  (async () => {
    try {
      const customer = await User.findById(order.user).select('name email');
      if (customer?.email) {
        await sendOrderApprovedEmail({
          to: customer.email,
          name: customer.name,
          order,
          product: order.product,
          deliveryContent: content,
        });
        console.log(`📧 Approval email sent to ${customer.email} for #${String(order._id).slice(-6).toUpperCase()}`);
      }
    } catch (err) {
      console.error('❌ Approval email failed:', err.message);
    }
  })();

  res.json({ message: 'Order approved and content delivered', order });
});

const rejectOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('product');
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (order.status !== 'pending') { res.status(400); throw new Error('Order already processed'); }

  order.status = 'rejected';
  order.adminNote = (req.body && req.body.note) || 'Payment could not be verified';
  await order.save();

  (async () => {
    try {
      const customer = await User.findById(order.user).select('name email');
      if (customer?.email) {
        await sendOrderRejectedEmail({
          to: customer.email,
          name: customer.name,
          order,
          product: order.product,
          reason: order.adminNote,
        });
        console.log(`📧 Rejection email sent to ${customer.email} for #${String(order._id).slice(-6).toUpperCase()}`);
      }
    } catch (err) {
      console.error('❌ Rejection email failed:', err.message);
    }
  })();

  res.json({ message: 'Order rejected', order });
});

/* ============================================================
   PRODUCTS
   ============================================================ */

const listProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort('-createdAt');
  res.json(products);
});

const parseFeatures = (value) => {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    try {
      const arr = JSON.parse(value);
      return Array.isArray(arr) ? arr.filter(Boolean) : [];
    } catch {
      return value.split('\n').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
};

const normaliseOriginal = (originalRaw, priceRaw) => {
  const o = originalRaw === undefined || originalRaw === null || originalRaw === ''
    ? NaN
    : Number(originalRaw);
  const p = Number(priceRaw);
  if (!Number.isFinite(o) || !Number.isFinite(p)) return null;
  if (o <= p) return null;
  return Math.round(o * 100) / 100;
};

const toBool = (v) => v === true || v === 'true' || v === 1 || v === '1';

/* ------------------------------------------------------------------
   All uploads (image, wechatQr, alipayQr) now arrive as Cloudinary
   files — use .path (full https URL), NOT .filename.
   ------------------------------------------------------------------ */

const createProduct = asyncHandler(async (req, res) => {
  const { title, description, price, durationDays, deviceInfo, category } = req.body;
  if (!title || !description || price == null) {
    res.status(400);
    throw new Error('title, description and price are required');
  }

  const isLifetime = toBool(req.body.isLifetime);
  const days = Number(durationDays);

  if (!isLifetime && (!days || days < 1)) {
    res.status(400);
    throw new Error('Duration must be at least 1 day for time-limited products');
  }

  const image    = req.files?.image?.[0]?.path    || req.body.image || '';
  const wechatQr = req.files?.wechatQr?.[0]?.path || null;
  const alipayQr = req.files?.alipayQr?.[0]?.path || null;

  const product = await Product.create({
    title,
    description,
    price: Number(price),
    originalPrice: normaliseOriginal(req.body.originalPrice, price),
    isLifetime,
    durationDays: isLifetime ? 0 : days,
    deviceInfo: deviceInfo || 'Unlimited — works on all devices',
    category: category || '',
    features: parseFeatures(req.body.features) || [],
    image,
    wechatQr,
    alipayQr,
    isActive: req.body.isActive === undefined
      ? true
      : toBool(req.body.isActive),
  });
  res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  const b = req.body;
  if (b.title !== undefined)        product.title = b.title;
  if (b.description !== undefined)  product.description = b.description;
  if (b.price !== undefined)        product.price = Number(b.price);
  if (b.deviceInfo !== undefined)   product.deviceInfo = b.deviceInfo;
  if (b.category !== undefined)     product.category = b.category;
  if (b.isActive !== undefined)     product.isActive = toBool(b.isActive);

  if (b.isLifetime !== undefined)   product.isLifetime = toBool(b.isLifetime);

  if (b.durationDays !== undefined) {
    const days = Number(b.durationDays);
    if (!product.isLifetime && (!days || days < 1)) {
      res.status(400);
      throw new Error('Duration must be at least 1 day for time-limited products');
    }
    product.durationDays = product.isLifetime ? 0 : days;
  } else if (product.isLifetime) {
    product.durationDays = 0;
  }

  if (b.originalPrice !== undefined) {
    product.originalPrice = normaliseOriginal(b.originalPrice, product.price);
  } else if (b.price !== undefined) {
    product.originalPrice = normaliseOriginal(product.originalPrice, product.price);
  }

  const features = parseFeatures(b.features);
  if (features !== undefined) product.features = features;

  // Cloudinary URLs (only replace when a new file was uploaded)
  if (req.files?.image?.[0]?.path)    product.image    = req.files.image[0].path;
  else if (b.image !== undefined)     product.image    = b.image;

  if (req.files?.wechatQr?.[0]?.path) product.wechatQr = req.files.wechatQr[0].path;
  if (req.files?.alipayQr?.[0]?.path) product.alipayQr = req.files.alipayQr[0].path;

  await product.save();
  res.json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  await product.deleteOne();
  res.json({ message: 'Product deleted' });
});

/* ============================================================
   USERS
   ============================================================ */

const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort('-createdAt').lean();
  const now = new Date();

  const stats = await Order.aggregate([
    {
      $group: {
        _id: '$user',
        totalOrders:    { $sum: 1 },
        approvedCount:  { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
        pendingCount:   { $sum: { $cond: [{ $eq: ['$status', 'pending']  }, 1, 0] } },
        rejectedCount:  { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        totalSpent:     { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$amount', 0] } },
        activePurchases: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', 'approved'] },
                  { $or: [{ $eq: ['$expiresAt', null] }, { $gt: ['$expiresAt', now] }] },
                ],
              },
              1, 0,
            ],
          },
        },
        expiredCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', 'approved'] },
                  { $ne: ['$expiresAt', null] },
                  { $lte: ['$expiresAt', now] },
                ],
              },
              1, 0,
            ],
          },
        },
      },
    },
  ]);

  const byUser = new Map(stats.map((s) => [String(s._id), s]));
  const result = users.map((u) => {
    const s = byUser.get(String(u._id)) || {};
    return {
      _id: u._id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt,
      totalOrders: s.totalOrders || 0,
      approvedCount: s.approvedCount || 0,
      pendingCount: s.pendingCount || 0,
      rejectedCount: s.rejectedCount || 0,
      activePurchases: s.activePurchases || 0,
      expiredCount: s.expiredCount || 0,
      totalSpent: Math.round((s.totalSpent || 0) * 100) / 100,
    };
  });
  res.json(result);
});

const getUserDetail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  const orders = await Order.find({ user: user._id })
    .populate('product', 'title price durationDays isLifetime')
    .sort('-createdAt')
    .lean();

  const now = new Date();
  const isActive  = (o) => o.status === 'approved' && (!o.expiresAt || new Date(o.expiresAt) > now);
  const isExpired = (o) => o.status === 'approved' && o.expiresAt && new Date(o.expiresAt) <= now;

  res.json({
    user: {
      _id: user._id, name: user.name, email: user.email, role: user.role,
      createdAt: user.createdAt, passwordHash: user.password,
    },
    orders,
    summary: {
      totalOrders:      orders.length,
      approvedCount:    orders.filter((o) => o.status === 'approved').length,
      pendingCount:     orders.filter((o) => o.status === 'pending').length,
      rejectedCount:    orders.filter((o) => o.status === 'rejected').length,
      activePurchases:  orders.filter(isActive).length,
      expiredPurchases: orders.filter(isExpired).length,
      totalSpent:
        Math.round(orders.filter((o) => o.status === 'approved').reduce((s, o) => s + o.amount, 0) * 100) / 100,
    },
  });
});

module.exports = {
  getPendingOrders, approveOrder, rejectOrder,
  listProducts, createProduct, updateProduct, deleteProduct,
  listUsers, getUserDetail,
};