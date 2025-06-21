/**
 * Debug API utilities for development
 * This file provides debugging helpers for the frontend application
 */

// Check if we're in development mode
if (import.meta.env.DEV) {
  // Make API base URL available globally for debugging
  window.API_BASE_URL = import.meta.env.BACKEND_API_BASE_URL || 'http://127.0.0.1:3000/api';

  // Debug helper to test API endpoints
  window.debugAPI = {
    baseURL: window.API_BASE_URL,

    // Quick test function for API endpoints
    test: async (endpoint) => {
      try {
        const url = `${window.API_BASE_URL}${endpoint}`;
        const response = await fetch(url);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error(`❌ Error testing ${endpoint}:`, error);
        return null;
      }
    },

    // Test all job endpoints
    testJobs: async () => {
      await window.debugAPI.test('/jobs');
    },

    // Test company endpoint with ID
    testCompany: async (companyId = '68543cfbd725ad3520baa95d') => {
      await window.debugAPI.test(`/jobs/company/${companyId}`);
    },

    // Test recruiter endpoint with ID
    testRecruiter: async (recruiterId = '68543cfed725ad3520baa967') => {
      await window.debugAPI.test(`/jobs/recruiter/${recruiterId}`);
    }
  };
}

export default {};
