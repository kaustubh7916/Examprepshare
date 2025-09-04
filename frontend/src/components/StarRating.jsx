import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { ratingsAPI } from '../utils/api';
import toast from 'react-hot-toast';

const StarRating = ({ 
  resourceId, 
  currentRating = 0, 
  readOnly = false, 
  size = 'md',
  showCount = true,
  onRatingChange 
}) => {
  const [rating, setRating] = useState(currentRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setRating(currentRating);
  }, [currentRating]);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleStarClick = async (starValue) => {
    if (readOnly || isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      const response = await ratingsAPI.addRating({
        resourceId,
        stars: starValue
      });

      setRating(starValue);
      
      if (onRatingChange) {
        onRatingChange(starValue);
      }

      toast.success('Rating submitted successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit rating';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarHover = (starValue) => {
    if (readOnly) return;
    setHoveredRating(starValue);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoveredRating(0);
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className="flex items-center space-x-1">
      <div 
        className="flex items-center space-x-1"
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((starValue) => (
          <button
            key={starValue}
            type="button"
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => handleStarHover(starValue)}
            disabled={readOnly || isSubmitting}
            className={`${sizeClasses[size]} transition-colors duration-150 ${
              readOnly ? 'cursor-default' : 'cursor-pointer'
            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                starValue <= displayRating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      
      {showCount && (
        <span className="text-sm text-gray-500 ml-1">
          ({rating}/5)
        </span>
      )}
      
      {isSubmitting && (
        <div className="ml-2">
          <div className="loading-spinner w-4 h-4"></div>
        </div>
      )}
    </div>
  );
};

export default StarRating;
