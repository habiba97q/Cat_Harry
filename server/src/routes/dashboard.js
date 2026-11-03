// src/routes/dashboard.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

router.get('/customer', auth, dashboardController.getCustomerDashboard);
router.get('/host', auth, dashboardController.getHostDashboard);

module.exports = router;
