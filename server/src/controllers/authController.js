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
    path: '/',
  });
}

function clearTokenCookie(res) {
  const isProd = config.nodeEnv === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
}

// @desc   Register new user
// @route  POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { password } = req.body;
    const photoURL = typeof req.body.photoURL === 'string' ? req.body.photoURL.trim() : '';
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

    if (!name || !email || typeof password !== 'string' || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }
    let photo;
    try {
      photo = new URL(photoURL);
    } catch {
      return res.status(400).json({ success: false, message: 'A valid profile photo URL is required' });
    }
    if (photo.protocol !== 'https:') {
      return res.status(400).json({ success: false, message: 'Profile photo URL must use HTTPS' });
    }
    if (password.length < 6 || !/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters and include uppercase and lowercase letters',
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      photoURL,
      role: req.body.role === 'host' ? 'host' : 'customer',
    });

    const userSafe = user.toObject();
    delete userSafe.password;
    return res.status(201).json({ success: true, data: userSafe });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }
    next(err);
  }
};

// @desc   Login user
// @route  POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
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

// @desc   Sign in with a Google ID token
// @route  POST /api/auth/google
exports.googleAuth = async (req, res, next) => {
  let verifiedEmail;
  try {
    if (!config.googleClientId) {
      return res.status(501).json({
        success: false,
        message: 'Google authentication is not configured on this server.',
      });
    }

    const { OAuth2Client } = require('google-auth-library');
    const { idToken } = req.body;
    if (typeof idToken !== 'string' || !idToken) {
      return res.status(400).json({ success: false, message: 'Google ID token is required' });
    }
    const client = new OAuth2Client(config.googleClientId);
    let ticket;
    try {
      ticket = await client.verifyIdToken({ idToken, audience: config.googleClientId });
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid Google ID token' });
    }
    const payload = ticket.getPayload();
    if (!payload?.email || payload.email_verified !== true) {
      return res.status(401).json({ success: false, message: 'Google account email is not verified' });
    }
    const email = payload.email.trim().toLowerCase();
    verifiedEmail = email;
    let user = await User.findOne({ email });
    if (!user) {
      const password = await bcrypt.hash(require('crypto').randomBytes(32).toString('hex'), 12);
      user = await User.create({
        name: payload.name || email,
        email,
        password,
        photoURL: payload.picture || '',
        role: 'customer',
      });
    }

    setTokenCookie(res, signToken(user));
    const userSafe = user.toObject();
    delete userSafe.password;
    return res.json({ success: true, data: userSafe });
  } catch (err) {
    if (err.code === 11000) {
      const user = verifiedEmail ? await User.findOne({ email: verifiedEmail }) : null;
      if (user) {
        setTokenCookie(res, signToken(user));
        const userSafe = user.toObject();
        delete userSafe.password;
        return res.json({ success: true, data: userSafe });
      }
    }
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
