const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const { connectDB } = require('./utils/db');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const studioRoutes = require('./routes/studios');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Middleware
app.use(cors({
  origin(origin, callback) {
    if (!origin || config.clientUrls.includes(origin)) return callback(null, true);
    const error = new Error(`Origin ${origin} is not allowed by CORS`);
    error.statusCode = 403;
    return callback(error);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Static folder for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes under /api
app.use('/api/auth', authRoutes);
app.use('/api/studios', studioRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok' }));

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use(errorHandler);

// Start server after DB connection
const start = async () => {
  try {
    await connectDB();
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
};

if (require.main === module) start();

module.exports = app;
module.exports.start = start;
