// src/controllers/authController.js
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const config = require('../config');

/**
 * Set the JWT as an HTTPOnly cookie.
 * - Development: sameSite=lax, secure=false  (works on localhost)
 * - Production:  sameSite=none, secure=true  (required for cross-origin cookies)
 */
function setTokenCookie(res, token) {
  const isProd = config.nodeEnv === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

function clearTokenCookie(res) {
  const isProd = config.nodeEnv === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });
}

// @desc   Register new user
// @route  POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, photoURL, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }
    if (password.length < 6 || !/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters and include uppercase and lowercase letters',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      photoURL: photoURL || '',
      role: role === 'host' ? 'host' : 'customer',
    });

    const token = signToken(user);
    setTokenCookie(res, token);

    const userSafe = user.toObject();
    delete userSafe.password;
    return res.status(201).json({ success: true, data: userSafe });
  } catch (err) {
    next(err);
  }
};

// @desc   Login user
// @route  POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user);
    setTokenCookie(res, token);

    const userSafe = user.toObject();
    delete userSafe.password;
    return res.json({ success: true, data: userSafe });
  } catch (err) {
    next(err);
  }
};

// @desc   Google OAuth endpoint scaffold
// @route  POST /api/auth/google
//
// SETUP REQUIRED:
//   1. Create a project at https://console.cloud.google.com
//   2. Enable "Google Identity" / OAuth2 API
//   3. Create OAuth 2.0 credentials (Web application type)
//   4. Add authorized redirect URIs (e.g. http://localhost:3000)
//   5. Add to server/.env:
//        GOOGLE_CLIENT_ID=your_client_id
//        GOOGLE_CLIENT_SECRET=your_client_secret
//   6. Install: npm install google-auth-library
//   7. Uncomment and adapt the code below
//
exports.googleAuth = async (req, res, next) => {
  try {
    // Placeholder – real implementation requires GOOGLE_CLIENT_ID
    if (!config.googleClientId) {
      return res.status(501).json({
        success: false,
        message: 'Google authentication is not configured on this server. See GOOGLE_SETUP.md for instructions.',
      });
    }

    // Example implementation (uncomment after adding google-auth-library):
    // const { OAuth2Client } = require('google-auth-library');
    // const client = new OAuth2Client(config.googleClientId);
    // const { idToken } = req.body;
    // const ticket = await client.verifyIdToken({ idToken, audience: config.googleClientId });
    // const { name, email, picture, sub } = ticket.getPayload();
    //
    // let user = await User.findOne({ email });
    // if (!user) {
    //   user = await User.create({ name, email, password: `google_${sub}`, photoURL: picture });
    // }
    // const token = signToken(user);
    // setTokenCookie(res, token);
    // const safe = user.toObject(); delete safe.password;
    // return res.json({ success: true, data: safe });

    return res.status(501).json({ success: false, message: 'Google auth not yet configured' });
  } catch (err) {
    next(err);
  }
};

// @desc   Logout user
// @route  POST /api/auth/logout
exports.logout = (req, res) => {
  clearTokenCookie(res);
  return res.json({ success: true, message: 'Logged out successfully' });
};

// @desc   Get current logged-in user
// @route  GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    return res.json({ success: true, data: req.user });
  } catch (err) {
    next(err);
  }
};
