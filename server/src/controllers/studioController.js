// src/controllers/studioController.js
const mongoose = require('mongoose');
const Studio = require('../models/Studio');
const { validationResult } = require('express-validator');

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
    const parsedAmenities = typeof amenities === 'string'
      ? amenities.split(',').map((a) => a.trim()).filter(Boolean)
      : Array.isArray(amenities) ? amenities : [];

    // Cloudinary image URL(s) uploaded via multer middleware
    const image = req.files?.image?.[0]?.path || req.body.image || '';
    const gallery = req.files?.gallery
      ? req.files.gallery.map((f) => f.path)
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

    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (search) filter.$text = { $search: search };

    const sortObj = { [sort]: order === 'asc' ? 1 : -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [studios, total] = await Promise.all([
      Studio.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit)).lean(),
      Studio.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: studios,
      meta: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
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
    const studio = await Studio.findById(req.params.id).populate('hostId', 'name email photoURL createdAt');
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

    const allowedUpdates = ['title', 'category', 'hourlyRate', 'securityDeposit', 'maxCapacity', 'address', 'overview', 'amenities', 'image', 'gallery'];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        studio[field] = req.body[field];
      }
    });

    // Handle new image upload
    if (req.files?.image?.[0]?.path) studio.image = req.files.image[0].path;
    if (req.files?.gallery?.length) studio.gallery = req.files.gallery.map((f) => f.path);

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
    const studio = await Studio.findById(req.params.id);
    if (!studio) return res.status(404).json({ success: false, message: 'Studio not found' });
    if (studio.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this studio' });
    }
    await Studio.deleteOne({ _id: studio._id });
    res.json({ success: true, message: 'Studio deleted successfully' });
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
