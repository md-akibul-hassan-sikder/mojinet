const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProductById,
} = require('../controllers/productController');

// Public routes — no auth. The product controller must NOT strip
// wechatQr / alipayQr, because the checkout page needs them.
router.get('/', getProducts);
router.get('/:id', getProductById);

module.exports = router;