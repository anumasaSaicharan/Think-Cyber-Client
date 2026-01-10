// URL Constants for API endpoints

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8082";
const API_VERSION = "/api";

export const API_ENDPOINTS = {
  LOGIN: `${BASE_URL}${API_VERSION}/auth/send-otp`,
  VERIFY_OTP: `${BASE_URL}${API_VERSION}/auth/verify-otp`,
  SIGNUP_VERIFY: `${BASE_URL}${API_VERSION}/auth/verify-signup-otp`,
  SIGNUP: `${BASE_URL}${API_VERSION}/auth/signup`,
  RESEND_OTP: `${BASE_URL}${API_VERSION}/auth/resend-otp`,
  GET_ME: `${BASE_URL}${API_VERSION}/auth/me`,
  DELETE_ACCOUNT: `${BASE_URL}${API_VERSION}/auth/delete-account`,

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
  ENROLL_BUNDLE_CHECK: (userId, categoryId) => `${BASE_URL}${API_VERSION}/enrollments/check-bundle/${userId}/${categoryId}`,
  USER_TOPIC_ACCESS: (userId, topicId) => `${BASE_URL}${API_VERSION}/enrollments/user-topic-access/${userId}/${topicId}`,
  CATEGORY_TOPICS_ACCESS: (userId, categoryId) => `${BASE_URL}${API_VERSION}/enrollments/category-topics-access/${userId}/${categoryId}`,
  USER_ENROLLS: (userId) => `${BASE_URL}${API_VERSION}/enrollments/user/${userId}`,
  USER_BUNDLES: (userId) => `${BASE_URL}${API_VERSION}/enrollments/user-bundles/${userId}`,
  USER_ENROLLS_TOPIC: (userId, topicId) => `${BASE_URL}${API_VERSION}/enrollments/user/${userId}/topic/${topicId}`,
  VERIFY_PAYMENT: `${BASE_URL}${API_VERSION}/enrollments/verify-payment`,
  CREATE_ORDER: `${BASE_URL}${API_VERSION}/enrollments/create-order`,
  VERIFY_BUNDLE_PAYMENT: `${BASE_URL}${API_VERSION}/enrollments/verify-bundle-payment`,

  // User profile
  USER_PROFILE: (userId) => `${BASE_URL}${API_VERSION}/users/${userId}`,
  UPDATE_PROFILE: (userId) => `${BASE_URL}${API_VERSION}/users/${userId}`,

  // Public User Endpoints (No Auth)
  PUBLIC_USER_INFO: (id) => `${BASE_URL}${API_VERSION}/users/public/${id}`,
  PUBLIC_DELETE_ACCOUNT: (id) => `${BASE_URL}${API_VERSION}/users/public/${id}`,

  // Contact Us
  CONTACT_US: `${BASE_URL}${API_VERSION}/contact`,

  // Search topics
  TOPICS_SEARCH: `${BASE_URL}${API_VERSION}/topics/deep/search`,

  // Features Plans (Subscription Plans)
  FEATURES_PLANS: `${BASE_URL}${API_VERSION}/features-plans`,
  FEATURES_PLANS_ACTIVE: `${BASE_URL}${API_VERSION}/features-plans/active`,
  FEATURES_PLANS_BY_ID: (id) => `${BASE_URL}${API_VERSION}/features-plans/${id}`,

  // Assessments
  ASSESSMENT_BY_CATEGORY: (categoryId) => `${BASE_URL}${API_VERSION}/assessments/category/${categoryId}`,
  ASSESSMENT_START: `${BASE_URL}${API_VERSION}/assessments/start`,
  ASSESSMENT_SUBMIT: `${BASE_URL}${API_VERSION}/assessments/submit`,
  ASSESSMENT_ATTEMPT: (attemptId) => `${BASE_URL}${API_VERSION}/assessments/attempt/${attemptId}`,

  // Certificates
  USER_CERTIFICATES: (userId) => `${BASE_URL}${API_VERSION}/certificates/user/${userId}`,
  CERTIFICATE_BY_NUMBER: (certNumber) => `${BASE_URL}${API_VERSION}/certificates/${certNumber}`,

};

export default API_ENDPOINTS;
