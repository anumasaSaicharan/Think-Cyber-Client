import React, { useState, useEffect } from 'react';
import { topicService, categoriesService, subcategoriesService } from '../services/apiService';
import Loading from '../components/student/Loading';
import TopicCard from '../components/student/TopicCard';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { assets } from '../assets/assets';

const TopicsList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State declarations
  const [topicsData, setTopicsData] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [topicsPerPage] = useState(12);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [wishlist, setWishlist] = useState(() => {
    const stored = localStorage.getItem('wishlist');
    return stored ? JSON.parse(stored) : [];
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setCategoriesLoading(true);

        const [topicsResponse, categoriesResponse, subcategoriesResponse] = await Promise.all([
          topicService.getAllTopics({ limit: 100 }).catch(() => ({ data: [] })),
          categoriesService.getAllCategories().catch(() => ({ data: [] })),
          subcategoriesService.getAllSubcategories().catch(() => ({ data: [] }))
        ]);

        setTopicsData(topicsResponse?.data || []);
        setFilteredTopics(topicsResponse?.data || []);

        const categoriesData = categoriesResponse?.data || [];
        const subcategoriesData = subcategoriesResponse?.data || [];

        // FIX: Use category_id (snake_case) from API response
        const categoriesWithSubcategories = categoriesData.map(category => ({
          ...category,
          subcategories: subcategoriesData.filter(sub => sub.category_id === category.id)
        }));

        console.log('Categories with subcategories:', categoriesWithSubcategories);

        setCategories(categoriesWithSubcategories);
        setSubcategories(subcategoriesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load content');
      } finally {
        setLoading(false);
        setCategoriesLoading(false);
      }
    };
    fetchData();
  }, []);

  // Restore filters from location state or sessionStorage
  useEffect(() => {
    if (!categoriesLoading && categories.length > 0 && subcategories.length > 0) {
      setRestoring(true);
      
      if (location.state) {
        // Restore from location.state
        if (location.state.fromCategory) {
          setSelectedCategory(Number(location.state.fromCategory));
        } else if (location.state.fromSubCategory) {
          const subcat = subcategories.find(sub => sub.id === Number(location.state.fromSubCategory));
          if (subcat) {
            setSelectedCategory(subcat.category_id);
          }
        }
        if (location.state.fromSubCategory) {
          setSelectedSubcategory(Number(location.state.fromSubCategory));
        }
        if (location.state.appliedFilters) {
          const filters = location.state.appliedFilters;
          if (filters.priceFilter) setPriceFilter(filters.priceFilter);
          if (filters.searchQuery) setSearchQuery(filters.searchQuery);
        }
      } else {
        // Restore from sessionStorage
        const savedCategory = sessionStorage.getItem('selectedCategory');
        const savedSubcategory = sessionStorage.getItem('selectedSubcategory');
        const savedPriceFilter = sessionStorage.getItem('priceFilter') || 'all';
        const savedSearchQuery = sessionStorage.getItem('searchQuery') || '';

        if (savedCategory) setSelectedCategory(Number(savedCategory));
        if (savedSubcategory) setSelectedSubcategory(Number(savedSubcategory));
        setPriceFilter(savedPriceFilter);
        setSearchQuery(savedSearchQuery);
      }

      setSidebarOpen(true);
      const timeoutId = setTimeout(() => setRestoring(false), 200);

      return () => clearTimeout(timeoutId);
    } else {
      setRestoring(false);
    }
  }, [location.state, categoriesLoading, categories, subcategories]);

  // Save filters to sessionStorage
  useEffect(() => {
    if (selectedCategory) {
      sessionStorage.setItem('selectedCategory', selectedCategory.toString());
    } else {
      sessionStorage.removeItem('selectedCategory');
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedSubcategory) {
      sessionStorage.setItem('selectedSubcategory', selectedSubcategory.toString());
    } else {
      sessionStorage.removeItem('selectedSubcategory');
    }
  }, [selectedSubcategory]);

  useEffect(() => {
    sessionStorage.setItem('priceFilter', priceFilter);
  }, [priceFilter]);

  useEffect(() => {
    sessionStorage.setItem('searchQuery', searchQuery);
  }, [searchQuery]);

  // Sync wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Reset subcategory when category changes (not during restoration)
  useEffect(() => {
    if (!restoring && !location.state) {
      setSelectedSubcategory('');
    }
  }, [selectedCategory, restoring, location.state]);

  // Filter topics based on selected filters
  useEffect(() => {
    let filtered = [...topicsData];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(topic =>
        topic.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(topic => {
        const categoryId = Number(selectedCategory);
        return topic.categoryId === categoryId || 
               topic.category?.id === categoryId;
      });
    }

    // Filter by subcategory
    if (selectedSubcategory) {
      filtered = filtered.filter(topic => {
        const subcategoryId = Number(selectedSubcategory);
        return topic.subcategoryId === subcategoryId ||
               topic.subcategory?.id === subcategoryId;
      });
    }

    // Filter by price
    if (priceFilter === 'free') {
      filtered = filtered.filter(topic => topic.price === 0 || topic.isFree);
    } else if (priceFilter === 'paid') {
      filtered = filtered.filter(topic => topic.price > 0 || !topic.isFree);
    }

    setFilteredTopics(filtered);
    setCurrentPage(1);
  }, [topicsData, searchQuery, selectedCategory, selectedSubcategory, priceFilter]);

  // Pagination logic
  const indexOfLastTopic = currentPage * topicsPerPage;
  const indexOfFirstTopic = indexOfLastTopic - topicsPerPage;
  const currentTopics = filteredTopics.slice(indexOfFirstTopic, indexOfLastTopic);
  const totalPages = Math.ceil(filteredTopics.length / topicsPerPage);

  // Transform topics data for display
  const transformedTopics = currentTopics.map((topic, index) => ({
    id: topic.id || (index + 1).toString().padStart(2, '0'),
    title: topic.name || topic.title || `Topic ${index + 1}`,
    description: topic.description || `Description for ${topic.name || 'topic'}`,
    price: topic.price || (Math.random() > 0.5 ? 0 : Math.floor(Math.random() * 100) + 20),
    isFree: topic.isFree || topic.price === 0,
    icon: topic.icon || (index % 3 === 0 ? assets.basic_security_icon : 
                         index % 3 === 1 ? assets.business_owner_icon : 
                         assets.follower_icon),
    borderColor: index % 3 === 0 ? "border-blue-600" : 
                 index % 3 === 1 ? "border-[#146DA5]" : "border-[#039198]",
    textColor: index % 3 === 0 ? "text-blue-600" : 
               index % 3 === 1 ? "text-[#146DA5]" : "text-[#039198]",
  }));

  // Check if topic is in wishlist
  const isInWishlist = (topicId) => wishlist.some((item) => item.id === topicId);

  // Handle wishlist click
  const handleWishlistClick = (topic) => {
    if (isInWishlist(topic.id)) {
      setWishlist(wishlist.filter((item) => item.id !== topic.id));
      toast.success('Topic removed from wishlist!');
    } else {
      setWishlist([...wishlist, topic]);
      toast.success('Topic added to your wishlist!');
    }
  };

  // Handle category click
  const handleCategoryClick = (categoryId) => {
    if (restoring) return;
    
    const newValue = selectedCategory === categoryId ? '' : categoryId;
    setSelectedCategory(newValue);
    
    // Reset subcategory when toggling category closed
    if (newValue === '') {
      setSelectedSubcategory('');
    }
  };

  // Pagination component
  const Pagination = () => (
    <div className="flex justify-center items-center space-x-2 mt-8">
      <button
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-md bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      
      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index + 1}
          onClick={() => setCurrentPage(index + 1)}
          className={`px-3 py-2 rounded-md ${
            currentPage === index + 1
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          {index + 1}
        </button>
      ))}
      
      <button
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-md bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden p-4 bg-white shadow-sm">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span>Filters</span>
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:shadow-none`}>
          
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Filters</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="p-6 space-y-6 overflow-y-auto h-full pb-32">
            {/* Categories */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Categories</h3>
              <div className="space-y-3">
                {categoriesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="ml-4 space-y-1">
                          <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : categories.length > 0 ? (
                  categories.map((category) => (
                    <div key={category.id}>
                      <div
                        onClick={() => handleCategoryClick(category.id)}
                        className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-gray-100"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-gray-700 font-medium">{category.name}</span>

                          <div className="flex items-center space-x-2">
                            {category.price != null && (
                              <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs font-semibold">
                                {category.price === 0 ? "Free" : `₹${category.price}`}
                              </span>
                            )}

                            <svg 
                              className={`w-4 h-4 transform transition-transform ${
                                selectedCategory === category.id ? 'rotate-180' : ''
                              }`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      {/* Subcategories */}
                      {selectedCategory === category.id && category.subcategories && category.subcategories.length > 0 && (
                        <div className="ml-4 mt-2 space-y-1">
                          {category.subcategories.map((sub) => (
                            <label key={sub.id} className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-gray-50 rounded">
                              <input
                                type="radio"
                                name="subcategory"
                                value={sub.id}
                                checked={selectedSubcategory === sub.id}
                                onChange={(e) => setSelectedSubcategory(Number(e.target.value))}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-gray-600 text-sm">{sub.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">No categories available</div>
                )}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Price</h3>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All Topics' },
                  { value: 'free', label: 'Free' },
                  { value: 'paid', label: 'Paid' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      value={option.value}
                      checked={priceFilter === option.value}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedSubcategory('');
                  setPriceFilter('all');
                  setSearchQuery('');
                  sessionStorage.clear();
                }}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">All Topics</h1>
               
              {/* Results count */}
              <div className="mt-4 text-gray-600">
                Showing {filteredTopics.length} topic{filteredTopics.length !== 1 ? 's' : ''}
                {searchQuery && ` for "${searchQuery}"`}
              </div>
            </div>

            {/* Topics Grid */}
            {transformedTopics.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {transformedTopics.map((topic) => (
                    <TopicCard 
                      key={topic.id} 
                      topic={topic} 
                      isInWishlist={isInWishlist}
                      onWishlistClick={handleWishlistClick}
                      showPrice={true}
                      className="min-h-[200px]"
                      selectedCategory={selectedCategory}
                      selectedSubCategory={selectedSubcategory}
                      filters={{
                        priceFilter,
                        searchQuery
                      }}
                    />
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && <Pagination />}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No topics found</div>
                <p className="text-gray-400 mt-2">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicsList;