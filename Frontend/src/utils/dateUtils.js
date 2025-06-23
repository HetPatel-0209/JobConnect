/**
 * Date utility functions for consistent date formatting across the application
 */

/**
 * Safely format a date string/object to a readable format
 * @param {string|Date|number} dateInput - Date input in various formats
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateInput, options = {}) => {
  const {
    fallback = 'Not specified',
    locale = 'en-US',
    includeTime = false,
    relative = false
  } = options;

  if (!dateInput) return fallback;

  // Handle empty objects specifically
  if (typeof dateInput === 'object' && dateInput !== null && !(dateInput instanceof Date)) {
    // Check if it's an empty object
    if (Object.keys(dateInput).length === 0) {
      console.warn('🔍 DateUtils: Received empty object for date:', dateInput);
      return fallback;
    }
    
    // Add debugging for troublesome objects
    console.log('🔍 DateUtils: Received object dateInput:', {
      dateInput,
      type: typeof dateInput,
      constructor: dateInput.constructor?.name,
      keys: Object.keys(dateInput),
      isArray: Array.isArray(dateInput),
      hasToString: typeof dateInput.toString === 'function',
      toString: dateInput.toString?.()
    });
  }

  if (!dateInput) return fallback;
  try {
    let date;

    // Handle different input types
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'number') {
      // Handle timestamps (both seconds and milliseconds)
      date = new Date(dateInput < 1e10 ? dateInput * 1000 : dateInput);
    } else if (typeof dateInput === 'string') {
      // Handle various string formats
      const trimmed = dateInput.trim();
      
      // Check if it's a numeric string (timestamp)
      if (/^\d+$/.test(trimmed)) {
        const timestamp = parseInt(trimmed);
        date = new Date(timestamp < 1e10 ? timestamp * 1000 : timestamp);
      } else {
        // Try parsing as ISO string or other formats
        date = new Date(trimmed);
      }    } else if (typeof dateInput === 'object' && dateInput !== null) {
      // Handle MongoDB date objects and other date-like objects
      
      // Check for empty objects first
      if (Object.keys(dateInput).length === 0) {
        console.warn('🔍 DateUtils: Empty object provided as date input');
        return fallback;
      }
      
      if (dateInput.$date) {
        // MongoDB extended JSON format: { $date: "2024-01-01T00:00:00.000Z" }
        date = new Date(dateInput.$date);
      } else if (dateInput.toISOString && typeof dateInput.toISOString === 'function') {
        // Objects with toISOString method (like Moment.js objects)
        date = new Date(dateInput.toISOString());
      } else if (dateInput.toString && typeof dateInput.toString === 'function') {
        // Try converting object to string and parsing
        const dateString = dateInput.toString();
        // Avoid parsing "[object Object]" as it's not a valid date
        if (dateString === '[object Object]') {
          console.warn('🔍 DateUtils: Object toString() returned "[object Object]", cannot parse as date');
          return fallback;
        }
        date = new Date(dateString);
      } else if (dateInput._seconds !== undefined) {
        // Firestore timestamp format: { _seconds: 1234567890, _nanoseconds: 123456789 }
        date = new Date(dateInput._seconds * 1000);
      } else if (dateInput.seconds !== undefined) {
        // Another timestamp format: { seconds: 1234567890, nanoseconds: 123456789 }
        date = new Date(dateInput.seconds * 1000);
      } else {
        // Try to extract any timestamp-like properties
        const possibleTimestamp = dateInput.timestamp || dateInput.time || dateInput.date;
        if (possibleTimestamp) {
          date = new Date(possibleTimestamp);
        } else {
          // Object doesn't contain recognizable date data
          console.warn('🔍 DateUtils: Object does not contain recognizable date properties:', Object.keys(dateInput));
          return fallback;
        }
      }
    } else {
      throw new Error(`Unsupported date input type: ${typeof dateInput}`);
    }

    // Validate the parsed date
    if (isNaN(date.getTime())) {
      console.warn('Invalid date input received:', dateInput);
      return 'Invalid date';
    }

    // Return relative time if requested
    if (relative) {
      return getRelativeTime(date);
    }

    // Format options
    const formatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...(includeTime && {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };

    return date.toLocaleDateString(locale, formatOptions);
  } catch (error) {
    console.error('Error formatting date:', { dateInput, error });
    return 'Invalid date';
  }
};

/**
 * Get relative time string (e.g., "2 days ago", "just now")
 * @param {Date} date - Date object
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid date';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
};

/**
 * Format date for display in job cards and listings
 * @param {string|Date|number} dateInput - Date input
 * @returns {string} Formatted date
 */
export const formatJobDate = (dateInput) => {
  return formatDate(dateInput, {
    fallback: 'Date not available',
    includeTime: false
  });
};

/**
 * Format date with time for detailed views
 * @param {string|Date|number} dateInput - Date input
 * @returns {string} Formatted date with time
 */
export const formatDateTime = (dateInput) => {
  return formatDate(dateInput, {
    fallback: 'Date not available',
    includeTime: true
  });
};

/**
 * Check if a date is valid
 * @param {any} dateInput - Date input to validate
 * @returns {boolean} True if valid date
 */
export const isValidDate = (dateInput) => {
  try {
    if (dateInput instanceof Date) {
      return !isNaN(dateInput.getTime());
    }
    
    const date = new Date(dateInput);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};

/**
 * Convert various date formats to ISO string
 * @param {string|Date|number} dateInput - Date input
 * @returns {string|null} ISO string or null if invalid
 */
export const toISOString = (dateInput) => {
  try {
    let date;
    
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'number') {
      date = new Date(dateInput < 1e10 ? dateInput * 1000 : dateInput);
    } else {
      date = new Date(dateInput);
    }
    
    if (isNaN(date.getTime())) {
      return null;
    }
    
    return date.toISOString();
  } catch {
    return null;
  }
};
