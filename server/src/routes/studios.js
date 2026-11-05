// src/routes/studios.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const studioController = require('../controllers/studioController');

const { upload } = require('../utils/cloudinary');
const uploadMiddleware = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'gallery', maxCount: 10 },
]);

const studioValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category')
    .isIn(['Photo Studios', 'Sound Stages', 'Podcast Rooms', 'Music Suites', 'Art Workshops'])
    .withMessage('Invalid category'),
  body('hourlyRate').isFloat({ min: 0.01 }).withMessage('Hourly rate must be positive'),
  body('image').optional({ checkFalsy: true }).isURL({ protocols: ['https'], require_protocol: true }).withMessage('Image URL must be a valid HTTPS URL'),
  body('securityDeposit').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Security deposit must be non-negative'),
  body('maxCapacity').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('Capacity must be at least one'),
  body('address').trim().notEmpty().withMessage('Address is required'),
];

router.get('/', studioController.getStudios);
router.get('/featured', studioController.getFeatured);
router.get('/my', auth, requireRole('host'), studioController.getMyStudios);
router.get('/:id', studioController.getStudioById);
router.post('/', auth, requireRole('host'), uploadMiddleware, studioValidation, studioController.createStudio);
router.put('/:id', auth, requireRole('host'), uploadMiddleware, studioValidation, studioController.updateStudio);
router.delete('/:id', auth, studioController.deleteStudio);

module.exports = router;
