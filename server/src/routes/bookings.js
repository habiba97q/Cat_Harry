// src/routes/bookings.js
const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const auth = require('../middleware/auth');
const bookingController = require('../controllers/bookingController');

// Validation for creating a booking
const createBookingValidation = [
  body('studioId').isMongoId().withMessage('Valid studioId required'),
  body('bookingDate').isISO8601().toDate().withMessage('Valid bookingDate required'),
  body('startTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('startTime must be HH:mm'),
  body('endTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('endTime must be HH:mm'),
];

router.post('/', auth, createBookingValidation, bookingController.createBooking);
router.get('/my', auth, bookingController.getMyBookings);
router.get('/host', auth, bookingController.getHostBookings);
router.get('/:id', auth, param('id').isMongoId(), bookingController.getBookingById);
router.patch('/:id/confirm', auth, param('id').isMongoId(), bookingController.confirmBooking);
router.patch('/:id/cancel', auth, param('id').isMongoId(), bookingController.cancelBooking);

module.exports = router;
