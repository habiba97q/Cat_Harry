// src/config/index.js
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const required = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`[Config] Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const clientUrls = [...new Set(
  `${process.env.CLIENT_URL || ''},${process.env.CLIENT_URLS || ''}`
    .split(',')
    .map((url) => {
      try {
        return new URL(url.trim()).origin;
      } catch {
        return '';
      }
    })
    .filter(Boolean)
)];

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  clientUrls,
  nodeEnv: process.env.NODE_ENV || 'development',
  // Optional Google Identity Services ID-token verification.
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  // Optional – Cloudinary (required for image uploads)
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
};
