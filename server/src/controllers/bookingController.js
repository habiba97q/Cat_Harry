// src/controllers/bookingController.js
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Studio = require('../models/Studio');
const { validationResult } = require('express-validator');

/** Convert "HH:mm" to minutes since midnight */
function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/** Check if two time ranges [s1,e1] and [s2,e2] overlap */
function timesOverlap(s1, e1, s2, e2) {
  return timeToMinutes(s1) < timeToMinutes(e2) && timeToMinutes(e1) > timeToMinutes(s2);
}

// @desc   Create a new booking (Pending)
// @route  POST /api/bookings
exports.createBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { studioId, bookingDate, startTime, endTime } = req.body;

    const studio = await Studio.findById(studioId).session(session);
    if (!studio) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Studio not found' });
    }

    // 1. Cannot book own studio
    if (studio.hostId.toString() === req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'You cannot book your own studio' });
    }

    // 2. End time must be later than start time
    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'End time must be after start time' });
    }

    // 3. Prevent duplicate pending submission from same user for same studio/date/time
    const dateObj = new Date(bookingDate);
    const duplicate = await Booking.findOne({
      studioId,
      userId: req.user._id,
      bookingDate: dateObj,
      startTime,
      endTime,
      status: { $in: ['Pending', 'Confirmed'] },
    }).session(session);

    if (duplicate) {
      await session.abortTransaction();
      return res.status(409).json({ success: false, message: 'You already have a booking for this time slot' });
    }

    // 4. Server-side totals (never trust client)
    const totalHours = (timeToMinutes(endTime) - timeToMinutes(startTime)) / 60;
    const totalPrice = totalHours * studio.hourlyRate;

    const [booking] = await Booking.create(
      [{
        studioId,
        userId: req.user._id,
        hostId: studio.hostId,
        bookingDate: dateObj,
        startTime,
        endTime,
        totalHours,
        hourlyRate: studio.hourlyRate,
        totalPrice,
        status: 'Pending',
      }],
      { session }
    );

    await session.commitTransaction();
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

// @desc   Get bookings of the logged-in customer
// @route  GET /api/bookings/my
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('studioId', 'title image address category hourlyRate');
    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

// @desc   Get bookings for studios the logged-in user hosts
// @route  GET /api/bookings/host
exports.getHostBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ hostId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('studioId', 'title image address category')
      .populate('userId', 'name email photoURL');
    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

// @desc   Get single booking details
// @route  GET /api/bookings/:id
exports.getBookingById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }
    const booking = await Booking.findById(req.params.id)
      .populate('studioId', 'title image address category hourlyRate')
      .populate('userId', 'name email photoURL')
      .populate('hostId', 'name email photoURL');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isCustomer = booking.userId._id.toString() === req.user._id.toString();
    const isHost = booking.hostId._id.toString() === req.user._id.toString();
    if (!isCustomer && !isHost) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// @desc   Host confirms a pending booking (with transaction + conflict check)
// @route  PATCH /api/bookings/:id/confirm
exports.confirmBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    const booking = await Booking.findById(req.params.id).session(session);
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.hostId.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: 'Only the studio host can confirm bookings' });
    }

    if (booking.status !== 'Pending') {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: `Cannot confirm a ${booking.status} booking` });
    }

    // Critical: check for any already-confirmed booking that overlaps
    const conflicts = await Booking.find({
      _id: { $ne: booking._id },
      studioId: booking.studioId,
      bookingDate: booking.bookingDate,
      status: 'Confirmed',
    }).session(session);

    const hasConflict = conflicts.some((b) =>
      timesOverlap(booking.startTime, booking.endTime, b.startTime, b.endTime)
    );

    if (hasConflict) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: 'This time slot conflicts with an existing confirmed booking',
      });
    }

    booking.status = 'Confirmed';
    await booking.save({ session });
    await session.commitTransaction();
    res.json({ success: true, data: booking });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

// @desc   Cancel a booking
// @route  PATCH /api/bookings/:id/cancel
exports.cancelBooking = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isCustomer = booking.userId.toString() === req.user._id.toString();
    const isHost = booking.hostId.toString() === req.user._id.toString();

    if (!isCustomer && !isHost) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }
    if (booking.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }
    if (isCustomer && booking.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Customers can only cancel pending bookings' });
    }

    booking.status = 'Cancelled';
    await booking.save();
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};
