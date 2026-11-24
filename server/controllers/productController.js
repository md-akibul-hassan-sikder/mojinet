const Product = require('../models/Product');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const getProducts = asyncHandler(async (req, res) => {
  // $ne: false also includes documents where isActive is undefined (legacy products)
  const products = await Product.find({ isActive: { $ne: false } })
    .select('-deliveryUrl')
    .sort('-createdAt');
  res.json(products);
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isActive: { $ne: false } })
    .select('-deliveryUrl');
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json(product);
});

module.exports = { getProducts, getProductById };