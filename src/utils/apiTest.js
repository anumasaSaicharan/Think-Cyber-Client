// Test file for API services
// You can run this in the browser console to test the API connections

import { homepageService, categoriesService } from './src/services/apiService.js';

// Test functions
export const testAPI = {
  // Test homepage API
  async testHomepage() {
    try {
      console.log('Testing homepage API...');
      const response = await homepageService.getHomepageByLanguage('en');
      console.log('Homepage API Response:', response);
      return response;
    } catch (error) {
      console.error('Homepage API Error:', error);
      return null;
    }
  },

  // Test categories API
  async testCategories() {
    try {
      console.log('Testing categories API...');
      const response = await categoriesService.getAllCategories({ limit: 6 });
      console.log('Categories API Response:', response);
      return response;
    } catch (error) {
      console.error('Categories API Error:', error);
      return null;
    }
  },

  // Test all APIs
  async testAll() {
    console.log('Starting API tests...');
    const results = {
      homepage: await this.testHomepage(),
      categories: await this.testCategories()
    };
    console.log('All API test results:', results);
    return results;
  }
};

// Example usage:
// testAPI.testAll();
