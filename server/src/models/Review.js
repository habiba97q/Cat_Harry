// src/models/Review.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReviewSchema = new Schema(
  {
    studioId: { type: Schema.Types.ObjectId, ref: 'Studio', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', ReviewSchema);
