// API Service for handling all API calls
import axios from 'axios';
import API_ENDPOINTS from '../constants/urlConstants.js';

// Create axios instance with default configuration
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Wrap EVERYTHING in try-catch to prevent cross-origin errors from Razorpay iframes
    let errorMessage = 'Request failed';
    let statusCode = null;
    
    try {
      // Try to get error message - each access wrapped separately
      try { if (error?.response?.data?.error) errorMessage = String(error.response.data.error); }
      catch (e) { /* ignore */ }
      
      try { if (errorMessage === 'Request failed' && error?.response?.data?.message) errorMessage = String(error.response.data.message); }
      catch (e) { /* ignore */ }
      
      try { if (errorMessage === 'Request failed' && error?.message) errorMessage = String(error.message); }
      catch (e) { /* ignore */ }
      
      try { if (error?.response?.status) statusCode = error.response.status; }
      catch (e) { /* ignore */ }
    } catch (e) {
      // If anything fails, use defaults
    }
    
    console.error('API Error:', errorMessage);
    
    return Promise.reject({
      message: errorMessage,
      status: statusCode,
      error: errorMessage
    });
  }
);

// Homepage API Services
export const homepageService = {
  // Get homepage content by language
  getHomepageByLanguage: async (language = 'en') => {
    //debugger;
    try {
      const response = await apiClient.get(API_ENDPOINTS.HOMEPAGE_BY_LANGUAGE(language));
      return response;
    } catch (error) {
      console.error('Error fetching homepage by language:', error);
      throw error;
    }
  },

  // Create or update homepage content
  createOrUpdateHomepageContent: async (data) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.HOMEPAGE_CONTENT, data);
      return response;
    } catch (error) {
      console.error('Error creating/updating homepage content:', error);
      throw error;
    }
  },

  // Get homepage FAQs
  getHomepageFAQs: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.HOMEPAGE_FAQS);
      return response;
    } catch (error) {
      console.error('Error fetching homepage FAQs:', error);
      throw error;
    }
  },

  // Create a new FAQ
  createFAQ: async (faqData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.HOMEPAGE_FAQS, faqData);
      return response;
    } catch (error) {
      console.error('Error creating FAQ:', error);
      throw error;
    }
  },

  // Update FAQ by ID
  updateFAQ: async (id, faqData) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.HOMEPAGE_FAQ_BY_ID(id), faqData);
      return response;
    } catch (error) {
      console.error('Error updating FAQ:', error);
      throw error;
    }
  },

  // Delete FAQ by ID
  deleteFAQ: async (id) => {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.HOMEPAGE_FAQ_BY_ID(id));
      return response;
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      throw error;
    }
  },
};

// Categories API Services
export const categoriesService = {
  // Get all categories with pagination and sorting
  getAllCategories: async (params = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES, { params });
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Add a new category
  addCategory: async (categoryData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CATEGORIES, categoryData);
      return response;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  },

  // Update category by ID
  updateCategory: async (id, categoryData) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.CATEGORY_BY_ID(id), categoryData);
      return response;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Delete category by ID
  deleteCategory: async (id) => {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.CATEGORY_BY_ID(id));
      return response;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },
};

// Subcategories API Services
export const subcategoriesService = {
  // Get all subcategories with pagination and sorting
  getAllSubcategories: async (params = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SUBCATEGORIES, { params });
      return response;
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      throw error;
    }
  },

  // Add a new subcategory
  addSubcategory: async (subcategoryData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SUBCATEGORIES, subcategoryData);
      return response;
    } catch (error) {
      console.error('Error adding subcategory:', error);
      throw error;
    }
  },

  // Get subcategory by ID
  getSubcategoryById: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SUBCATEGORY_BY_ID(id));
      return response;
    } catch (error) {
      console.error('Error fetching subcategory by ID:', error);
      throw error;
    }
  },

  // Update subcategory by ID
  updateSubcategory: async (id, subcategoryData) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.SUBCATEGORY_BY_ID(id), subcategoryData);
      return response;
    } catch (error) {
      console.error('Error updating subcategory:', error);
      throw error;
    }
  },

  // Delete subcategory by ID
  deleteSubcategory: async (id) => {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.SUBCATEGORY_BY_ID(id));
      return response;
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      throw error;
    }
  },
};


// Privacy Policy API Services
export const privacyService = {
  // Get all privacy policies with pagination and sorting
  getAllPrivacyPolicies: async (params = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRIVACY, { params });
      return response;
    } catch (error) {
      console.error('Error fetching privacy policies:', error);
      throw error;
    }
  },

  // Create new privacy policy
  createPrivacyPolicy: async (policyData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PRIVACY, policyData);
      return response;
    } catch (error) {
      console.error('Error creating privacy policy:', error);
      throw error;
    }
  },

  // Get privacy policy by ID
  getPrivacyPolicyById: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRIVACY_BY_ID(id));
      return response;
    } catch (error) {
      console.error('Error fetching privacy policy by ID:', error);
      throw error;
    }
  },

  // Update privacy policy by ID
  updatePrivacyPolicy: async (id, policyData) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.PRIVACY_BY_ID(id), policyData);
      return response;
    } catch (error) {
      console.error('Error updating privacy policy:', error);
      throw error;
    }
  },

  // Delete privacy policy by ID
  deletePrivacyPolicy: async (id) => {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.PRIVACY_BY_ID(id));
      return response;
    } catch (error) {
      console.error('Error deleting privacy policy:', error);
      throw error;
    }
  },

  // Publish privacy policy by ID
  publishPrivacyPolicy: async (id) => {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.PRIVACY_BY_ID(id)}/publish`);
      return response;
    } catch (error) {
      console.error('Error publishing privacy policy:', error);
      throw error;
    }
  },
};

// Terms and Conditions API Services
export const termsService = {
  // Get all terms and conditions
  getAllTerms: async (params = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TERMS, { params });
      return response;
    } catch (error) {
      console.error('Error fetching terms and conditions:', error);
      throw error;
    }
  },

  // Get latest published terms
  getLatestTerms: async () => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.TERMS}/latest`);
      return response;
    } catch (error) {
      console.error('Error fetching latest terms:', error);
      throw error;
    }
  },
};

// Topic API Services
export const topicService = {
  // Get all topics
  getAllTopics: async (params = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TOPICS, { params });
      return response;
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }
  },

  // Get topic by ID
  getTopicById: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TOPIC_BY_ID(id));
      return response;
    } catch (error) {
      console.error('Error fetching topic by ID:', error);
      throw error;
    }
  },

  // Get modules for a topic
  getTopicModules: async (topicId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TOPIC_MODULES(topicId));
      return response;
    } catch (error) {
      console.error('Error fetching topic modules:', error);
      throw error;
    }
  },

  // Get videos for a topic
  getTopicVideos: async (topicId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TOPIC_VIDEOS(topicId));
      return response;
    } catch (error) {
      console.error('Error fetching topic videos:', error);
      throw error;
    }
  },

  // Enroll in a topic
  enrollInTopic: async (enrollmentData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ENROLL, enrollmentData);
      return response;
    } catch (error) {
      console.error('Error enrolling in topic:', error);
      console.error('Error response:', error.response?.data);
      // Re-throw with response data if available
      if (error.response?.data) {
        throw { ...error, response: error.response };
      }
      throw error;
    }
  },

  // Check if user has access to a specific topic (handles bundle future topics)
  checkTopicAccess: async (userId, topicId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER_TOPIC_ACCESS(userId, topicId));
      return response;
    } catch (error) {
      console.error('Error checking topic access:', error);
      throw error;
    }
  },

  // Get all accessible topics in a category for user (respects future_topics_included)
  getCategoryTopicsAccess: async (userId, categoryId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORY_TOPICS_ACCESS(userId, categoryId));
      return response;
    } catch (error) {
      console.error('Error getting category topics access:', error);
      throw error;
    }
  },

  // Check if user has purchased a bundle
  checkBundleEnrollment: async (userId, categoryId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ENROLL_BUNDLE_CHECK(userId, categoryId));
      return response;
    } catch (error) {
      console.error('Error checking bundle enrollment:', error);
      throw error;
    }
  },

  // Get all topics for a user
  getUserEnrolledTopics: async (userId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER_ENROLLS(userId));
      return response;
    } catch (error) {
      console.error('Error fetching user enrolled topics:', error);
      throw error;
    }
  },

  // Get all bundles for a user
  getUserBundles: async (userId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER_BUNDLES(userId));
      return response;
    } catch (error) {
      console.error('Error fetching user bundles:', error);
      throw error;
    }
  },

  // Get all topics for a user
  getUserEnrolledTopic: async (userId, topicId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER_ENROLLS_TOPIC(userId, topicId));
      return response;
    } catch (error) {
      console.error('Error fetching user enrolled topic:', error);
      throw error;
    }
  },

  // Verify payment
  verifyPayment: async (paymentData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.VERIFY_PAYMENT, paymentData);
      return response;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },

  // Create order (for both topics and bundles)
  createOrder: async (orderData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CREATE_ORDER, orderData);
      return response;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Verify bundle payment
  verifyBundlePayment: async (paymentData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.VERIFY_BUNDLE_PAYMENT, paymentData);
      return response;
    } catch (error) {
      console.error('Error verifying bundle payment:', error);
      throw error;
    }
  }

};

// Contact API Services
export const contactService = {
  // Send contact form
  sendContactForm: async (data) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CONTACT_US, data);
      return response;
    } catch (error) {
      console.error('Error sending contact form:', error);
      throw error;
    }
  }
};

// Export the configured axios instance for custom use
// Auth API Services
export const authService = {

  //get me
  getMe: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_ME,); // Assuming /api/me returns current user based on HttpOnly cookie
      return response;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },
  // Login user
  loginUser: async (email, password) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.LOGIN, { email, password });
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }
      return response;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },
  // Verify OTP
  verifyOtp: async (email, otp) => {
    try {
      //debugger;
      const response = await apiClient.post(API_ENDPOINTS.VERIFY_OTP, { email, otp });
      console.log('OTP Verification Response:', response);
      if (response.sessionToken) {
        console.log('authToken:', response.sessionToken);
        localStorage.setItem('authToken', response.sessionToken);
      }
      return response;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  },
  //signup user
  signupUser: async (userData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SIGNUP, userData);
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }
      return response;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  },
  resendOtp: async (email) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.LOGIN, { email });
      return response;
    } catch (error) {
      console.error('Error resending OTP:', error);
      throw error;
    }
  },
  signupVerifyUser: async (email, otp) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SIGNUP_VERIFY, { email, otp });
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }
      return response;
    } catch (error) {
      console.error('Error verifying signup OTP:', error);
      throw error;
    }
  },

  // Delete account
  deleteAccount: async (email, additionalData = {}) => {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.DELETE_ACCOUNT, {
        data: {
          email,
          ...additionalData
        }
      });
      return response;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  },

  // In apiService.js - Add more logging
  searchTopics: async (query, params = {}) => {
    try {
      const searchParams = {
        q: query,
        limit: 20,
        ...params
      };

      const endpoint = API_ENDPOINTS.TOPICS_SEARCH;
      console.log('Calling endpoint:', endpoint);
      console.log('With params:', searchParams);
      console.log('Full URL will be:', `${endpoint}?${new URLSearchParams(searchParams)}`);

      const response = await apiClient.get(endpoint, {
        params: searchParams
      });

      console.log('Response received:', response);
      return response;
    } catch (error) {
      console.error('Error searching topics:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

};

// Public User Service (No Token Required)
export const publicUserService = {
  // Get user by ID (public)
  getUserById: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PUBLIC_USER_INFO(id));
      return response;
    } catch (error) {
      console.error('Error fetching public user info:', error);
      throw error;
    }
  },

  // Delete user by ID (public)
  deleteUserById: async (id) => {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.PUBLIC_DELETE_ACCOUNT(id));
      return response;
    } catch (error) {
      console.error('Error deleting user account:', error);
      throw error;
    }
  }
};

// Features Plans (Subscription Plans) API Services
export const featuresPlansService = {
  // Get all active plans
  getActivePlans: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.FEATURES_PLANS_ACTIVE);
      return response;
    } catch (error) {
      console.error('Error fetching active plans:', error);
      throw error;
    }
  },

  // Get all plans with pagination
  getAllPlans: async (params = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.FEATURES_PLANS, { params });
      return response;
    } catch (error) {
      console.error('Error fetching all plans:', error);
      throw error;
    }
  },

  // Get plan by ID
  getPlanById: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.FEATURES_PLANS_BY_ID(id));
      return response;
    } catch (error) {
      console.error('Error fetching plan by ID:', error);
      throw error;
    }
  }
};

// Assessment API Services - Using fetch to avoid Razorpay iframe interference with axios
export const assessmentService = {
  // Get assessment details for a category
  getAssessmentByCategory: async (categoryId, userId = null) => {
    try {
      let url = API_ENDPOINTS.ASSESSMENT_BY_CATEGORY(categoryId);
      if (userId) {
        url += `?userId=${userId}`;
      }
      const token = localStorage.getItem('authToken');
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching assessment:', String(error?.message || 'Request failed'));
      throw { message: 'Failed to fetch assessment', error: 'Request failed' };
    }
  },

  // Start a new assessment
  startAssessment: async (userId, categoryId, bypassCooldown = false) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.ASSESSMENT_START, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ userId, categoryId, bypassCooldown })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error starting assessment:', String(error?.message || 'Request failed'));
      throw { message: 'Failed to start assessment', error: 'Request failed' };
    }
  },

  // Submit assessment answers
  submitAssessment: async (attemptId, answers) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.ASSESSMENT_SUBMIT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ attemptId, answers })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting assessment:', String(error?.message || 'Request failed'));
      throw { message: 'Failed to submit assessment', error: 'Request failed' };
    }
  },

  // Get attempt details
  getAttemptDetails: async (attemptId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.ASSESSMENT_ATTEMPT(attemptId), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching attempt details:', String(error?.message || 'Request failed'));
      throw { message: 'Failed to fetch attempt details', error: 'Request failed' };
    }
  }
};

// Certificate API Services - Using fetch to avoid Razorpay iframe interference
export const certificateService = {
  // Get all certificates for a user
  getUserCertificates: async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.USER_CERTIFICATES(userId), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching certificates:', String(error?.message || 'Request failed'));
      throw { message: 'Failed to fetch certificates', error: 'Request failed' };
    }
  },

  // Verify certificate by number
  verifyCertificate: async (certificateNumber) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.CERTIFICATE_BY_NUMBER(certificateNumber), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verifying certificate:', String(error?.message || 'Request failed'));
      throw { message: 'Failed to verify certificate', error: 'Request failed' };
    }
  }
};

export default apiClient;
