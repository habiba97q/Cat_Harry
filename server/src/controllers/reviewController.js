// src/controllers/reviewController.js
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { validationResult } = require('express-validator');

// @desc   Create a review (requires completed booking, one per booking)
// @route  POST /api/reviews
exports.createReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { studioId, bookingId, rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: 'Invalid bookingId' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only review your own bookings' });
    }

    if (booking.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Only completed bookings can be reviewed' });
    }

    // Unique index on bookingId enforces one review per booking
    const review = await Review.create({
      studioId: booking.studioId,
      userId: req.user._id,
      bookingId,
      rating: Number(rating),
      comment,
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    // Duplicate key error (bookingId already reviewed)
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this booking' });
    }
    next(err);
  }
};

// @desc   Get reviews for a studio with avg rating and count
// @route  GET /api/reviews/studio/:studioId
exports.getReviewsByStudio = async (req, res, next) => {
  try {
    const { studioId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studioId)) {
      return res.status(400).json({ success: false, message: 'Invalid studioId' });
    }

    const studioObjectId = new mongoose.Types.ObjectId(studioId);

    const [reviews, stats] = await Promise.all([
      Review.find({ studioId: studioObjectId })
        .populate('userId', 'name photoURL')
        .sort({ createdAt: -1 })
        .lean(),
      Review.aggregate([
        { $match: { studioId: studioObjectId } },
        {
          $group: {
            _id: '$studioId',
            avgRating: { $avg: '$rating' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const meta = stats[0] || { avgRating: 0, count: 0 };
    res.json({ success: true, data: reviews, meta });
  } catch (err) {
    next(err);
  }
};

// @desc   Update a review (owner only)
// @route  PUT /api/reviews/:id
exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (req.body.rating !== undefined) review.rating = Number(req.body.rating);
    if (req.body.comment !== undefined) review.comment = req.body.comment;
    await review.save();
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

// @desc   Delete a review (owner only)
// @route  DELETE /api/reviews/:id
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await Review.deleteOne({ _id: review._id });
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};
