const normalizeIds = (obj) => {
    if (!obj) return obj;
    
    if (Array.isArray(obj)) {
        return obj.map(normalizeIds);
    }
    
    if (typeof obj === 'object' && obj !== null) {
        // Handle Mongoose documents
        if (obj.toObject && typeof obj.toObject === 'function') {
            obj = obj.toObject();
        }
        
        const normalized = {};
        for (const [key, value] of Object.entries(obj)) {
            if (key === '_id') {
                // Convert ObjectId to string and use 'id' field
                normalized.id = value.toString();
                // Keep original _id for backward compatibility if needed
                normalized._id = value;
            } else if (typeof value === 'object' && value !== null) {
                normalized[key] = normalizeIds(value);
            } else {
                normalized[key] = value;
            }
        }
        return normalized;
    }
    
    return obj;
};

/**
 * Middleware to normalize MongoDB _id fields to id fields in API responses
 * This ensures consistent ID handling between backend and frontend
 */
exports.normalizeResponse = (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
        try {
            const normalizedData = normalizeIds(data);
            return originalJson.call(this, normalizedData);
        } catch (error) {
            console.error('Error normalizing response:', error);
            // Fallback to original data if normalization fails
            return originalJson.call(this, data);
        }
    };
    
    next();
};

/**
 * Utility function to normalize a single object (for use in controllers)
 */
exports.normalizeIds = normalizeIds;
