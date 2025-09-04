const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Resource = require('../models/Resource');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'examprepshare',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'txt'],
    resource_type: 'auto',
  },
});

// Configure multer with Cloudinary storage
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, JPG, PNG files are allowed.'));
    }
  }
});

// Cloudinary automatically handles file upload and returns URL

// @route   GET /api/resources
// @desc    Get all resources with filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { examCategory, section, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter object
    const filter = { isActive: true };
    
    if (examCategory && examCategory !== 'All') {
      filter.examCategory = examCategory;
    }
    
    if (section && section !== 'All') {
      filter.section = section;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const resources = await Resource.find(filter)
      .populate('uploadedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Resource.countDocuments(filter);

    res.json({
      resources,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalResources: total,
        hasNext: skip + resources.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: 'Server error while fetching resources' });
  }
});

// @route   GET /api/resources/:id
// @desc    Get single resource
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('uploadedBy', 'name email');

    if (!resource || !resource.isActive) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Increment download count
    resource.downloadCount += 1;
    await resource.save();

    res.json({ resource });
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ message: 'Server error while fetching resource' });
  }
});

// @route   POST /api/resources
// @desc    Upload new resource
// @access  Private
router.post('/', auth, upload.single('file'), [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5-200 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10-1000 characters'),
  body('examCategory').isIn(['UPSC', 'JEE', 'GATE', 'NEET', 'CAT', 'SSC', 'Banking', 'Railway', 'Other']).withMessage('Invalid exam category'),
  body('section').isIn(['General', 'Optional', 'Subject-specific', 'Previous Papers', 'Notes', 'Books', 'Other']).withMessage('Invalid section')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const { title, description, examCategory, section, tags } = req.body;

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `${timestamp}-${req.file.originalname}`;

    // File is automatically uploaded to Cloudinary by multer
    const fileUrl = req.file.path; // Cloudinary provides the URL

    // Determine file type
    let fileType = 'other';
    if (req.file.mimetype === 'application/pdf') fileType = 'pdf';
    else if (req.file.mimetype === 'application/msword') fileType = 'doc';
    else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') fileType = 'docx';
    else if (req.file.mimetype === 'text/plain') fileType = 'txt';
    else if (req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/jpg') fileType = 'jpg';
    else if (req.file.mimetype === 'image/png') fileType = 'png';

    // Parse tags
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];

    // Create resource
    const resource = new Resource({
      title,
      description,
      examCategory,
      section,
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType,
      uploadedBy: req.userId,
      tags: tagsArray
    });

    await resource.save();
    await resource.populate('uploadedBy', 'name email');

    res.status(201).json({
      message: 'Resource uploaded successfully',
      resource
    });
  } catch (error) {
    console.error('Upload resource error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Server error while uploading resource',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/resources/:id
// @desc    Update resource
// @access  Private
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5-200 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10-1000 characters'),
  body('examCategory').optional().isIn(['UPSC', 'JEE', 'GATE', 'NEET', 'CAT', 'SSC', 'Banking', 'Railway', 'Other']).withMessage('Invalid exam category'),
  body('section').optional().isIn(['General', 'Optional', 'Subject-specific', 'Previous Papers', 'Notes', 'Books', 'Other']).withMessage('Invalid section')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if user owns the resource or is admin
    if (resource.uploadedBy.toString() !== req.userId) {
      const user = await User.findById(req.userId);
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update this resource' });
      }
    }

    const { title, description, examCategory, section, tags } = req.body;

    // Update fields
    if (title) resource.title = title;
    if (description) resource.description = description;
    if (examCategory) resource.examCategory = examCategory;
    if (section) resource.section = section;
    if (tags) {
      resource.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }

    await resource.save();
    await resource.populate('uploadedBy', 'name email');

    res.json({
      message: 'Resource updated successfully',
      resource
    });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({ message: 'Server error while updating resource' });
  }
});

// @route   DELETE /api/resources/:id
// @desc    Delete resource
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if user owns the resource or is admin
    if (resource.uploadedBy.toString() !== req.userId) {
      const user = await User.findById(req.userId);
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete this resource' });
      }
    }

    // Soft delete
    resource.isActive = false;
    await resource.save();

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ message: 'Server error while deleting resource' });
  }
});

module.exports = router;
