import { AuthService } from './auth.service';

/**
 * Validation service to handle form validation logic
 */
export const ValidationService = {
    // Validate email format
    validateEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validate password strength
    validatePassword: (password) => {
        // Min 6 characters, at least one letter and one number
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
        return passwordRegex.test(password);
    },

    // Validate name - only letters, spaces, and hyphens, min 2 characters
    validateName: (name) => {
        const nameRegex = /^[A-Za-z\s\-]{2,}$/;
        return nameRegex.test(name);
    },

    // Validate phone number (basic)
    validatePhone: (phone) => {
        const phoneRegex = /^[0-9\+\-\(\)\s]{10,15}$/;
        return phoneRegex.test(phone);
    },

    // Validate form fields with custom rules
    validateForm: (formData, rules) => {
        const errors = {};
        
        for (const field in rules) {
            if (rules.hasOwnProperty(field)) {
                const value = formData[field];
                const fieldRules = rules[field];
                
                // Required validation
                if (fieldRules.required && (!value || value.trim() === '')) {
                    errors[field] = `${fieldRules.label || field} is required`;
                    continue; // Skip other validations if required fails
                }
                
                // Skip other validations if field is empty and not required
                if (!value || value.trim() === '') continue;
                
                // Minimum length validation
                if (fieldRules.minLength && value.length < fieldRules.minLength) {
                    errors[field] = `${fieldRules.label || field} must be at least ${fieldRules.minLength} characters`;
                }
                
                // Maximum length validation
                if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
                    errors[field] = `${fieldRules.label || field} cannot exceed ${fieldRules.maxLength} characters`;
                }
                
                // Pattern validation
                if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
                    errors[field] = fieldRules.message || `${fieldRules.label || field} is invalid`;
                }
                
                // Custom validation function
                if (fieldRules.validate && typeof fieldRules.validate === 'function') {
                    const customError = fieldRules.validate(value, formData);
                    if (customError) {
                        errors[field] = customError;
                    }
                }
                
                // Match validation (e.g., confirm password)
                if (fieldRules.match && formData[fieldRules.match] !== value) {
                    errors[field] = fieldRules.matchMessage || `${fieldRules.label || field} does not match`;
                }
            }
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
};

/**
 * Authorization middleware service to handle permissions
 */
export const AuthorizationService = {
    // Check if user is authenticated
    isAuthenticated: () => {
        return AuthService.isAuthenticated();
    },
    
    // Check if user has required role
    hasRole: (requiredRole) => {
        const user = AuthService.getCurrentUser();
        return user && user.type === requiredRole;
    },
    
    // Check if user has any of the required roles
    hasAnyRole: (requiredRoles) => {
        const user = AuthService.getCurrentUser();
        return user && requiredRoles.includes(user.type);
    },
    
    // Check if user is the owner of a resource (by comparing user IDs)
    isOwner: (resourceUserId) => {
        const user = AuthService.getCurrentUser();
        return user && user.id === resourceUserId;
    }
};
