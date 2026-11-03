// src/routes/studios.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const studioController = require('../controllers/studioController');

// Conditionally use Cloudinary upload if credentials are configured
let uploadMiddleware;
try {
  const { upload } = require('../utils/cloudinary');
  // Expect fields: image (single), gallery (up to 10)
  uploadMiddleware = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'gallery', maxCount: 10 },
  ]);
} catch (e) {
  // If Cloudinary is not configured, skip upload middleware
  uploadMiddleware = (req, res, next) => next();
}

const studioValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('category')
    .isIn(['Photo Studios', 'Sound Stages', 'Podcast Rooms', 'Music Suites', 'Art Workshops'])
    .withMessage('Invalid category'),
  body('hourlyRate').isFloat({ min: 0 }).withMessage('Hourly rate must be non-negative'),
  body('address').notEmpty().withMessage('Address is required'),
];

router.get('/', studioController.getStudios);
router.get('/featured', studioController.getFeatured);
router.get('/my', auth, studioController.getMyStudios);
router.get('/:id', studioController.getStudioById);
router.post('/', auth, uploadMiddleware, studioValidation, studioController.createStudio);
router.put('/:id', auth, uploadMiddleware, studioController.updateStudio);
router.delete('/:id', auth, studioController.deleteStudio);

module.exports = router;
