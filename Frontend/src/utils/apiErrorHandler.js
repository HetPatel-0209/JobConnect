/**
 * Utility functions for API error handling
 */

/**
 * Formats an error object from the API
 * @param {Error} error - The error from the API call
 * @returns {Object} Formatted error object
 */
export const formatApiError = (error) => {
  // If we have a response with data, return that
  if (error.response?.data) {
    return {
      message: error.response.data.message || 'An error occurred',
      errors: error.response.data.errors || null,
      status: error.response.status,
      statusText: error.response.statusText
    };
  }
  
  // Handle network errors
  if (error.request) {
    return {
      message: 'Network error. Please check your connection.',
      status: 0
    };
  }
  
  // Handle other errors
  return {
    message: error.message || 'An unknown error occurred',
    status: 500
  };
};

/**
 * Shows an error notification (can be connected to a notification system)
 * @param {Error} error - The error from the API call
 */
export const showErrorNotification = (error) => {
  const formattedError = formatApiError(error);
  console.error('API Error:', formattedError);
  
  // This can be connected to a toast notification system
  // For example: toast.error(formattedError.message);
};

/**
 * Handle API error with standard formatting and optional notification
 * @param {Error} error - The error from the API call
 * @param {boolean} showNotification - Whether to show a notification
 * @returns {Object} Formatted error
 */
export const handleApiError = (error, showNotification = true) => {
  const formattedError = formatApiError(error);
  
  if (showNotification) {
    showErrorNotification(error);
  }
  
  return formattedError;
};

export default {
  formatApiError,
  showErrorNotification,
  handleApiError
};
