// src/utils/jwt.js
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Sign a JWT containing the user id and role.
 * Expires in 7 days (adjust as needed).
 */
function signToken(user) {
  const payload = {
    id: user._id,
    role: user.role,
  };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
}

module.exports = { signToken };
