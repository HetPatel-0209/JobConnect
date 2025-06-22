import axios from 'axios';
import { handleApiError } from '../utils/apiErrorHandler';

// Use environment variable or default to production for deployment
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL || 'https://jobconnect-xwh3.onrender.com/api';

// Debug logging to see which URL is being used
console.log('🔧 Environment Variables Debug:');
console.log('VITE_BACKEND_API_BASE_URL:', import.meta.env.VITE_BACKEND_API_BASE_URL);
console.log('VITE_BACKEND_API_URL:', import.meta.env.VITE_BACKEND_API_URL);
console.log('Final API_BASE_URL:', API_BASE_URL);
console.log('Environment Mode:', import.meta.env.MODE);
console.log('Is Development:', import.meta.env.DEV);

/**
 * Standard API response format
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether the request was successful
 * @property {any} data - The data returned from the API
 * @property {string} message - A message from the API
 */

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const requestInfo = {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            fullURL: `${config.baseURL}${config.url}`,
            headers: config.headers,
            data: config.data
        };
        console.log('🚀 Making API request:', requestInfo);

        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔑 Token added to request');
        } else {
            // Only warn for protected endpoints, not for login/register
            const isAuthEndpoint = config.url?.includes('/auth/login') ||
                                 config.url?.includes('/auth/register') ||
                                 config.url?.includes('/auth/forgot-password') ||
                                 config.url?.includes('/auth/reset-password');

            if (!isAuthEndpoint) {
                console.log('⚠️ No token found in localStorage for protected endpoint:', config.url);
            }
        }
        return config;
    },
    (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => {
        const responseInfo = {
            status: response.status,
            url: response.config.url,
            method: response.config.method?.toUpperCase(),
            data: response.data
        };
          console.log('✅ API response received:', responseInfo);
        return response;
    },
    (error) => {
        const originalRequest = error.config;
        const errorInfo = {
            message: error.message,
            status: error.response?.status,
            url: originalRequest?.url,
            method: originalRequest?.method?.toUpperCase(),
            baseURL: originalRequest?.baseURL,
            fullURL: originalRequest ? `${originalRequest.baseURL}${originalRequest.url}` : 'Unknown'
        };        console.error('❌ API Error occurred:', errorInfo);

        // Debug connection issues
        if (!error.response) {
            console.error('🔥 Network Error - No response received:', {
                message: error.message,
                code: error.code,
                config: {
                    url: originalRequest?.url,
                    method: originalRequest?.method,
                    baseURL: originalRequest?.baseURL,
                    timeout: originalRequest?.timeout
                }            });
        } else {            console.error(`🚨 HTTP Error ${error.response.status}:`, error.response.data);
        }

        // Handle authentication errors
        if (error.response?.status === 401 && !originalRequest._retry) {            console.log('🔒 Authentication error - clearing credentials and redirecting to login');
            
            // Clear auth data
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Redirect to login page
            window.location.href = '/auth';
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

// Wrapper methods for standardized API calls
const apiService = {
    /**
     * Make a GET request
     * @param {string} url - The URL to make the request to
     * @param {Object} params - The query parameters
     * @returns {Promise<ApiResponse>}
     */
    get: async (url, params = {}) => {
        try {
            const response = await api.get(url, { params });
            return response.data;
        } catch (error) {
            const formattedError = handleApiError(error, false);
            console.error(`GET error:`, formattedError);
            throw formattedError;
        }
    },

    /**
     * Make a POST request
     * @param {string} url - The URL to make the request to
     * @param {Object} data - The data to send
     * @param {Object} config - Additional config
     * @returns {Promise<ApiResponse>}
     */
    post: async (url, data = {}, config = {}) => {
        try {
            const response = await api.post(url, data, config);
            return response.data;
        } catch (error) {
            const formattedError = handleApiError(error, false);
            console.error(`POST error:`, formattedError);
            throw formattedError;
        }
    },

    /**
     * Make a PUT request
     * @param {string} url - The URL to make the request to
     * @param {Object} data - The data to send
     * @returns {Promise<ApiResponse>}
     */
    put: async (url, data = {}) => {
        try {
            const response = await api.put(url, data);
            return response.data;
        } catch (error) {
            const formattedError = handleApiError(error, false);
            console.error(`PUT error:`, formattedError);
            throw formattedError;
        }
    },

    /**
     * Make a DELETE request
     * @param {string} url - The URL to make the request to
     * @returns {Promise<ApiResponse>}
     */
    delete: async (url) => {
        try {
            const response = await api.delete(url);
            return response.data;
        } catch (error) {
            const formattedError = handleApiError(error, false);
            console.error(formattedError);
            throw formattedError;
        }
    },

    // Raw axios instance for specialized needs
    axios: api
};

export default apiService;