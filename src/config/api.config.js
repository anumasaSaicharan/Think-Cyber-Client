/**
 * Centralized API Configuration
 * All API endpoints are dynamically constructed from environment variables
 */

// Get base URL from environment or use localhost
const getBaseURL = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:8082';
};

// API version prefix
const API_VERSION = '/api';

// Complete base URL with API version
export const API_BASE_URL = `${getBaseURL()}${API_VERSION}`;

/**
 * Construct full API endpoint URL
 * @param {string} path - The endpoint path (e.g., '/categories/1')
 * @returns {string} - Full API URL
 */
export const getAPIUrl = (path) => {
  return `${API_BASE_URL}${path}`;
};

/**
 * Get authorization headers with token if available
 * @returns {object} - Headers object with auth token if present
 */
export const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };

  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * API Endpoints Configuration
 * All endpoints are dynamically constructed
 */
export const API_ENDPOINTS = {
  // Categories
  CATEGORIES: getAPIUrl('/categories'),
  CATEGORY_BY_ID: (id) => getAPIUrl(`/categories/${id}`),

  // Topics
  TOPICS: getAPIUrl('/topics'),
  TOPICS_BY_CATEGORY: (categoryId) => getAPIUrl(`/topics?categoryId=${categoryId}`),
  TOPIC_BY_ID: (id) => getAPIUrl(`/topics/${id}`),

  // Enrollments
  ENROLLMENTS: getAPIUrl('/enrollments'),
  USER_ENROLLMENTS: (userId) => getAPIUrl(`/enrollments/user/${userId}`),
  USER_BUNDLES: (userId) => getAPIUrl(`/enrollments/user-bundles/${userId}`),
  CHECK_ENROLLMENT: (userId, topicId) => getAPIUrl(`/enrollments/check/${userId}/${topicId}`),
  USER_TOPIC_ACCESS: (userId, topicId) => getAPIUrl(`/enrollments/user-topic-access/${userId}/${topicId}`),
  CATEGORY_TOPICS_ACCESS: (userId, categoryId) => getAPIUrl(`/enrollments/category-topics-access/${userId}/${categoryId}`),

  // Purchases
  PURCHASES_CREATE: getAPIUrl('/purchases/create'),
  VERIFY_PAYMENT: getAPIUrl('/enrollments/verify-payment'),
  VERIFY_BUNDLE_PAYMENT: getAPIUrl('/enrollments/verify-bundle-payment'),

  // Auth
  AUTH_ME: getAPIUrl('/auth/me'),
  LOGIN: getAPIUrl('/auth/send-otp'),
  VERIFY_OTP: getAPIUrl('/auth/verify-otp'),

  // Homepage
  HOMEPAGE: getAPIUrl('/homepage'),
};

export default API_BASE_URL;
