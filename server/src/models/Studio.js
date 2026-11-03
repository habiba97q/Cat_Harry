// src/models/Studio.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const StudioSchema = new Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['Photo Studios', 'Sound Stages', 'Podcast Rooms', 'Music Suites', 'Art Workshops'],
      required: true,
    },
    hourlyRate: { type: Number, required: true, min: 0 },
    securityDeposit: { type: Number, required: true, min: 0 },
    maxCapacity: { type: Number, required: true, min: 1 },
    address: { type: String, required: true },
    image: { type: String }, // main thumbnail URL
    gallery: [{ type: String }], // array of image URLs
    amenities: [{ type: String }],
    overview: { type: String },
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Text index for search on title and address
StudioSchema.index({ title: 'text', address: 'text' });

module.exports = mongoose.model('Studio', StudioSchema);
