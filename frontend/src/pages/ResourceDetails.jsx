import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Download, 
  Star, 
  Calendar, 
  User, 
  FileText, 
  ArrowLeft,
  Share2,
  Eye,
  ThumbsUp,
  MessageCircle
} from 'lucide-react';
import { resourcesAPI, ratingsAPI } from '../utils/api';
import StarRating from '../components/StarRating';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const ResourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRatings, setTotalRatings] = useState(0);

  const { user } = useAuth();
  const isOwnerOrAdmin =
    user &&
    resource &&
    (resource.uploadedBy._id === user.id || user.role === 'admin');

  useEffect(() => {
    fetchResource();
    fetchRatingStats();
  }, [id]);

  useEffect(() => {
    if (resource) {
      fetchRatings(1);
    }
  }, [resource]);

  const fetchResource = async () => {
    try {
      setLoading(true);
      const response = await resourcesAPI.getById(id);
      setResource(response.data.resource);
    } catch (error) {
      console.error('Error fetching resource:', error);
      toast.error('Failed to load resource');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchRatingStats = async () => {
    try {
      const response = await ratingsAPI.getStats(id);
      setRatingStats(response.data);
    } catch (error) {
      console.error('Error fetching rating stats:', error);
    }
  };

  const fetchRatings = async (page = 1) => {
    try {
      setRatingsLoading(true);
      const response = await ratingsAPI.getByResource(id, { page, limit: 10 });
      setRatings(response.data.ratings);
      setTotalRatings(response.data.pagination.totalRatings);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching ratings:', error);
      toast.error('Failed to load ratings');
    } finally {
      setRatingsLoading(false);
    }
  };

  const handleRatingChange = (newRating) => {
    // Refresh rating stats after rating change
    fetchRatingStats();
  };

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
      month: 'long',
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

  const handleDownload = () => {
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = resource.fileUrl;
    link.download = resource.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: resource.title,
          text: resource.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await resourcesAPI.delete(resource._id);
        toast.success('Resource deleted!');
        navigate('/dashboard');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Delete failed');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Resource Not Found</h1>
        <p className="text-gray-600 mb-8">The resource you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="btn btn-primary">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resource Header */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-3xl">{getFileIcon(resource.fileType)}</span>
                    <h1 className="text-2xl font-bold text-gray-900">{resource.title}</h1>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(resource.examCategory)}`}>
                      {resource.examCategory}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {resource.section}
                    </span>
                  </div>

                  <p className="text-gray-700 leading-relaxed">{resource.description}</p>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="card-content">
              {/* File Information */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900">{resource.fileName}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(resource.fileSize)} • {resource.fileType.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleDownload}
                      className="btn btn-primary flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    {isOwnerOrAdmin && (
                      <button
                        onClick={handleDelete}
                        className="btn bg-red-600 text-white hover:bg-red-700 ml-2"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              {resource.tags && resource.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {resource.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Uploader Info */}
              <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Uploaded by {resource.uploadedBy.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(resource.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Download className="w-4 h-4" />
                    <span>{resource.downloadCount} downloads</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Section */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Rate this Resource</h2>
            </div>
            <div className="card-content">
              <StarRating
                resourceId={resource._id}
                currentRating={0}
                readOnly={false}
                size="lg"
                onRatingChange={handleRatingChange}
              />
            </div>
          </div>

          {/* Reviews Section */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Reviews ({totalRatings})
                </h2>
                {ratingStats && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="font-medium">{ratingStats.averageStars}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({ratingStats.totalRatings} ratings)
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="card-content">
              {ratingsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : ratings.length > 0 ? (
                <div className="space-y-4">
                  {ratings.map((rating) => (
                    <div key={rating._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{rating.user.name}</p>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < rating.stars
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(rating.createdAt)}
                        </span>
                      </div>
                      {rating.review && (
                        <p className="text-gray-700 text-sm">{rating.review}</p>
                      )}
                    </div>
                  ))}

                  {/* Load More Button */}
                  {currentPage * 10 < totalRatings && (
                    <div className="text-center pt-4">
                      <button
                        onClick={() => fetchRatings(currentPage + 1)}
                        className="btn btn-outline"
                        disabled={ratingsLoading}
                      >
                        Load More Reviews
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No reviews yet. Be the first to rate this resource!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Rating Stats */}
          {ratingStats && (
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-gray-900">Rating Breakdown</h3>
              </div>
              <div className="card-content">
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700 w-6">{star}</span>
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${ratingStats.starDistribution[star] > 0 
                              ? (ratingStats.starDistribution[star] / ratingStats.totalRatings) * 100 
                              : 0}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 w-8">
                        {ratingStats.starDistribution[star] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Related Resources */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-gray-900">More Resources</h3>
            </div>
            <div className="card-content">
              <p className="text-sm text-gray-600">
                Discover more resources in the same category.
              </p>
              <Link
                to={`/dashboard?examCategory=${resource.examCategory}`}
                className="btn btn-outline btn-sm mt-4 w-full"
              >
                View All {resource.examCategory} Resources
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetails;
