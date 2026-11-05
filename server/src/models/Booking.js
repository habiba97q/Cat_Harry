// src/models/Booking.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const BookingSchema = new Schema(
  {
    studioId: { type: Schema.Types.ObjectId, ref: 'Studio', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookingDate: { type: Date, required: true },
    startTime: { type: String, required: true }, // format HH:mm
    endTime: { type: String, required: true },
    totalHours: { type: Number, required: true },
    hourlyRate: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    notes: { type: String, trim: true, maxlength: 1000, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

// Composite index for conflict checks (only confirmed bookings matter)
BookingSchema.index({ studioId: 1, bookingDate: 1, startTime: 1, endTime: 1, status: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
