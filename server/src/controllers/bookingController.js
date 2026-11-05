// src/controllers/bookingController.js
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Studio = require('../models/Studio');
const { validationResult } = require('express-validator');
const { acquireStudioBookingLock } = require('../utils/studioBookingLock');
const { timeToMinutes, timesOverlap } = require('../utils/bookingTime');

// @desc   Create a new booking (Pending)
// @route  POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { studioId, bookingDate, startTime, endTime, notes = '' } = req.body;
    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      return res.status(400).json({ success: false, message: 'End time must be after start time' });
    }

    if (timeToMinutes(endTime) > 24 * 60) {
      return res.status(400).json({ success: false, message: 'Bookings must end before midnight' });
    }

    const requestedDate = new Date(bookingDate);
    const dateObj = new Date(Date.UTC(
      requestedDate.getUTCFullYear(),
      requestedDate.getUTCMonth(),
      requestedDate.getUTCDate()
    ));
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (dateObj < today) {
      return res.status(400).json({ success: false, message: 'Booking date cannot be in the past' });
    }

    const releaseLock = await acquireStudioBookingLock(studioId);
    try {
      const studio = await Studio.findById(studioId);
      if (!studio) {
        return res.status(404).json({ success: false, message: 'Studio not found' });
      }

      if (studio.hostId.toString() === req.user._id.toString()) {
        return res.status(400).json({ success: false, message: 'You cannot book your own studio' });
      }

      const existingBookings = await Booking.find({
        studioId,
        bookingDate: dateObj,
        status: { $in: ['Pending', 'Confirmed'] },
      }).select('startTime endTime');
      const hasConflict = existingBookings.some((booking) =>
        timesOverlap(startTime, endTime, booking.startTime, booking.endTime)
      );
      if (hasConflict) {
        return res.status(409).json({ success: false, message: 'This time slot is already requested or booked' });
      }

      const totalHours = (timeToMinutes(endTime) - timeToMinutes(startTime)) / 60;
      const totalPrice = totalHours * studio.hourlyRate;
      const booking = await Booking.create({
        studioId,
        userId: req.user._id,
        hostId: studio.hostId,
        bookingDate: dateObj,
        startTime,
        endTime,
        totalHours,
        hourlyRate: studio.hourlyRate,
        totalPrice,
        notes: typeof notes === 'string' ? notes.trim() : '',
        status: 'Pending',
      });

      return res.status(201).json({ success: true, data: booking });
    } finally {
      await releaseLock();
    }
  } catch (err) {
    next(err);
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

// @desc   Host confirms a pending booking with an overlap check
// @route  PATCH /api/bookings/:id/confirm
exports.confirmBooking = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    const existingBooking = await Booking.findById(req.params.id);
    if (!existingBooking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (existingBooking.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the studio host can confirm bookings' });
    }

    const releaseLock = await acquireStudioBookingLock(existingBooking.studioId);
    try {
      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      if (booking.hostId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Only the studio host can confirm bookings' });
      }

      if (booking.status !== 'Pending') {
        return res.status(400).json({ success: false, message: `Cannot confirm a ${booking.status} booking` });
      }

      const conflicts = await Booking.find({
        _id: { $ne: booking._id },
        studioId: booking.studioId,
        bookingDate: booking.bookingDate,
        status: 'Confirmed',
      }).select('startTime endTime');

      const hasConflict = conflicts.some((b) =>
        timesOverlap(booking.startTime, booking.endTime, b.startTime, b.endTime)
      );

      if (hasConflict) {
        return res.status(409).json({
          success: false,
          message: 'This time slot conflicts with an existing confirmed booking',
        });
      }

      const confirmed = await Booking.findOneAndUpdate(
        { _id: booking._id, status: 'Pending' },
        { $set: { status: 'Confirmed' } },
        { new: true }
      );
      if (!confirmed) {
        return res.status(409).json({ success: false, message: 'Booking status changed. Refresh and try again.' });
      }
      return res.json({ success: true, data: confirmed });
    } finally {
      await releaseLock();
    }
  } catch (err) {
    next(err);
  }
};

exports.completeBooking = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the studio host can complete bookings' });
    }
    if (booking.status !== 'Confirmed') {
      return res.status(400).json({ success: false, message: 'Only confirmed bookings can be completed' });
    }

    const [year, month, day] = booking.bookingDate.toISOString().slice(0, 10).split('-').map(Number);
    const endMinutes = timeToMinutes(booking.endTime);
    const bookingEnd = new Date(Date.UTC(year, month - 1, day, Math.floor(endMinutes / 60), endMinutes % 60));
    if (bookingEnd > new Date()) {
      return res.status(400).json({ success: false, message: 'A booking cannot be completed before it ends' });
    }

    const completed = await Booking.findOneAndUpdate(
      { _id: booking._id, status: 'Confirmed' },
      { $set: { status: 'Completed' } },
      { new: true }
    );
    if (!completed) {
      return res.status(409).json({ success: false, message: 'Booking status changed. Refresh and try again.' });
    }
    return res.json({ success: true, data: completed });
  } catch (err) {
    next(err);
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

    if (!['Pending', 'Confirmed'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a ${booking.status} booking` });
    }

    const cancelled = await Booking.findOneAndUpdate(
      { _id: booking._id, status: booking.status },
      { $set: { status: 'Cancelled' } },
      { new: true }
    );
    if (!cancelled) {
      return res.status(409).json({ success: false, message: 'Booking status changed. Refresh and try again.' });
    }
    return res.json({ success: true, data: cancelled });
  } catch (err) {
    next(err);
  }
};
