// src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// Simple limiter: max 10 requests per minute per IP for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter };
