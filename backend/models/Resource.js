const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  examCategory: {
    type: String,
    required: [true, 'Exam category is required'],
    enum: ['UPSC', 'JEE', 'GATE', 'NEET', 'CAT', 'SSC', 'Banking', 'Railway', 'Other']
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    enum: ['General', 'Optional', 'Subject-specific', 'Previous Papers', 'Notes', 'Books', 'Other']
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required']
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'other']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stars: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
resourceSchema.index({ examCategory: 1, section: 1 });
resourceSchema.index({ uploadedBy: 1 });
resourceSchema.index({ stars: -1 });
resourceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Resource', resourceSchema);
