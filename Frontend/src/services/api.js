import axios from 'axios';
import { handleApiError } from '../utils/apiErrorHandler';

// Use environment variable or default to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://jobconnect-xwh3.onrender.com/api';

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
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;
        
        // Handle authentication errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Clear auth data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Redirect to login page
            window.location.href = '/auth';
            return Promise.reject(error);
        }
        
        // Network errors
        if (!error.response) {
            console.error('Network Error:', error.message);
            return Promise.reject(new Error('Network error. Please check your connection.'));
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
            console.log(`API POST: `, data);
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