/**
 * Environment Check Utility
 * This file helps debug environment variable issues
 */

export const checkEnvironment = () => {
    const envVars = {
        VITE_BACKEND_API_BASE_URL: import.meta.env.VITE_BACKEND_API_BASE_URL,
        VITE_BACKEND_API_URL: import.meta.env.VITE_BACKEND_API_URL,
        MODE: import.meta.env.MODE,
        DEV: import.meta.env.DEV,
        PROD: import.meta.env.PROD
    };

    console.log('🔍 Environment Check:');
    console.table(envVars);
    
    return envVars;
};

// Auto-run in development
if (import.meta.env.DEV) {
    checkEnvironment();
}
