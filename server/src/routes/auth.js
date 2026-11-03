// src/routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, googleAuth, logout, getMe } = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const auth = require('../middleware/auth');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleAuth);
router.post('/logout', logout);
router.get('/me', auth, getMe);

module.exports = router;
