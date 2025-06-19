/**
 * Debug API utilities for development
 * This file provides debugging helpers for the frontend application
 */

// Check if we're in development mode
if (import.meta.env.DEV) {
  console.log('🚀 JobConnect Frontend Debug Mode Active');
  
  // Make API base URL available globally for debugging
  window.API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  
  // Debug helper to test API endpoints
  window.debugAPI = {
    baseURL: window.API_BASE_URL,
    
    // Quick test function for API endpoints
    test: async (endpoint) => {
      try {
        const url = `${window.API_BASE_URL}${endpoint}`;
        console.log(`🔍 Testing: ${url}`);
        const response = await fetch(url);
        const data = await response.json();
        console.log(`✅ Response:`, data);
        return data;
      } catch (error) {
        console.error(`❌ Error testing ${endpoint}:`, error);
        return null;
      }
    },
    
    // Test all job endpoints
    testJobs: async () => {
      console.log('🧪 Testing Job Endpoints...');
      await window.debugAPI.test('/jobs');
    },
    
    // Test company endpoint with ID
    testCompany: async (companyId = '68543cfbd725ad3520baa95d') => {
      console.log('🏢 Testing Company Endpoint...');
      await window.debugAPI.test(`/jobs/company/${companyId}`);
    },
    
    // Test recruiter endpoint with ID
    testRecruiter: async (recruiterId = '68543cfed725ad3520baa967') => {
      console.log('👤 Testing Recruiter Endpoint...');
      await window.debugAPI.test(`/jobs/recruiter/${recruiterId}`);
    }
  };
  
  // Log available debug commands
  console.log('🛠️ Debug commands available:');
  console.log('- window.debugAPI.test("/endpoint") - Test any API endpoint');
  console.log('- window.debugAPI.testJobs() - Test jobs endpoint');
  console.log('- window.debugAPI.testCompany() - Test company endpoint');
  console.log('- window.debugAPI.testRecruiter() - Test recruiter endpoint');
}

export default {};
