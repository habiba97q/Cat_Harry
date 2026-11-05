// src/controllers/studioController.js
const mongoose = require('mongoose');
const Studio = require('../models/Studio');
const Booking = require('../models/Booking');
const { validationResult } = require('express-validator');
const { acquireStudioBookingLock } = require('../utils/studioBookingLock');
const path = require('path');

function uploadedImageUrl(file) {
  if (!file) return '';
  if (/^https?:\/\//i.test(file.path)) return file.path;
  return `/uploads/${path.basename(file.path || file.filename)}`;
}

function parseList(value) {
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return Array.isArray(value) ? value : [];
}

// @desc   Create a new studio (image via Cloudinary)
// @route  POST /api/studios
exports.createStudio = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, category, hourlyRate, securityDeposit, maxCapacity, address, overview, amenities } = req.body;

    // Parse amenities if sent as comma-separated string
    const parsedAmenities = parseList(amenities);

    // Cloudinary image URL(s) uploaded via multer middleware
    const image = uploadedImageUrl(req.files?.image?.[0]) || req.body.image || '';
    const gallery = req.files?.gallery
      ? req.files.gallery.map(uploadedImageUrl)
      : Array.isArray(req.body.gallery) ? req.body.gallery : [];

    const studio = await Studio.create({
      title,
      category,
      hourlyRate: Number(hourlyRate),
      securityDeposit: Number(securityDeposit) || 0,
      maxCapacity: Number(maxCapacity) || 1,
      address,
      overview,
      amenities: parsedAmenities,
      image,
      gallery,
      hostId: req.user._id,
    });

    res.status(201).json({ success: true, data: studio });
  } catch (err) {
    next(err);
  }
};

// @desc   Get all studios with filtering, search, sort, pagination
// @route  GET /api/studios?category=&search=&sort=&order=&page=&limit=
exports.getStudios = async (req, res, next) => {
  try {
    const { category, search, sort = 'createdAt', order = 'desc', page = 1, limit = 12 } = req.query;
    const allowedSortFields = ['createdAt', 'hourlyRate', 'title'];

    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (typeof search === 'string' && search.trim()) filter.$text = { $search: search.trim() };

    const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
    const pageSize = Math.min(48, Math.max(1, Number.parseInt(limit, 10) || 12));
    const sortField = allowedSortFields.includes(sort) ? sort : 'createdAt';
    const sortObj = { [sortField]: order === 'asc' ? 1 : -1 };
    const skip = (pageNumber - 1) * pageSize;

    const [studios, total] = await Promise.all([
      Studio.find(filter).sort(sortObj).skip(skip).limit(pageSize).lean(),
      Studio.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: studios,
      meta: { total, page: pageNumber, limit: pageSize, pages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Get 6 featured studios (most recently added)
// @route  GET /api/studios/featured
exports.getFeatured = async (req, res, next) => {
  try {
    const featured = await Studio.find({}).sort({ createdAt: -1 }).limit(6).lean();
    res.json({ success: true, data: featured });
  } catch (err) {
    next(err);
  }
};

// @desc   Get studio by ID
// @route  GET /api/studios/:id
exports.getStudioById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid studio ID' });
    }
    const studio = await Studio.findById(req.params.id).populate('hostId', 'name photoURL createdAt');
    if (!studio) {
      return res.status(404).json({ success: false, message: 'Studio not found' });
    }
    res.json({ success: true, data: studio });
  } catch (err) {
    next(err);
  }
};

// @desc   Update studio (owner only)
// @route  PUT /api/studios/:id
exports.updateStudio = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid studio ID' });
    }
    const studio = await Studio.findById(req.params.id);
    if (!studio) return res.status(404).json({ success: false, message: 'Studio not found' });
    if (studio.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this studio' });
    }

    const allowedUpdates = ['title', 'category', 'address', 'overview', 'image'];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        studio[field] = req.body[field];
      }
    });
    if (req.body.gallery !== undefined) studio.gallery = parseList(req.body.gallery);

    // Handle new image upload
    if (req.files?.image?.[0]) studio.image = uploadedImageUrl(req.files.image[0]);
    if (req.files?.gallery?.length) studio.gallery = req.files.gallery.map(uploadedImageUrl);
    if (req.body.amenities !== undefined) studio.amenities = parseList(req.body.amenities);
    for (const field of ['hourlyRate', 'securityDeposit', 'maxCapacity']) {
      if (req.body[field] !== undefined && String(req.body[field]).trim() !== '') {
        studio[field] = Number(req.body[field]);
      }
    }

    await studio.save();
    res.json({ success: true, data: studio });
  } catch (err) {
    next(err);
  }
};

// @desc   Delete studio (owner only)
// @route  DELETE /api/studios/:id
exports.deleteStudio = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid studio ID' });
    }
    const releaseLock = await acquireStudioBookingLock(req.params.id);
    try {
      const studio = await Studio.findById(req.params.id);
      if (!studio) return res.status(404).json({ success: false, message: 'Studio not found' });
      if (studio.hostId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this studio' });
      }
      const hasActiveBookings = await Booking.exists({
        studioId: studio._id,
        status: { $in: ['Pending', 'Confirmed'] },
      });
      if (hasActiveBookings) {
        return res.status(409).json({ success: false, message: 'Cancel or complete active bookings before deleting this studio' });
      }
      await Studio.deleteOne({ _id: studio._id });
      return res.json({ success: true, message: 'Studio deleted successfully' });
    } finally {
      await releaseLock();
    }
  } catch (err) {
    next(err);
  }
};

// @desc   Get studios owned by the logged-in user
// @route  GET /api/studios/my
exports.getMyStudios = async (req, res, next) => {
  try {
    const studios = await Studio.find({ hostId: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: studios });
  } catch (err) {
    next(err);
  }
};
