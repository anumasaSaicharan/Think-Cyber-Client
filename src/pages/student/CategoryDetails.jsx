import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';
import { TopicsShowcase } from '../../components/student/TopicsShowcase';
import Loading from '../../components/student/Loading';
import { FiArrowLeft } from 'react-icons/fi';
import { API_ENDPOINTS, getHeaders } from '../../config/api.config';

/**
 * CategoryDetails Page
 * Shows detailed view of a category with all topics based on plan_type
 */
const CategoryDetails = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useContext(AppContext);

  const [category, setCategory] = useState(location.state?.category || null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(!category);
  const [enrolling, setEnrolling] = useState(false);

  // Fetch category if not provided in navigation
  useEffect(() => {
    if (!category) {
      fetchCategory();
    } else {
      fetchTopics(category.id);
    }
  }, [categoryId]);

  // Fetch topics when category changes
  useEffect(() => {
    if (category && topics.length === 0) {
      fetchTopics(category.id);
    }
  }, [category]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.CATEGORY_BY_ID(categoryId), {
        method: 'GET',
        headers: getHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setCategory({
            ...data.data,
            plan_type: data.data.plan_type || 'BUNDLE'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      toast.error('Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (catId) => {
    try {
      const response = await fetch(
        API_ENDPOINTS.TOPICS_BY_CATEGORY(catId),
        {
          method: 'GET',
          headers: getHeaders()
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setTopics(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast.error('Failed to load topics');
    }
  };

  const handleEnrollTopic = async (topic, purchaseType) => {
    if (!userData || !userData.id) {
      toast.error('Please login to enroll');
      navigate('/login');
      return;
    }

    setEnrolling(true);
    try {
      // Call enrollment API
      const response = await fetch(API_ENDPOINTS.ENROLLMENTS, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          userId: userData.id,
          topicId: topic.id,
          categoryId: category.id,
          purchaseType: purchaseType,
          amount: topic.price || 0
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Successfully enrolled in ${topic.title}!`);
        // Navigate to topic view
        navigate(`/course/${topic.id}`);
      } else {
        toast.error('Failed to enroll');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('Error during enrollment');
    } finally {
      setEnrolling(false);
    }
  };

  const handleBuyBundle = async (cat) => {
    if (!userData || !userData.id) {
      toast.error('Please login to purchase');
      navigate('/login');
      return;
    }

    setEnrolling(true);
    try {
      // Call bundle purchase API
      const response = await fetch(API_ENDPOINTS.PURCHASES_CREATE, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          userId: userData.id,
          categoryId: cat.id,
          purchaseType: 'bundle',
          amount: cat.bundle_price
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Bundle purchased successfully!');
        // Refresh topics or navigate to success page
      } else {
        toast.error('Failed to purchase bundle');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Error during purchase');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600 mb-4">Category not found</p>
        <button
          onClick={() => navigate('/browse')}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          <FiArrowLeft />
          Back to Categories
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/browse')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            <FiArrowLeft size={20} />
            Back to Categories
          </button>
        </div>
      </div>

      {/* Category Info Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{getPlanTypeEmoji(category.plan_type)}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPlanTypeBadgeColor(category.plan_type)}`}>
                  {category.plan_type}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {category.name}
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                {category.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="text-gray-700">
                  <span className="font-semibold">{topics.length}</span> Topics
                </span>
                <span className="text-gray-700">
                  <span className="font-semibold">{category.status}</span> Status
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Topics Section */}
      <div className="bg-white">
        <TopicsShowcase
          category={category}
          topics={topics}
          onEnrollTopic={handleEnrollTopic}
          onBuyBundle={handleBuyBundle}
        />
      </div>

      {/* Footer CTA */}
      {category.plan_type !== 'FREE' && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold mb-3">Ready to start learning?</h3>
            <p className="text-blue-100 mb-6">
              Join thousands of students already learning with ThinkCyber
            </p>
            <button
              onClick={() => {
                if (!userData || !userData.id) {
                  navigate('/login');
                } else {
                  // Scroll to topics section
                  document.querySelector('.max-w-4xl').scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              {userData ? 'Choose Your Plan' : 'Login to Enroll'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
const getPlanTypeEmoji = (planType) => {
  const emojis = {
    FREE: '🎁',
    BUNDLE: '📦',
    INDIVIDUAL: '📚',
    FLEXIBLE: '⚡'
  };
  return emojis[planType] || '📖';
};

const getPlanTypeBadgeColor = (planType) => {
  const colors = {
    FREE: 'bg-green-100 text-green-800',
    BUNDLE: 'bg-orange-100 text-orange-800',
    INDIVIDUAL: 'bg-purple-100 text-purple-800',
    FLEXIBLE: 'bg-blue-100 text-blue-800'
  };
  return colors[planType] || 'bg-gray-100 text-gray-800';
};

export default CategoryDetails;
