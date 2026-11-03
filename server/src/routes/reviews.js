// src/routes/reviews.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

const reviewValidation = [
  body('bookingId').isMongoId().withMessage('Valid bookingId required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim(),
];

router.post('/', auth, reviewValidation, reviewController.createReview);
router.get('/studio/:studioId', reviewController.getReviewsByStudio);
router.put('/:id', auth, reviewController.updateReview);
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;
