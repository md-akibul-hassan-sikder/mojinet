const express = require('express');
const router = express.Router();

const upload = require('../middleware/uploadMiddleware');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getPendingOrders,
  approveOrder,
  rejectOrder,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  listUsers,
  getUserDetail,
} = require('../controllers/adminController');

// Every route below requires a valid JWT and admin role
router.use(protect, adminOnly);

/* ---------------- Orders ---------------- */
router.get('/orders/pending', getPendingOrders);
router.put('/orders/:id/approve', approveOrder);
router.put('/orders/:id/reject', rejectOrder);

/* ---------------- Products ---------------- */
const productUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'wechatQr', maxCount: 1 },
  { name: 'alipayQr', maxCount: 1 },
]);

router.get('/products', listProducts);
router.post('/products', productUpload, createProduct);
router.put('/products/:id', productUpload, updateProduct);
router.delete('/products/:id', deleteProduct);

/* ---------------- Users ---------------- */
router.get('/users', listUsers);
router.get('/users/:id', getUserDetail);

module.exports = router;