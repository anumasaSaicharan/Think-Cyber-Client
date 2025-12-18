import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Get wishlist from localStorage
    const stored = localStorage.getItem('wishlist');
    if (stored) {
      setWishlist(JSON.parse(stored));
    }
  }, []);

  // Remove item from wishlist
  const removeFromWishlist = (topicId) => {
    const updatedWishlist = wishlist.filter(item => item.id !== topicId);
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));

    // Dispatch custom event to notify other components (like Navbar) about wishlist changes
    window.dispatchEvent(new CustomEvent('wishlistUpdated', {
      detail: { wishlist: updatedWishlist }
    }));

    toast.success('Course removed from wishlist!');
  };

  // Handle view more button click
  const handleViewMore = (topicId) => {
    navigate(`/course/${topicId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="mt-2 text-gray-600">
                {wishlist.length} {wishlist.length === 1 ? 'course' : 'courses'} in your wishlist
              </p>
            </div>
            <div className="flex items-center">
              <img src={assets.favorite_icon} alt="Wishlist" className="w-10 h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {wishlist.length === 0 ? (
          <div className="text-center py-16">
            <img src={assets.favorite_icon} alt="Empty Wishlist" className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">Start adding courses to your wishlist to see them here.</p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Topics
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((topic) => (
              <div key={topic.id} className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                {/* Course Icon/Image */}
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <img src={topic.icon} alt={topic.title} className="w-12 h-12 object-contain" />
                    <button
                      onClick={() => removeFromWishlist(topic.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      title="Remove from wishlist"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  {/* Course Title */}
                  <div className={`border-l-4 ${topic.borderColor} pl-3 mb-4`}>
                    <h3 className={`text-lg font-bold mb-2 ${topic.textColor} leading-tight`}>
                      {topic.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {topic.description}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 pb-6">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleViewMore(topic.id)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 text-sm"
                    >
                      View More
                    </button>
                    {/* <a
                        href={`/course/${topic.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white font-bold px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors text-sm shadow">
                        View more
                    </a> */}
                    <button
                      onClick={() => removeFromWishlist(topic.id)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
