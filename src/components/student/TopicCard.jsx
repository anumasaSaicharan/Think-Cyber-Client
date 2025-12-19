import React from 'react';
import { useNavigate } from 'react-router-dom';
import MarkdownRenderer from '../MarkdownRenderer';

const TopicCard = ({ 
  topic, 
  isInWishlist, 
  onWishlistClick, 
  showPrice = false,
  className = "",
  selectedCategory,
  selectedSubCategory,
  filters,
  isEnrolled = false
}) => {
  const navigate = useNavigate();

  return (
    <div className={`bg-white p-4 rounded-lg shadow-md border border-gray-200 relative min-h-[180px] flex flex-col ${className}`}>
      {/* Enrolled Badge */}
      {isEnrolled && (
        <div className="absolute top-3 right-12 z-10">
          <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
            ✓ Enrolled
          </span>
        </div>
      )}

      {/* Wishlist Heart Icon - Hidden when enrolled */}
      {!isEnrolled && (
        <span
          className="absolute top-3 right-3 text-red-500 text-xl cursor-pointer"
          onClick={() => onWishlistClick(topic)}
          title={isInWishlist(topic.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          {isInWishlist(topic.id) ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="red" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 17.5l-1.45-1.32C4.4 12.36 1 9.28 1 6.5A4.5 4.5 0 0 1 5.5 2c1.54 0 3.04.99 3.57 2.36h1.87C11.46 2.99 12.96 2 14.5 2A4.5 4.5 0 0 1 19 6.5c0 2.78-3.4 5.86-7.55 9.68L10 17.5z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 17.5l-1.45-1.32C4.4 12.36 1 9.28 1 6.5A4.5 4.5 0 0 1 5.5 2c1.54 0 3.04.99 3.57 2.36h1.87C11.46 2.99 12.96 2 14.5 2A4.5 4.5 0 0 1 19 6.5c0 2.78-3.4 5.86-7.55 9.68L10 17.5z" />
            </svg>
          )}
        </span>
      )}

      {/* Price Badge */}
      {showPrice && (
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded text-xs font-bold ${
            topic.isFree || topic.price === 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {topic.isFree || topic.price === 0 ? 'FREE' : `₹${topic.price}`}
          </span>
        </div>
      )}

      {/* Icon */}
      <div className={`flex flex-col items-start justify-start h-[70px] mb-2 ${showPrice ? 'mt-6' : ''}`}>
        <img src={topic.icon} alt={topic.title} className="w-14 h-14 object-contain" />
      </div>

      {/* Content */}
      <div className={`border-l-4 ${topic.borderColor} pl-3 flex-1`}>
        <h3 className={`text-sm w-full font-bold mb-1 ${topic.textColor} leading-tight`}>
          {topic.title.length > 50 ? `${topic.title.slice(0, 50)}...` : topic.title}
        </h3>
        <div 
          className="text-base text-gray-600 mb-0 overflow-hidden text-ellipsis line-clamp-3" 
          style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}
        >
          <MarkdownRenderer content={topic.description} />
        </div>
      </div>

      {/* View More Button */}
      <div className="flex justify-end mt-4">
        <button
          className="text-white font-bold px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors text-sm shadow"
          onClick={() => {
            // Save the current category, subcategory and filters in sessionStorage for persistence
            sessionStorage.setItem('fromCategory', selectedCategory || '');
            sessionStorage.setItem('fromSubCategory', selectedSubCategory || '');
            sessionStorage.setItem('appliedFilters', JSON.stringify(filters || {}));

            // Navigate to course detail page with state
            navigate(`/course/${topic.id}`, {
              state: {
                fromCategory: selectedCategory,
                fromSubCategory: selectedSubCategory,
                appliedFilters: filters
              }
            });
          }}
        >
          View more
        </button>
      </div>
    </div>
  );
};

export default TopicCard;
