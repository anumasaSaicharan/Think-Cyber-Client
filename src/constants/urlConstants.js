// URL Constants for API endpoints

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const API_VERSION = "/api";

export const API_ENDPOINTS = {
  LOGIN: `${BASE_URL}${API_VERSION}/auth/send-otp`,
  VERIFY_OTP: `${BASE_URL}${API_VERSION}/auth/verify-otp`,
  SIGNUP_VERIFY: `${BASE_URL}${API_VERSION}/auth/verify-signup-otp`,
  SIGNUP: `${BASE_URL}${API_VERSION}/auth/signup`,
  RESEND_OTP: `${BASE_URL}${API_VERSION}/auth/resend-otp`,
  GET_ME: `${BASE_URL}${API_VERSION}/auth/me`,

  // Homepage related endpoints
  HOMEPAGE: `${BASE_URL}${API_VERSION}/homepage`,
  HOMEPAGE_BY_LANGUAGE: (language) => `${BASE_URL}${API_VERSION}/homepage/${language}`,
  HOMEPAGE_CONTENT: `${BASE_URL}${API_VERSION}/homepage/content`,
  HOMEPAGE_FAQS: `${BASE_URL}${API_VERSION}/homepage/faqs`,
  HOMEPAGE_FAQ_BY_ID: (id) => `${BASE_URL}${API_VERSION}/homepage/faqs/${id}`,

  // Categories and subcategories
  CATEGORIES: `${BASE_URL}${API_VERSION}/categories`,
  CATEGORY_BY_ID: (id) => `${BASE_URL}${API_VERSION}/categories/${id}`,
  SUBCATEGORIES: `${BASE_URL}${API_VERSION}/subcategories?page=1&limit=1000`,
  SUBCATEGORY_BY_ID: (id) => `${BASE_URL}${API_VERSION}/subcategories/${id}`,

  // Topic related endpoints
  TOPICS: `${BASE_URL}${API_VERSION}/topics`,
  TOPIC_BY_ID: (id) => `${BASE_URL}${API_VERSION}/topics/${id}`,
  TOPIC_MODULES: (topicId) => `${BASE_URL}${API_VERSION}/topics/${topicId}/modules`,
  TOPIC_VIDEOS: (topicId) => `${BASE_URL}${API_VERSION}/topics/${topicId}/videos`,

  // Other endpoints
  PRIVACY: `${BASE_URL}${API_VERSION}/privacy`,
  PRIVACY_BY_ID: (id) => `${BASE_URL}${API_VERSION}/privacy/${id}`,
  TERMS: `${BASE_URL}${API_VERSION}/terms`,

  //enroll user
  ENROLL: `${BASE_URL}${API_VERSION}/enrollments/enroll`,
  ENROLL_CHECK: (userId, topicId) => `${BASE_URL}${API_VERSION}/enrollments/check/${userId}/${topicId}`,
  USER_ENROLLS: (userId) => `${BASE_URL}${API_VERSION}/enrollments/user/${userId}`,
  USER_ENROLLS_TOPIC: (userId, topicId) => `${BASE_URL}${API_VERSION}/enrollments/user/${userId}/topic/${topicId}`,
  VERIFY_PAYMENT: `${BASE_URL}${API_VERSION}/enrollments/verify-payment`,

  // User profile
  USER_PROFILE: (userId) => `${BASE_URL}${API_VERSION}/users/${userId}`,
  UPDATE_PROFILE: (userId) => `${BASE_URL}${API_VERSION}/users/${userId}`,
  
  // Contact Us
  CONTACT_US: `${BASE_URL}${API_VERSION}/contact`,

  // Search topics
  TOPICS_SEARCH: `${BASE_URL}${API_VERSION}/topics/deep/search`,
  

};

export default API_ENDPOINTS;
