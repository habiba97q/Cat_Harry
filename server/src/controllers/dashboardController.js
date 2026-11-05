// src/controllers/dashboardController.js
const Booking = require('../models/Booking');
const Studio = require('../models/Studio');
const User = require('../models/User');

// @desc   Get customer dashboard stats
// @route  GET /api/dashboard/customer
exports.getCustomerDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [bookings, statusGroups] = await Promise.all([
      Booking.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('studioId', 'title image address category hourlyRate'),
      Booking.aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const statusMap = { Total: 0, Pending: 0, Confirmed: 0, Completed: 0, Cancelled: 0 };
    let total = 0;
    statusGroups.forEach(({ _id, count }) => {
      statusMap[_id] = count;
      total += count;
    });
    statusMap.Total = total;

    res.json({
      success: true,
      data: {
        user: { name: req.user.name, email: req.user.email, role: req.user.role },
        stats: statusMap,
        recentBookings: bookings,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Get host dashboard stats
// @route  GET /api/dashboard/host
exports.getHostDashboard = async (req, res, next) => {
  try {
    const hostId = req.user._id;

    const [listingsCount, bookings, statusGroups, earnings] = await Promise.all([
      Studio.find({ hostId }).countDocuments(),
      Booking.find({ hostId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('studioId', 'title image address')
        .populate('userId', 'name email photoURL'),
      Booking.aggregate([
        { $match: { hostId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        { $match: { hostId, status: { $in: ['Confirmed', 'Completed'] } } },
        { $group: { _id: null, totalEarnings: { $sum: '$totalPrice' } } },
      ]),
    ]);

    const statusMap = { Total: 0, Pending: 0, Confirmed: 0, Completed: 0, Cancelled: 0 };
    let total = 0;
    statusGroups.forEach(({ _id, count }) => {
      statusMap[_id] = count;
      total += count;
    });
    statusMap.Total = total;

    const totalBookingValue = earnings[0]?.totalEarnings || 0;

    res.json({
      success: true,
      data: {
        user: { name: req.user.name, email: req.user.email, role: req.user.role },
        totalListings: listingsCount,
        totalBookingValue,
        stats: statusMap,
        recentBookings: bookings,
      },
    });
  } catch (err) {
    next(err);
  }
};
