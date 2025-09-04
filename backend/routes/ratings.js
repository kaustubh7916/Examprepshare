const express = require('express');
const { body, validationResult } = require('express-validator');
const Rating = require('../models/Rating');
const Resource = require('../models/Resource');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/ratings
// @desc    Add or update rating for a resource
// @access  Private
router.post('/', auth, [
  body('resourceId').isMongoId().withMessage('Valid resource ID is required'),
  body('stars').isInt({ min: 1, max: 5 }).withMessage('Stars must be between 1 and 5'),
  body('review').optional().trim().isLength({ max: 500 }).withMessage('Review cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { resourceId, stars, review } = req.body;

    // Check if resource exists
    const resource = await Resource.findById(resourceId);
    if (!resource || !resource.isActive) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if user is trying to rate their own resource
    if (resource.uploadedBy.toString() === req.userId) {
      return res.status(400).json({ message: 'Cannot rate your own resource' });
    }

    // Find existing rating
    let rating = await Rating.findOne({ user: req.userId, resource: resourceId });

    if (rating) {
      // Update existing rating
      rating.stars = stars;
      if (review !== undefined) rating.review = review;
      await rating.save();
    } else {
      // Create new rating
      rating = new Rating({
        user: req.userId,
        resource: resourceId,
        stars,
        review: review || ''
      });
      await rating.save();
    }

    // Populate user details
    await rating.populate('user', 'name email');

    res.json({
      message: rating.stars !== stars ? 'Rating updated successfully' : 'Rating added successfully',
      rating
    });
  } catch (error) {
    console.error('Add/update rating error:', error);
    res.status(500).json({ message: 'Server error while adding rating' });
  }
});

// @route   GET /api/ratings/resource/:resourceId
// @desc    Get all ratings for a resource
// @access  Public
router.get('/resource/:resourceId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Check if resource exists
    const resource = await Resource.findById(req.params.resourceId);
    if (!resource || !resource.isActive) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const ratings = await Rating.find({ resource: req.params.resourceId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Rating.countDocuments({ resource: req.params.resourceId });

    res.json({
      ratings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRatings: total,
        hasNext: skip + ratings.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ message: 'Server error while fetching ratings' });
  }
});

// @route   GET /api/ratings/user/:userId
// @desc    Get all ratings by a user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const ratings = await Rating.find({ user: req.params.userId })
      .populate('resource', 'title examCategory section')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Rating.countDocuments({ user: req.params.userId });

    res.json({
      ratings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRatings: total,
        hasNext: skip + ratings.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get user ratings error:', error);
    res.status(500).json({ message: 'Server error while fetching user ratings' });
  }
});

// @route   GET /api/ratings/my-ratings
// @desc    Get current user's ratings
// @access  Private
router.get('/my-ratings', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const ratings = await Rating.find({ user: req.userId })
      .populate('resource', 'title examCategory section fileUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Rating.countDocuments({ user: req.userId });

    res.json({
      ratings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRatings: total,
        hasNext: skip + ratings.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get my ratings error:', error);
    res.status(500).json({ message: 'Server error while fetching your ratings' });
  }
});

// @route   DELETE /api/ratings/:ratingId
// @desc    Delete a rating
// @access  Private
router.delete('/:ratingId', auth, async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.ratingId);

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Check if user owns the rating
    if (rating.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this rating' });
    }

    await Rating.findByIdAndDelete(req.params.ratingId);

    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({ message: 'Server error while deleting rating' });
  }
});

// @route   GET /api/ratings/stats/:resourceId
// @desc    Get rating statistics for a resource
// @access  Public
router.get('/stats/:resourceId', async (req, res) => {
  try {
    const stats = await Rating.aggregate([
      { $match: { resource: require('mongoose').Types.ObjectId(req.params.resourceId) } },
      {
        $group: {
          _id: null,
          averageStars: { $avg: '$stars' },
          totalRatings: { $sum: 1 },
          starDistribution: {
            $push: '$stars'
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        averageStars: 0,
        totalRatings: 0,
        starDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    }

    const { averageStars, totalRatings, starDistribution } = stats[0];
    
    // Calculate star distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    starDistribution.forEach(star => {
      distribution[star] = (distribution[star] || 0) + 1;
    });

    res.json({
      averageStars: Math.round(averageStars * 10) / 10,
      totalRatings,
      starDistribution: distribution
    });
  } catch (error) {
    console.error('Get rating stats error:', error);
    res.status(500).json({ message: 'Server error while fetching rating statistics' });
  }
});

module.exports = router;
