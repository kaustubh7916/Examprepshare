const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: true
  },
  stars: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true,
    maxlength: [500, 'Review cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Ensure one rating per user per resource
ratingSchema.index({ user: 1, resource: 1 }, { unique: true });

// Update resource stars when rating is saved/updated/deleted
ratingSchema.post('save', async function() {
  await this.constructor.updateResourceStars(this.resource);
});

ratingSchema.post('findOneAndUpdate', async function() {
  if (this._conditions.resource) {
    await this.constructor.updateResourceStars(this._conditions.resource);
  }
});

ratingSchema.post('findOneAndDelete', async function() {
  if (this._conditions.resource) {
    await this.constructor.updateResourceStars(this._conditions.resource);
  }
});

// Static method to update resource stars
ratingSchema.statics.updateResourceStars = async function(resourceId) {
  const stats = await this.aggregate([
    { $match: { resource: resourceId } },
    {
      $group: {
        _id: null,
        averageStars: { $avg: '$stars' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Resource').findByIdAndUpdate(resourceId, {
      stars: Math.round(stats[0].averageStars * 10) / 10,
      totalRatings: stats[0].totalRatings
    });
  } else {
    await mongoose.model('Resource').findByIdAndUpdate(resourceId, {
      stars: 0,
      totalRatings: 0
    });
  }
};

module.exports = mongoose.model('Rating', ratingSchema);
