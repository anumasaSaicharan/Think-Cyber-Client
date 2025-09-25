import React, { useEffect, useState } from 'react';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    // Get wishlist from localStorage
    const stored = localStorage.getItem('wishlist');
    if (stored) {
      setWishlist(JSON.parse(stored));
    }
  }, []);

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>
      {wishlist.length === 0 ? (
        <p className="text-gray-500">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((topic) => (
            <div key={topic.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col min-h-[220px]">
              <div className="flex flex-col items-start justify-start h-[70px] mb-2">
                <img src={topic.icon} alt={topic.title} className="w-14 h-14 object-contain" />
              </div>
              <div className={`border-l-4 ${topic.borderColor} pl-3 flex-1`}>
                <h3 className={`text-lg w-full font-bold mb-1 ${topic.textColor} leading-tight`}>{topic.title}</h3>
                <p className="text-base text-gray-600 mb-0 overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                  {topic.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
