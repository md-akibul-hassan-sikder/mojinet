const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'electric-url-store/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    // ⚠️ NO transformation — QR codes must stay full resolution to scan
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
});

// ⚠️ This is what adminRoutes.js relies on. All three fields required.
// `image` = banner, `wechatQr` / `alipayQr` = payment QRs
const productUpload = upload.fields([
  { name: 'image',    maxCount: 1 },
  { name: 'wechatQr', maxCount: 1 },
  { name: 'alipayQr', maxCount: 1 },
]);

module.exports = productUpload;