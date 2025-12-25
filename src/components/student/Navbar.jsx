import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { topicService } from '../../services/apiService';
import LoginModal from './LoginModal';
import UserDropdown from './UserDropdown';
import LanguageDropdown from './LanguageDropdown';


const Navbar = () => {
  const { userData } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [wishlist, setWishlist] = React.useState(() => {
    const stored = localStorage.getItem('wishlist');
    return stored ? JSON.parse(stored) : [];
  });
  const [topics, setTopics] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [showResults, setShowResults] = React.useState(false);

  // Sync wishlist from localStorage on storage change (for multi-tab) and custom events
  useEffect(() => {
    const handleStorage = () => {
      const stored = localStorage.getItem('wishlist');
      setWishlist(stored ? JSON.parse(stored) : []);
    };

    const handleWishlistUpdate = () => {
      console.log('Navbar - Custom wishlist update event received');
      const stored = localStorage.getItem('wishlist');
      const newWishlist = stored ? JSON.parse(stored) : [];
      console.log('Navbar - Updated wishlist from event:', newWishlist);
      setWishlist(newWishlist);
    };

    // Listen for storage events (cross-tab)
    window.addEventListener('storage', handleStorage);

    // Listen for custom wishlist update events (same-tab)
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);

    // Also check periodically to ensure sync
    const interval = setInterval(() => {
      const stored = localStorage.getItem('wishlist');
      const currentWishlist = stored ? JSON.parse(stored) : [];
      if (JSON.stringify(currentWishlist) !== JSON.stringify(wishlist)) {
        setWishlist(currentWishlist);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
      clearInterval(interval);
    };
  }, [wishlist]);

  console.log('Navbar - Wishlist:', wishlist);
  console.log('Navbar - Wishlist length:', wishlist.length);
  if (userData && userData.isVerified) {
    setShowLogin(true);
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between px-4 sm:px-10 md:px-10 lg:px-24 border-b border-gray-300 py-2 bg-white">
        {/* Left side - Mobile Menu Button + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex flex-col gap-1 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="block w-6 h-0.5 bg-gray-600 transition-transform"></span>
            <span className="block w-6 h-0.5 bg-gray-600 transition-opacity"></span>
            <span className="block w-6 h-0.5 bg-gray-600 transition-transform"></span>
          </button>

          {/* Logo */}
          <a href="/">
            <img src={assets.logo} alt="Logo" className="w-36 lg:w-56 cursor-pointer" />
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-12 text-[#747579] font-semibold">
          <a href="/" className="hover:text-blue-600">Home</a>
          <a href="/about" className="hover:text-blue-600">About Us</a>
          <a href="/topics" className="hover:text-blue-600">Topics</a>
          <a href="/our-plans" className="hover:text-blue-600">Features</a>
          <a href="/contact" className="hover:text-blue-600">Contact Us</a>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-4">
          <Link to="/wishlist">
            <img src={assets.favorite_icon} alt="Favorites" className="w-12 h-12" />
          </Link>

          {/* Language Dropdown */}
          <div className="hidden sm:block">
            <LanguageDropdown assets={assets} />
          </div>

          {/* User Dropdown */}
          {userData ? (
            <UserDropdown assets={assets} userData={userData} />
          ) : (
            <button onClick={() => setShowLogin(true)}>
              <img src={assets.usernew_icon} alt="User" className="w-12 h-12" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Slide Menu Overlay */}
      <div className={`md:hidden fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'} z-40`} onClick={() => setMobileMenuOpen(false)}></div>

      {/* Mobile Slide Menu */}
      <div className={`md:hidden fixed top-0 left-0 h-full w-80 bg-white shadow-xl transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} z-50`}>
        <div className="flex flex-col h-full">
          {/* Menu Header with Close Button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu Content */}
          <div className="flex flex-col flex-1 p-4 space-y-6">
            <a href="/" className="text-lg text-[#747579] font-semibold hover:text-blue-600 py-3 border-b border-gray-100" onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="/about" className="text-lg text-[#747579] font-semibold hover:text-blue-600 py-3 border-b border-gray-100" onClick={() => setMobileMenuOpen(false)}>About Us</a>
            <a href="/topics" className="text-lg text-[#747579] font-semibold hover:text-blue-600 py-3 border-b border-gray-100" onClick={() => setMobileMenuOpen(false)}>Topics</a>
            <a href="/our-plans" className="text-lg text-[#747579] font-semibold hover:text-blue-600 py-3 border-b border-gray-100" onClick={() => setMobileMenuOpen(false)}>Our Plans</a>
            <a href="/our-plans" className="text-lg text-[#747579] font-semibold hover:text-blue-600 py-3 border-b border-gray-100" onClick={() => setMobileMenuOpen(false)}>Our Plans</a>
            <a href="/contact" className="text-lg text-[#747579] font-semibold hover:text-blue-600 py-3 border-b border-gray-100" onClick={() => setMobileMenuOpen(false)}>Contact Us</a>
            {userData && (
              <a href="/profile" className="text-lg text-red-500 font-semibold hover:text-red-600 py-3 border-b border-gray-100" onClick={() => setMobileMenuOpen(false)}>My Profile (Account Settings)</a>
            )}

            {/* Mobile Language Dropdown */}
            <div className="py-3">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Language</h3>
              <LanguageDropdown assets={assets} />
            </div>
          </div>
        </div>
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
};

export default Navbar;
