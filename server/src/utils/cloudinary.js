// src/utils/cloudinary.js
// Cloudinary integration for studio image uploads.
//
// ── SETUP REQUIRED ────────────────────────────────────────────────────────────
// 1. Create a free account at https://cloudinary.com
// 2. Copy Cloud Name, API Key, API Secret from your dashboard
// 3. Add to server/.env:
//      CLOUDINARY_CLOUD_NAME=your_cloud_name
//      CLOUDINARY_API_KEY=your_api_key
//      CLOUDINARY_API_SECRET=your_api_secret
// 4. Restart the server
// ─────────────────────────────────────────────────────────────────────────────

const config = require('../config');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const isConfigured =
  config.cloudinaryCloudName &&
  config.cloudinaryApiKey &&
  config.cloudinaryApiSecret;

if (isConfigured) {
  cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
  });
}

// If Cloudinary is not configured, fall back to local disk storage
let storage;
if (isConfigured) {
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'studiospace',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
    },
  });
} else {
  const path = require('path');
  const fs = require('fs');
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const { randomUUID } = require('crypto');

  storage = multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase();
      cb(null, `${randomUUID()}${extension}`);
    },
  });
  console.warn('[Cloudinary] Not configured – using local disk storage. Set CLOUDINARY_* env vars for production.');
}

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (/image\/(jpeg|jpg|png|webp)/.test(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error('Only JPEG, PNG and WebP images are allowed');
      error.statusCode = 400;
      cb(error);
    }
  },
});

module.exports = { cloudinary: isConfigured ? cloudinary : null, upload, isCloudinaryConfigured: isConfigured };
