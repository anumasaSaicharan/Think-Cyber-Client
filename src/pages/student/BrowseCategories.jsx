import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';
import { CategoriesGrid } from '../../components/student/CategoryShowcase';
import Loading from '../../components/student/Loading';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { API_ENDPOINTS, getHeaders } from '../../config/api.config';

/**
 * BrowseCategories Page
 * Displays all categories grouped by plan type with filtering and search
 */
const BrowseCategories = () => {
  const navigate = useNavigate();
  const { userData } = useContext(AppContext);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlanType, setSelectedPlanType] = useState('ALL');
  const [sortBy, setSortBy] = useState('recent');

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.CATEGORIES, {
          method: 'GET',
          headers: getHeaders()
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            // Ensure each category has plan_type (fallback to BUNDLE if missing)
            const categoriesWithPlanType = data.data
              .map(cat => ({
                ...cat,
                plan_type: cat.plan_type || 'BUNDLE'
              }))
              .sort((a, b) => (a.priority || 0) - (b.priority || 0)); // Sort by priority ascending
            setCategories(categoriesWithPlanType);
            setFilteredCategories(categoriesWithPlanType);
          }
        } else {
          toast.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Error loading categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let results = [...categories];

    // Filter by plan type
    if (selectedPlanType !== 'ALL') {
      results = results.filter(cat => cat.plan_type === selectedPlanType);
    }

    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      results = results.filter(cat =>
        cat.name.toLowerCase().includes(term) ||
        cat.description.toLowerCase().includes(term)
      );
    }

    // Sort
    switch (sortBy) {
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        results.sort((a, b) => (a.bundle_price || 0) - (b.bundle_price || 0));
        break;
      case 'price-high':
        results.sort((a, b) => (b.bundle_price || 0) - (a.bundle_price || 0));
        break;
      case 'topics':
        results.sort((a, b) => (b.topicsCount || 0) - (a.topicsCount || 0));
        break;
      case 'recent':
      default:
        // Sort by priority (lower priority first)
        results.sort((a, b) => (a.priority || 0) - (b.priority || 0));
        break;
    }

    setFilteredCategories(results);
  }, [searchTerm, selectedPlanType, sortBy, categories]);

  const handleViewDetails = (category) => {
    // Navigate to category topics view
    navigate(`/category/${category.id}`, {
      state: { category, categoryName: category.name }
    });
  };

  const handleEnroll = (category) => {
    if (!userData || !userData.id) {
      toast.error('Please login to enroll');
      navigate('/login');
      return;
    }

    // Handle enrollment based on plan type
    if (category.plan_type === 'FREE') {
      // Show notification for free enrollment
      toast.info('This category is free! Enroll from the topics page.');
      navigate(`/category/${category.id}`, {
        state: { category, categoryName: category.name }
      });
    } else {
      // Navigate to category page for paid options
      navigate(`/category/${category.id}`, {
        state: { category, categoryName: category.name }
      });
    }
  };

  const planTypeOptions = [
    { value: 'ALL', label: '📌 All Categories' },
    { value: 'FREE', label: '🎁 Free Learning' },
    { value: 'BUNDLE', label: '📦 Bundle Plans' },
    { value: 'INDIVIDUAL', label: '📚 Individual Topics' },
    { value: 'FLEXIBLE', label: '⚡ Flexible Access' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'topics', label: 'Most Topics' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Explore Courses
          </h1>
          <p className="text-gray-600 text-lg">
            Choose from {categories.length} comprehensive courses across different learning paths
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search courses by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Plan Type Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FiFilter className="inline mr-1" size={16} />
                Course Type
              </label>
              <select
                value={selectedPlanType}
                onChange={(e) => setSelectedPlanType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                {planTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-800">{filteredCategories.length}</span> of <span className="font-semibold text-gray-800">{categories.length}</span> courses
          </div>
        </div>

        {/* Categories Grid */}
        <CategoriesGrid
          categories={filteredCategories}
          onViewDetails={handleViewDetails}
          onEnroll={handleEnroll}
          loading={loading}
        />

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <InfoCard
            icon="🎓"
            title="Learn Anytime"
            description="Access courses at your own pace, 24/7"
          />
          <InfoCard
            icon="💰"
            title="Flexible Pricing"
            description="Choose what works best for your budget"
          />
          <InfoCard
            icon="🏆"
            title="Get Certified"
            description="Earn certificates upon completion"
          />
          <InfoCard
            icon="🚀"
            title="Expert Instructors"
            description="Learn from industry professionals"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * InfoCard - Reusable info card component
 */
const InfoCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

export default BrowseCategories;
