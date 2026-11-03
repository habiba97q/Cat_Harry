// src/models/User.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /.+@.+\..+/, // basic email validation
    },
    password: { type: String, required: true }, // hashed password
    photoURL: { type: String },
    role: {
      type: String,
      enum: ['customer', 'host', 'admin'],
      default: 'customer',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
