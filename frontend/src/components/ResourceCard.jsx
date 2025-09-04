import React from 'react';
import { Link } from 'react-router-dom';
import { Download, Eye, Star, Calendar, User, FileText } from 'lucide-react';
import StarRating from './StarRating';

const ResourceCard = ({ resource, showUploader = true }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'txt':
        return '📃';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '🖼️';
      default:
        return '📁';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'UPSC': 'bg-blue-100 text-blue-800',
      'JEE': 'bg-green-100 text-green-800',
      'GATE': 'bg-purple-100 text-purple-800',
      'NEET': 'bg-red-100 text-red-800',
      'CAT': 'bg-yellow-100 text-yellow-800',
      'SSC': 'bg-indigo-100 text-indigo-800',
      'Banking': 'bg-pink-100 text-pink-800',
      'Railway': 'bg-orange-100 text-orange-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['Other'];
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="card-header">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">{getFileIcon(resource.fileType)}</span>
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {resource.title}
              </h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(resource.examCategory)}`}>
                {resource.examCategory}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                {resource.section}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 ml-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-700">
              {resource.stars || 0}
            </span>
            <span className="text-xs text-gray-500">
              ({resource.totalRatings || 0})
            </span>
          </div>
        </div>
      </div>

      <div className="card-content">
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {resource.description}
        </p>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {resource.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
              >
                #{tag}
              </span>
            ))}
            {resource.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded text-xs">
                +{resource.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* File info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>{resource.fileName}</span>
            </span>
            <span>{formatFileSize(resource.fileSize)}</span>
          </div>
          <span className="flex items-center space-x-1">
            <Download className="w-4 h-4" />
            <span>{resource.downloadCount || 0}</span>
          </span>
        </div>

        {/* Uploader info */}
        {showUploader && resource.uploadedBy && (
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <User className="w-4 h-4" />
            <span>Uploaded by {resource.uploadedBy.name}</span>
            <span className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(resource.createdAt)}</span>
            </span>
          </div>
        )}

        {/* Star Rating Component */}
        <div className="mb-4">
          <StarRating 
            resourceId={resource._id}
            currentRating={0} // This would be passed from parent component
            readOnly={false}
            size="sm"
          />
        </div>
      </div>

      <div className="card-footer">
        <div className="flex space-x-2 w-full">
          <Link
            to={`/resource/${resource._id}`}
            className="flex-1 btn btn-outline btn-sm flex items-center justify-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </Link>
          <a
            href={resource.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 btn btn-primary btn-sm flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
