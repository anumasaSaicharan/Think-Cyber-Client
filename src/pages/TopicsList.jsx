import React, { useState, useEffect, useContext, useRef } from 'react';
import { topicService, categoriesService, subcategoriesService, assessmentService } from '../services/apiService';
import Loading from '../components/student/Loading';
import TopicCard from '../components/student/TopicCard';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';

const TopicsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, currency } = useContext(AppContext);
  const hasRestoredRef = useRef(false);
  const checkedTopicIdsRef = useRef(new Set());
  const checkEnrollmentTimeoutRef = useRef(null);

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
  const [isBundleEnrolled, setIsBundleEnrolled] = useState(false);
  const [checkingBundleEnrollment, setCheckingBundleEnrollment] = useState(false);
  const [enrolledTopics, setEnrolledTopics] = useState(new Set()); // Track enrolled topic IDs
  const [hasCategoryEnrollments, setHasCategoryEnrollments] = useState(false); // Track if user has any enrollment in this category
  const [wishlist, setWishlist] = useState(() => {
    const stored = localStorage.getItem('wishlist');
    return stored ? JSON.parse(stored) : [];
  });
  const [sortOrder, setSortOrder] = useState('default'); // 'default', 'desc', or 'asc'
  const [assessmentConfig, setAssessmentConfig] = useState(null); // Track assessment config for selected category

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setCategoriesLoading(true);

        // Clear old navigation markers on fresh load (but keep filters)
        sessionStorage.removeItem('fromCategory');
        sessionStorage.removeItem('fromSubCategory');

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
        const categoriesWithSubcategories = categoriesData
          .sort((a, b) => (a.priority || 0) - (b.priority || 0)) // Sort by priority ascending
          .map(category => ({
            ...category,
            plan_type: category.plan_type || 'BUNDLE',
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

  // Refetch topics when category changes to catch any newly added topics
  useEffect(() => {
    if (selectedCategory) {
      const refetchTopics = async () => {
        try {
          console.log('Refetching topics for category:', selectedCategory);
          const topicsResponse = await topicService.getAllTopics({ limit: 100 }).catch(() => ({ data: [] }));
          const newTopics = topicsResponse?.data || [];
          console.log('Topics refetched:', newTopics.length, 'topics');
          setTopicsData(newTopics);
        } catch (err) {
          console.error('Error refetching topics:', err);
        }
      };

      // Small debounce to avoid too many requests
      const timer = setTimeout(refetchTopics, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedCategory]);

  // Restore filters from location state or sessionStorage
  useEffect(() => {
    if (!categoriesLoading && categories.length > 0 && !hasRestoredRef.current) {
      hasRestoredRef.current = true;
      setRestoring(true);

      let hasSavedCategory = false;
      let categoryToRestore = null;
      let subcategoryToRestore = null;
      let priceFilterToRestore = 'all';
      let searchQueryToRestore = '';

      // Priority 1: Check location.state (from goBack navigation)
      if (location.state && (location.state.fromCategory || location.state.fromSubCategory)) {
        console.log('Restoring from location.state:', location.state);

        if (location.state.fromCategory) {
          categoryToRestore = Number(location.state.fromCategory);
          hasSavedCategory = true;
        } else if (location.state.fromSubCategory) {
          const subcat = subcategories.find(sub => sub.id === Number(location.state.fromSubCategory));
          if (subcat) {
            categoryToRestore = subcat.category_id;
            hasSavedCategory = true;
          }
        }
        if (location.state.fromSubCategory) {
          subcategoryToRestore = Number(location.state.fromSubCategory);
        }
        if (location.state.appliedFilters) {
          const filters = location.state.appliedFilters;
          if (filters.priceFilter) priceFilterToRestore = filters.priceFilter;
          if (filters.searchQuery) searchQueryToRestore = filters.searchQuery;
        }
      } else {
        // Priority 2: Check sessionStorage (from TopicCard or page refresh)
        // Only use sessionStorage if we have a fromCategory or fromSubCategory marker (meaning we navigated within the app)
        const savedFromCategory = sessionStorage.getItem('fromCategory');
        const savedFromSubcategory = sessionStorage.getItem('fromSubCategory');

        if (savedFromCategory || savedFromSubcategory) {
          console.log('Restoring from sessionStorage (app navigation)');
          if (savedFromCategory) {
            categoryToRestore = Number(savedFromCategory);
            hasSavedCategory = true;
          } else if (savedFromSubcategory) {
            const subcat = subcategories.find(sub => sub.id === Number(savedFromSubcategory));
            if (subcat) {
              categoryToRestore = subcat.category_id;
              hasSavedCategory = true;
            }
          }
          if (savedFromSubcategory) {
            subcategoryToRestore = Number(savedFromSubcategory);
          }
        } else {
          // Fresh page load - don't restore from sessionStorage, use defaults
          console.log('Fresh page load - using default first category');
        }

        const savedPriceFilter = sessionStorage.getItem('priceFilter') || 'all';
        const savedSearchQuery = sessionStorage.getItem('searchQuery') || '';
        priceFilterToRestore = savedPriceFilter;
        searchQueryToRestore = savedSearchQuery;
      }

      // Apply restored state
      if (hasSavedCategory && categoryToRestore) {
        console.log('Setting category to:', categoryToRestore);
        setSelectedCategory(categoryToRestore);
      } else {
        // Auto-select FREE category, or default to first category
        console.log('No saved category, auto-selecting first available category');
        const freeCategory = categories.find(cat => cat.plan_type === 'FREE');
        if (freeCategory) {
          console.log('Found FREE category:', freeCategory.id);
          setSelectedCategory(freeCategory.id);
        } else if (categories.length > 0) {
          console.log('No FREE category found, selecting first category:', categories[0].id);
          setSelectedCategory(categories[0].id);
        }
      }

      if (subcategoryToRestore) {
        setSelectedSubcategory(subcategoryToRestore);
      }

      setPriceFilter(priceFilterToRestore);
      setSearchQuery(searchQueryToRestore);

      setSidebarOpen(true);
      const timeoutId = setTimeout(() => setRestoring(false), 200);

      return () => clearTimeout(timeoutId);
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
  // Check bundle enrollment when category changes
  useEffect(() => {
    if (selectedCategory) {
      checkBundleEnrollment(selectedCategory);
      // Fetch assessment config for the category
      fetchAssessmentConfig(selectedCategory);
    } else {
      setIsBundleEnrolled(false);
      setHasCategoryEnrollments(false);
      setAssessmentConfig(null);
    }
  }, [selectedCategory, userData]);

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

  // Check enrollment status for all topics when user logs in, topics change, or category changes
  // Check enrollment status for all topics when user logs in, topics change, or category changes
  useEffect(() => {
    // Clear checked cache and enrolled topics if irrelevant (no user)
    if (!userData || !userData.id) {
      checkedTopicIdsRef.current.clear();
      setEnrolledTopics(new Set());
      return;
    }

    if (filteredTopics.length > 0) {
      // Debounce the check to prevent multiple calls during rapid state updates/renders
      if (checkEnrollmentTimeoutRef.current) {
        clearTimeout(checkEnrollmentTimeoutRef.current);
      }

      checkEnrollmentTimeoutRef.current = setTimeout(() => {
        // Optimize: Only check enrollment for visible topics (current page) 
        const indexOfLastTopic = currentPage * topicsPerPage;
        const indexOfFirstTopic = indexOfLastTopic - topicsPerPage;
        const currentVisibleTopics = filteredTopics.slice(indexOfFirstTopic, indexOfLastTopic);

        checkTopicEnrollments(currentVisibleTopics);
      }, 500); // 500ms delay to ensure state is settled
    }

    return () => {
      if (checkEnrollmentTimeoutRef.current) {
        clearTimeout(checkEnrollmentTimeoutRef.current);
      }
    };
  }, [userData, filteredTopics, currentPage, selectedCategory, topicsPerPage]);

  // Clear cache when checking mode might change significantly
  useEffect(() => {
    checkedTopicIdsRef.current.clear();
  }, [selectedCategory]);

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
          topic.category?.id === categoryId ||
          topic.category_id === categoryId;
      });
    }

    // Filter by subcategory
    if (selectedSubcategory) {
      filtered = filtered.filter(topic => {
        const subcategoryId = Number(selectedSubcategory);
        return topic.subcategoryId === subcategoryId ||
          topic.subcategory?.id === subcategoryId ||
          topic.subcategory_id === subcategoryId;
      });
    }

    // Filter by price
    if (priceFilter === 'free') {
      filtered = filtered.filter(topic =>
        topic.price === 0 || topic.price < 1 || topic.isFree === true
      );
    } else if (priceFilter === 'paid') {
      filtered = filtered.filter(topic =>
        topic.price > 0 && topic.isFree !== true
      );
    }

    // Sort by date
    if (sortOrder !== 'default') {
      filtered.sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || 0);
        const dateB = new Date(b.created_at || b.createdAt || 0);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
    }

    setFilteredTopics(filtered);
    setCurrentPage(1);
  }, [topicsData, searchQuery, selectedCategory, selectedSubcategory, priceFilter, sortOrder]);

  // Get selected category object
  const getSelectedCategoryObj = () => {
    return categories.find(cat => cat.id === Number(selectedCategory));
  };

  // Calculate actual topics count for selected category
  const getTopicsCountForCategory = (categoryId) => {
    if (!categoryId) return 0;
    return topicsData.filter(topic => {
      const catId = Number(categoryId);
      return topic.categoryId === catId ||
        topic.category?.id === catId ||
        topic.category_id === catId;
    }).length;
  };

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

  // Check if user is enrolled in specific topic
  const isTopicEnrolled = (topicId) => enrolledTopics.has(topicId);

  // Check enrollment status for all displayed topics (respects future_topics_included)
  const checkTopicEnrollments = async (topicsToCheck) => {
    if (!userData || !userData.id || topicsToCheck.length === 0) {
      console.log('checkTopicEnrollments: Missing user data or no topics to check');
      // Don't clear enrolled topics here as we might just be viewing a page with no topics
      return;
    }

    try {
      const newEnrollments = new Set();

      // Filter out topics we've already checked to prevent duplicate API calls
      // UNLESS we are in category mode where we want to do a batch check for efficiency
      let topicsToProcess = [];

      if (selectedCategory) {
        // In category mode, let batch check run if not recently checked
        topicsToProcess = topicsToCheck;
      } else {
        // Individual checks: Strict filtering
        topicsToProcess = topicsToCheck.filter(topic => !checkedTopicIdsRef.current.has(topic.id));

        if (topicsToProcess.length === 0) {
          // All visible topics already checked
          return;
        }
      }

      // If we have a selected category, use the batch endpoint for better performance
      if (selectedCategory) {
        try {
          const categoryIdInt = Number(selectedCategory);
          const catKey = `cat_${categoryIdInt}`;

          if (checkedTopicIdsRef.current.has(catKey)) {
            return;
          }

          console.log('Checking category access for user:', userData.id, 'category:', selectedCategory);
          const categoryAccessRes = await topicService.getCategoryTopicsAccess(userData.id, selectedCategory);
          console.log('Category topics access response:', categoryAccessRes);

          // Mark category as checked
          checkedTopicIdsRef.current.add(catKey);
          // Mark all visible topics as checked to prevent future re-checks
          topicsToCheck.forEach(t => checkedTopicIdsRef.current.add(t.id));

          // Check both possible field names from backend
          const accessibleTopics = categoryAccessRes?.accessibleTopics || categoryAccessRes?.accessible_topics || [];
          console.log('Accessible topics from backend:', accessibleTopics);

          if (Array.isArray(accessibleTopics) && accessibleTopics.length > 0) {
            console.log('Found', accessibleTopics.length, 'accessible topics');

            // If we have accessible topics, set flag for category enrollment
            setHasCategoryEnrollments(true);

            accessibleTopics.forEach(topicId => {
              newEnrollments.add(topicId);
            });

            // Merge with existing enrollments
            setEnrolledTopics(prev => {
              const next = new Set(prev);
              newEnrollments.forEach(id => next.add(id));
              return next;
            });
            console.log('Updated enrolled topics set via batch category check');
            return;
          } else {
            console.log('No accessible topics found in category response');
          }
        } catch (categoryError) {
          console.error('Error checking category topics access:', categoryError);
          // Fall through to individual checks
        }
      }

      // Fallback: Check enrollment for each topic individually (slower but still works)
      console.log('Checking individual topic access for', topicsToProcess.length, 'topics');
      for (const topic of topicsToProcess) {
        try {
          // Double check ref
          if (checkedTopicIdsRef.current.has(topic.id)) continue;

          // Mark as checked to prevent parallel requests
          checkedTopicIdsRef.current.add(topic.id);

          // Skip if already known to be enrolled (optimization)
          if (enrolledTopics.has(topic.id)) {
            continue;
          }

          // Use new endpoint that handles both direct enrollment and bundle future topics
          const res = await topicService.checkTopicAccess(userData.id, topic.id);
          if (res?.hasAccess) {
            newEnrollments.add(topic.id);
          }
        } catch (error) {
          // Fallback to old endpoint if new one fails
          try {
            const res = await topicService.checkUserEnrollment(userData.id, topic.id);
            if (res?.enrolled) {
              newEnrollments.add(topic.id);
            }
          } catch (fallbackError) {
            console.error(`Error checking enrollment for topic ${topic.id}:`, fallbackError);
          }
        }
      }

      // Merge new enrollments with existing ones
      if (newEnrollments.size > 0) {
        console.log('Found new enrollments:', newEnrollments);
        setEnrolledTopics(prev => {
          const next = new Set(prev);
          newEnrollments.forEach(id => next.add(id));
          return next;
        });
      }
    } catch (error) {
      console.error('Error checking topic enrollments:', error?.message || 'Request failed');
      // Don't clear on error, keep what we have
    }
  };

  // Check bundle enrollment
  const checkBundleEnrollment = async (categoryId) => {
    if (!userData || !userData.id) {
      setIsBundleEnrolled(false);
      return;
    }

    try {
      setCheckingBundleEnrollment(true);

      const categoryIdInt = Number(categoryId);
      const category = categories.find(c => c.id === categoryIdInt);

      // FIX: For FLEXIBLE plan, we must check strict bundle ownership
      // because checkBundleEnrollment might return true if user owns ANY topic
      if (category && category.plan_type === 'FLEXIBLE') {
        console.log('Checking strict bundle ownership for FLEXIBLE category');
        const bundlesRes = await topicService.getUserBundles(userData.id);
        console.log('User bundles response:', bundlesRes);

        // Handle various potential response structures
        const bundlesList = Array.isArray(bundlesRes) ? bundlesRes : (bundlesRes?.data || bundlesRes?.bundles || []);

        const hasBundle = bundlesList.some(b =>
          Number(b.category_id) === categoryIdInt ||
          Number(b.categoryId) === categoryIdInt
        );

        setIsBundleEnrolled(hasBundle);
      } else {
        // Standard check for BUNDLE or other types
        const res = await topicService.checkBundleEnrollment(userData.id, categoryId);
        console.log('Bundle enrollment check:', res);
        // Ensure we treat the response correctly based on backend structure
        setIsBundleEnrolled(res?.enrolled === true || res?.status === 'active');
      }

    } catch (error) {
      console.error('Error checking bundle enrollment:', error?.message || 'Request failed');
      setIsBundleEnrolled(false);
    } finally {
      setCheckingBundleEnrollment(false);
    }
  };

  // Fetch assessment config for a category
  const fetchAssessmentConfig = async (categoryId) => {
    try {
      console.log('Fetching assessment config for category:', categoryId, 'userId:', userData?.id);
      const response = await assessmentService.getAssessmentByCategory(categoryId, userData?.id || null);
      console.log('Assessment config response:', response);
      if (response?.success && response?.data?.is_enabled) {
        setAssessmentConfig(response.data);
        console.log('Assessment config set:', response.data);
      } else {
        setAssessmentConfig(null);
        console.log('Assessment not enabled or no data');
      }
    } catch (error) {
      console.error('Error fetching assessment config:', error?.message || 'Request failed');
      setAssessmentConfig(null);
    }
  };

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

  // Handle view category details
  const handleViewCategoryDetails = (category) => {
    navigate(`/category/${category.id}`, {
      state: { category, categoryName: category.name }
    });
  };

  // Handle enroll from category showcase
  const handleEnrollFromShowcase = (category) => {
    if (category.plan_type === 'FREE') {
      toast.info('This category is free! View topics to enroll.');
    }
    navigate(`/category/${category.id}`, {
      state: { category, categoryName: category.name }
    });
  };

  // Handle bundle purchase with Razorpay
  const handleBuyBundle = async (category) => {
    // Check if user is logged in
    if (!userData || !userData.id) {
      toast.error('Please log in to purchase this bundle');
      return;
    }

    // Check if category has bundle price
    if (!category.bundle_price || category.bundle_price <= 0) {
      toast.error('Bundle price not available');
      return;
    }

    try {
      const currencyCode = currency === '₹' ? 'INR' : 'USD';
      console.log('Initiating bundle purchase with Razorpay');

      // Create order for category bundle
      const orderData = await topicService.createOrder({
        userId: userData.id,
        categoryId: category.id,
        amount: category.bundle_price,
        currency: currencyCode,
        email: userData.email,
        isBundle: true
      });

      if (orderData.success) {
        // Initialize Razorpay checkout
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'ThinkCyber',
          description: `${category.name} - Bundle`,
          order_id: orderData.orderId,
          handler: async function (razorpayResponse) {
            try {
              // Verify payment on backend
              const verifyData = await topicService.verifyBundlePayment({
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
                userId: userData.id,
                categoryId: category.id,
              });

              if (verifyData.success) {
                toast.success('Bundle purchased successfully! You now have access to all topics in this category.');
                // Optionally refresh the page or update state
                window.location.reload();
              } else {
                toast.error('Payment verification failed');
              }
            } catch (error) {
              console.error('Payment verification error:', error?.message || 'Request failed');
              toast.error('Payment verification failed');
            }
          },
          prefill: {
            name: userData.name || '',
            email: userData.email || '',
            contact: userData.phone || '',
          },
          theme: {
            color: '#2563eb',
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        toast.error(orderData.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Bundle purchase error:', error?.message || 'Request failed');
      toast.error('Failed to initiate bundle purchase');
    }
  };

  // Helper functions for plan types
  const getPlanTypeEmoji = (planType) => {
    const emojis = {
      FREE: '🎁',
      BUNDLE: '📦',
      INDIVIDUAL: '📚',
      FLEXIBLE: '⚡'
    };
    return emojis[planType] || '📖';
  };

  const getPlanTypeColor = (planType) => {
    switch (planType) {
      case 'FREE':
        return {
          bg: 'bg-green-50',
          border: 'border-green-300',
          badge: 'bg-green-100 text-green-800',
          text: 'text-green-700',
          button: 'bg-green-500 hover:bg-green-600'
        };
      case 'BUNDLE':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-300',
          badge: 'bg-orange-100 text-orange-800',
          text: 'text-orange-700',
          button: 'bg-orange-500 hover:bg-orange-600'
        };
      case 'INDIVIDUAL':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-300',
          badge: 'bg-purple-100 text-purple-800',
          text: 'text-purple-700',
          button: 'bg-purple-500 hover:bg-purple-600'
        };
      case 'FLEXIBLE':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-300',
          badge: 'bg-blue-100 text-blue-800',
          text: 'text-blue-700',
          button: 'bg-blue-500 hover:bg-blue-600'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          badge: 'bg-gray-100 text-gray-800',
          text: 'text-gray-700',
          button: 'bg-gray-500 hover:bg-gray-600'
        };
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
          className={`px-3 py-2 rounded-md ${currentPage === index + 1
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
      <div className="lg:hidden p-4 bg-white shadow-sm border-b">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 w-full"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span>Browse Categories & Filter</span>
        </button>
      </div>

      <div className="flex">
        {/* Sidebar - Categories with Plan Types */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-96 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:shadow-none overflow-y-auto`}>

          {/* Sidebar Header */}
          <div className="sticky top-0 p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Learning Paths</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">Select a category to view topics</p>
          </div>

          {/* Categories List */}
          <div className="p-4 space-y-3">
            {categoriesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-24 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : categories.length > 0 ? (
              categories.map((category) => {
                const catColors = getPlanTypeColor(category.plan_type);
                const isSelected = selectedCategory === category.id;

                return (
                  <div key={category.id}>
                    {/* Category Card */}
                    <div
                      onClick={() => handleCategoryClick(category.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                        ? ` shadow-lg ring-2 ring-opacity-50`
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="text-3xl flex-shrink-0">
                          {getPlanTypeEmoji(category.plan_type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="font-bold text-gray-800 truncate flex-1">
                              {category.name}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-bold rounded whitespace-nowrap flex-shrink-0 ${catColors.badge}`}>
                              {category.plan_type}
                            </span>
                          </div>

                          {/* Pricing or Info */}
                          <div className="flex items-center justify-between gap-2 whitespace-nowrap">
                            <span className="text-xs text-gray-600">
                              📚 {getTopicsCountForCategory(category.id)} topics
                            </span>
                            {(category.plan_type === 'BUNDLE' || category.plan_type === 'FLEXIBLE') && (
                              <span className={`text-sm font-bold ${catColors.text}`}>
                                ₹{category.bundle_price || 0}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Subcategories dropdown */}
                      {isSelected && category.subcategories && category.subcategories.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-current border-opacity-20" onClick={(e) => e.stopPropagation()}>
                          <p className="text-xs font-semibold text-gray-700 mb-2">Subcategories:</p>
                          <div className="space-y-1">
                            {category.subcategories.map((sub) => (
                              <label key={sub.id} className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-white hover:bg-opacity-50 rounded">
                                <input
                                  type="radio"
                                  name="subcategory"
                                  value={sub.id}
                                  checked={selectedSubcategory === sub.id}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    setSelectedSubcategory(Number(e.target.value));
                                  }}
                                  className="focus:ring-blue-500 cursor-pointer"
                                />
                                <span className="text-xs text-gray-700">{sub.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Assessment Link - Show when assessment is enabled for this category */}
                      {isSelected && assessmentConfig && Number(assessmentConfig.category_id) === Number(category.id) && (
                        <div className="mt-3 pt-3 border-t border-current border-opacity-20" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/assessment/${category.id}`);
                            }}
                            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xl">🏆</span>
                              <div className="text-left">
                                <p className="font-semibold text-sm">Take Assessment</p>
                                <p className="text-xs opacity-90">
                                  {assessmentConfig.has_passed 
                                    ? '✓ Certificate Earned' 
                                    : `${assessmentConfig.total_questions} questions · ${assessmentConfig.passing_percentage}% to pass`
                                  }
                                </p>
                              </div>
                            </div>
                            <span className="text-lg">→</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-gray-500 text-sm text-center py-8">No categories available</div>
            )}

            {/* Price Filter */}
            {/* <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase">Filter by Price</h3>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All Topics' },
                  { value: 'free', label: 'Free Only' },
                  { value: 'paid', label: 'Paid Only' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-100 rounded">
                    <input
                      type="radio"
                      name="price"
                      value={option.value}
                      checked={priceFilter === option.value}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div> */}

            {/* Clear Filters */}
            {/* <div className="pt-4 border-t border-gray-200 mt-6">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedSubcategory('');
                  setPriceFilter('all');
                  setSearchQuery('');
                  sessionStorage.clear();
                }}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Clear All Filters
              </button>
            </div> */}
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
        <div className="flex-1 overflow-auto">
          {selectedCategory && selectedCategory !== '' ? (
            <div className="w-full">
              {/* Category Header */}
              {(() => {
                const selectedCategoryObj = categories.find(cat => cat.id === Number(selectedCategory));
                if (!selectedCategoryObj) return null;

                const colors = getPlanTypeColor(selectedCategoryObj.plan_type);

                return (
                  <>
                    {/* Unified layout for ALL plan types */}
                    <div className="p-0 bg-blue-50">
                      {/* Unified Info Card */}
                      <div className={` border-2 p-4`}>
                        <div className="flex items-center gap-6">
                          {/* Icon */}
                          <div className="flex-shrink-0 text-5xl">{getPlanTypeEmoji(selectedCategoryObj.plan_type)}</div>
                          {/* Title and Info */}
                          <div>
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h1 className="text-xl font-bold text-gray-800">
                                {selectedCategoryObj.name}
                              </h1>
                            </div>
                            {/* Pricing Info - Different for each plan type */}
                            {selectedCategoryObj.plan_type === 'FREE' && (
                              <div className="flex items-center gap-4 mb-2">
                                <h3 className="font-bold text-green-900">✨ Completely Free</h3>
                                <span className="text-sm text-green-800">Access all {getTopicsCountForCategory(selectedCategoryObj.id)} topics at no cost.</span>
                              </div>
                            )}
                            {selectedCategoryObj.plan_type === 'INDIVIDUAL' && (
                              <div className="flex items-center justify-between gap-4 mb-2">
                                <div className="flex items-center gap-4">
                                  <h3 className="font-bold text-purple-900">📚 Individual Pricing</h3>
                                  <p className="text-sm text-purple-800">Each topic has its own price. Choose what you want to learn.</p>
                                </div>
                                <button className={`bg-blue-600text-white px-6 py-3 rounded-lg font-semibold transition-colors`}>
                                  Browse Topics
                                </button>
                              </div>
                            )}
                            {selectedCategoryObj.plan_type === 'BUNDLE' && (
                              <div className="flex items-center justify-between gap-4 mb-2">
                                <div className="flex items-center gap-4">
                                  <span className="text-xs text-gray-600 font-semibold">Bundle Price</span>
                                  <span className="text-3xl font-bold text-orange-600">₹{typeof selectedCategoryObj.bundle_price === 'number' ? selectedCategoryObj.bundle_price.toFixed(2) : Number(selectedCategoryObj.bundle_price || 0).toFixed(2)}</span>
                                  <span className="text-sm text-gray-600">for all {getTopicsCountForCategory(selectedCategoryObj.id)} topics</span>
                                  <span className="text-xs text-gray-600">≈ ₹{getTopicsCountForCategory(selectedCategoryObj.id) > 0 ? Math.round(selectedCategoryObj.bundle_price / getTopicsCountForCategory(selectedCategoryObj.id)) : 0} per topic</span>
                                </div>
                                {isBundleEnrolled ? (
                                  <div className="bg-green-100 text-green-700 px-6 py-3 rounded-lg font-semibold">
                                    ✓ Enrolled
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleBuyBundle(selectedCategoryObj)}
                                    disabled={checkingBundleEnrollment}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Buy Bundle
                                  </button>
                                )}
                              </div>
                            )}
                            {selectedCategoryObj.plan_type === 'FLEXIBLE' && (
                              <div className="flex items-center justify-between gap-4 mb-2">
                                <div className="flex items-center gap-4">
                                  <span className="text-xs text-gray-600 font-semibold">Bundle Option</span>
                                  <span className="text-3xl font-bold text-blue-600">₹{selectedCategoryObj.bundle_price}</span>
                                  <span className="text-sm text-gray-600">for all topics</span>
                                  <span className="text-sm font-semibold text-gray-700">OR</span>
                                  <span className="text-sm text-gray-700">Buy topics individually</span>
                                </div>
                                {isBundleEnrolled ? (
                                  <div className="bg-green-100 text-green-700 px-6 py-3 rounded-lg font-semibold">
                                    ✓ Enrolled
                                  </div>
                                ) : hasCategoryEnrollments ? (
                                  <div className="text-gray-500 font-semibold px-4">
                                    {/* Empty or message: Plan Active */}
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleBuyBundle(selectedCategoryObj)}
                                    disabled={checkingBundleEnrollment}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Get Bundle
                                  </button>
                                )}
                              </div>
                            )}


                          </div>
                          {/* Search bar removed as per request */}
                        </div>

                        {/* Assessment Banner - Show when enabled */}
                        {assessmentConfig && (isBundleEnrolled || hasCategoryEnrollments) && (
                          <div className="mt-4 mx-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">🏆</span>
                                <div>
                                  <h3 className="font-bold text-green-800">Assessment Available</h3>
                                  <p className="text-sm text-green-700">
                                    {assessmentConfig.has_passed 
                                      ? 'You have passed this assessment and earned a certificate!' 
                                      : `Test your knowledge with ${assessmentConfig.total_questions} questions. Score ${assessmentConfig.passing_percentage}% or more to earn a certificate.`
                                    }
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => navigate(`/assessment/${selectedCategoryObj.id}`)}
                                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                                  assessmentConfig.has_passed 
                                    ? 'bg-green-600 text-white hover:bg-green-700' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                              >
                                {assessmentConfig.has_passed ? 'View Certificate' : 'Take Assessment'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Topics List Below - Same for all plan types */}
                      <div className='p-4'>
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                          {/* Results Info hidden for now. To be implemented with API later. */}
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
                                  showPrice={selectedCategoryObj.plan_type === 'FLEXIBLE' || selectedCategoryObj.plan_type === 'INDIVIDUAL'}
                                  className="min-h-[200px]"
                                  selectedCategory={selectedCategory}
                                  selectedSubCategory={selectedSubcategory}
                                  filters={{
                                    priceFilter,
                                    searchQuery
                                  }}
                                  isEnrolled={isTopicEnrolled(topic.id)}
                                />
                              ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && <Pagination />}
                          </>
                        ) : (
                          <div className="text-center py-12">
                            <div className="text-gray-500 text-lg">No topics found</div>
                            <p className="text-gray-400 mt-2">Try adjusting your search</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-6">
                <div className="text-6xl mb-4">👈</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Select a Learning Path</h2>
                <p className="text-gray-600">Choose a category from the sidebar to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicsList;