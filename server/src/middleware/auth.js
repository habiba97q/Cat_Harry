// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

// Verify JWT from HTTPOnly cookie "token"
module.exports = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const decoded = jwt.verify(token, config.jwtSecret);
    // Attach full user document (excluding password) to req.user
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    req.user = user; // read‑only
    next();
  } catch (err) {
    console.error('Auth middleware error', err);
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
