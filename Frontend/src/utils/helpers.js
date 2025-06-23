// Note: formatDate function has been moved to dateUtils.js for centralized date handling
// Import formatJobDate, formatDateTime, or formatDate from '../utils/dateUtils' instead

/**
 * Format salary range for display
 * @param {Object} salaryData - Salary data
 * @param {number} salaryData.min - Minimum salary
 * @param {number} salaryData.max - Maximum salary
 * @param {string} salaryData.currency - Currency code (USD, EUR, etc.)
 * @param {string} salaryData.period - Pay period (year, month, hour)
 * @returns {string} Formatted salary string
 */
export const formatSalary = (salaryData) => {
    const { min, max, currency = 'USD', period = 'year' } = salaryData;
    
    if (!min && !max) return 'Not specified';
    
    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0
    });
    
    let formattedSalary = '';
    
    if (min && max) {
        formattedSalary = `${currencyFormatter.format(min)} - ${currencyFormatter.format(max)}`;
    } else if (min) {
        formattedSalary = `From ${currencyFormatter.format(min)}`;
    } else if (max) {
        formattedSalary = `Up to ${currencyFormatter.format(max)}`;
    }
    
    // Add period
    switch (period) {
        case 'hour':
            formattedSalary += ' per hour';
            break;
        case 'day':
            formattedSalary += ' per day';
            break;
        case 'week':
            formattedSalary += ' per week';
            break;
        case 'month':
            formattedSalary += ' per month';
            break;
        case 'year':
            formattedSalary += ' per year';
            break;
    }
    
    return formattedSalary;
};

/**
 * Calculate time elapsed since a given date
 * @param {string|Date} date - The date to calculate from
 * @returns {string} Time elapsed string (e.g., "2 days ago")
 */
export const timeAgo = (date) => {
    const d = new Date(date);
    
    if (isNaN(d.getTime())) {
        return 'Invalid date';
    }
    
    const now = new Date();
    const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
    
    // Define time intervals in seconds
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    // Check each interval
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        
        if (interval >= 1) {
            return interval === 1 
                ? `1 ${unit} ago` 
                : `${interval} ${unit}s ago`;
        }
    }
    
    return 'Just now';
};

/**
 * Truncate text with ellipsis if it exceeds maxLength
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

/**
 * Convert file size in bytes to human-readable format
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/**
 * Extract domain from email address
 * @param {string} email - Email address
 * @returns {string} Domain name
 */
export const getEmailDomain = (email) => {
    if (!email || !email.includes('@')) return '';
    return email.split('@')[1];
};

/**
 * Generate random alphanumeric string
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
export const generateRandomString = (length = 8) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
};
