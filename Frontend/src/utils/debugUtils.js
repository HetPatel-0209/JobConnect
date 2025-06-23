/**
 * Development utility for debugging organization ID issues
 */
export const debugOrganizationId = (user, context = 'unknown') => {
    if (process.env.NODE_ENV === 'development') {
        console.group(`🔍 Organization ID Debug - ${context}`);
        console.log('User object:', user);
        console.log('User role:', user?.role);
        console.log('User organizationId:', user?.organizationId);
        console.log('User organizationId type:', typeof user?.organizationId);
        if (user?.organizationId && typeof user.organizationId === 'object') {
            console.log('User organizationId keys:', Object.keys(user.organizationId));
            console.log('User organizationId buffer:', user.organizationId.buffer);
            console.log('User organizationId toString():', user.organizationId.toString());
            console.log('User organizationId toString() length:', user.organizationId.toString().length);
            console.log('User organizationId toString() type:', typeof user.organizationId.toString());
        }
        console.log('User recruiterProfile:', user?.recruiterProfile);
        console.log('User recruiterProfile organizationId:', user?.recruiterProfile?.organizationId);
        console.log('User recruiterProfile organizationId type:', typeof user?.recruiterProfile?.organizationId);
        
        // Try to extract organization ID using the same logic as UserIdUtils
        if (user?.organizationId) {
            if (typeof user.organizationId === 'object' && user.organizationId !== null) {
                const id = user.organizationId._id || user.organizationId.id;
                console.log('Extracted from user.organizationId object:', id);
            } else if (typeof user.organizationId === 'string') {
                console.log('Extracted from user.organizationId string:', user.organizationId);
            } else {
                console.log('user.organizationId toString():', user.organizationId?.toString?.());
            }
        }
        
        if (user?.recruiterProfile?.organizationId) {
            const orgId = user.recruiterProfile.organizationId;
            if (typeof orgId === 'object' && orgId !== null) {
                const id = orgId._id || orgId.id;
                console.log('Extracted from recruiterProfile.organizationId object:', id);
            } else if (typeof orgId === 'string') {
                console.log('Extracted from recruiterProfile.organizationId string:', orgId);
            } else {
                console.log('recruiterProfile.organizationId toString():', orgId?.toString?.());
            }
        }
        
        console.groupEnd();
    }
};

/**
 * Safe organization ID extraction with detailed logging
 */
export const safeGetOrganizationId = (user, context = 'unknown') => {
    debugOrganizationId(user, context);
    
    if (!user || user.role !== 'recruiter') {
        console.warn(`[${context}] User is not a recruiter:`, user?.role);
        return null;
    }

    // Try different possible structures:
    // 1. Direct organizationId on user
    if (user.organizationId) {
        if (typeof user.organizationId === 'object' && user.organizationId !== null) {
                // Check for MongoDB ObjectId with buffer property
                if (user.organizationId.buffer && typeof user.organizationId.buffer === 'object') {
                    // This is likely a MongoDB ObjectId - convert buffer to hex string
                    const buffer = user.organizationId.buffer;
                    let hexString = '';

                    // Convert buffer to hex string
                    if (buffer.data && Array.isArray(buffer.data)) {
                        hexString = buffer.data.map(byte => byte.toString(16).padStart(2, '0')).join('');
                    } else if (buffer instanceof Uint8Array || buffer instanceof Array) {
                        hexString = Array.from(buffer).map(byte => byte.toString(16).padStart(2, '0')).join('');
                    } else if (typeof buffer === 'object' && buffer !== null) {
                        // Handle buffer as object with numeric keys (MongoDB ObjectId format)
                        const bytes = [];
                        for (let i = 0; i < 12; i++) {
                            if (buffer[i] !== undefined) {
                                bytes.push(buffer[i]);
                            }
                        }
                        if (bytes.length === 12) {
                            hexString = bytes.map(byte => byte.toString(16).padStart(2, '0')).join('');
                        }
                    }

                    // If we still don't have a valid hex string, try toString() as fallback
                    if (!hexString || hexString === '[object Object]') {
                        hexString = user.organizationId.toString();
                    }

                    console.log(`[${context}] ObjectId buffer converted to hex:`, hexString, 'length:', hexString.length);
                    if (hexString !== '[object Object]' && hexString.length === 24) {
                        console.log(`[${context}] Extracted from user.organizationId ObjectId:`, hexString);
                        return hexString;
                    }
                }
                // Check for populated object with _id or id
                const id = user.organizationId._id || user.organizationId.id;
                if (id) {
                    const result = id.toString();
                    console.log(`[${context}] Extracted from user.organizationId object:`, result);
                    return result;
                }
            } else if (typeof user.organizationId === 'string') {
                console.log(`[${context}] Extracted from user.organizationId string:`, user.organizationId);
                return user.organizationId;
            }
            
            // Try toString() method as fallback
            if (user.organizationId.toString && typeof user.organizationId.toString === 'function') {
                const stringId = user.organizationId.toString();
                console.log(`[${context}] Trying toString():`, stringId, 'length:', stringId.length);
                if (stringId !== '[object Object]' && stringId.length >= 12) {
                    console.log(`[${context}] Extracted from user.organizationId toString():`, stringId);
                    return stringId;
                } else {
                    console.error(`[${context}] user.organizationId.toString() returned invalid result:`, stringId);
                }
            }
        }

    // 2. Through recruiterProfile.organizationId
    if (user.recruiterProfile?.organizationId) {
        const orgId = user.recruiterProfile.organizationId;
        if (typeof orgId === 'object' && orgId !== null) {
            // Check for MongoDB ObjectId with buffer property
            if (orgId.buffer && typeof orgId.buffer === 'object') {
                // This is likely a MongoDB ObjectId - convert buffer to hex string
                const buffer = orgId.buffer;
                let hexString = '';

                // Convert buffer to hex string
                if (buffer.data && Array.isArray(buffer.data)) {
                    hexString = buffer.data.map(byte => byte.toString(16).padStart(2, '0')).join('');
                } else if (buffer instanceof Uint8Array || buffer instanceof Array) {
                    hexString = Array.from(buffer).map(byte => byte.toString(16).padStart(2, '0')).join('');
                } else if (typeof buffer === 'object' && buffer !== null) {
                    // Handle buffer as object with numeric keys (MongoDB ObjectId format)
                    const bytes = [];
                    for (let i = 0; i < 12; i++) {
                        if (buffer[i] !== undefined) {
                            bytes.push(buffer[i]);
                        }
                    }
                    if (bytes.length === 12) {
                        hexString = bytes.map(byte => byte.toString(16).padStart(2, '0')).join('');
                    }
                }

                // If we still don't have a valid hex string, try toString() as fallback
                if (!hexString || hexString === '[object Object]') {
                    hexString = orgId.toString();
                }

                console.log(`[${context}] recruiterProfile ObjectId buffer converted to hex:`, hexString, 'length:', hexString.length);
                if (hexString !== '[object Object]' && hexString.length === 24) {
                    console.log(`[${context}] Extracted from recruiterProfile.organizationId ObjectId:`, hexString);
                    return hexString;
                }
            }
            // Check for populated object with _id or id
            const id = orgId._id || orgId.id;
            if (id) {
                const result = id.toString();
                console.log(`[${context}] Extracted from recruiterProfile.organizationId object:`, result);
                return result;
            }
        } else if (typeof orgId === 'string') {
            console.log(`[${context}] Extracted from recruiterProfile.organizationId string:`, orgId);
            return orgId;
        } else if (orgId.toString && typeof orgId.toString === 'function') {
            const stringId = orgId.toString();
            if (stringId !== '[object Object]') {
                console.log(`[${context}] Extracted from recruiterProfile.organizationId toString():`, stringId);
                return stringId;
            } else {
                console.error(`[${context}] recruiterProfile.organizationId.toString() returned [object Object]`);
            }
        }
    }

    console.error(`[${context}] Could not extract organization ID from user:`, user);
    return null;
};


/**
 * Safely extract ID from MongoDB ObjectId or other object types
 * @param {any} id - The ID value (could be ObjectId, string, or object)
 * @returns {string|null} The ID as a string, or null if invalid
 */
export const safeExtractId = (id) => {
    if (!id) return null;
    
    // If it's already a string, return it
    if (typeof id === 'string') {
        return id;
    }
    
    // If it's an object
    if (typeof id === 'object' && id !== null) {
        // Check for MongoDB ObjectId with buffer property
        if (id.buffer && typeof id.buffer === 'object') {
            const buffer = id.buffer;
            let hexString = '';

            // Convert buffer to hex string
            if (buffer.data && Array.isArray(buffer.data)) {
                hexString = buffer.data.map(byte => byte.toString(16).padStart(2, '0')).join('');
            } else if (buffer instanceof Uint8Array || buffer instanceof Array) {
                hexString = Array.from(buffer).map(byte => byte.toString(16).padStart(2, '0')).join('');
            } else if (typeof buffer === 'object' && buffer !== null) {
                // Handle buffer as object with numeric keys (MongoDB ObjectId format)
                const bytes = [];
                for (let i = 0; i < 12; i++) {
                    if (buffer[i] !== undefined) {
                        bytes.push(buffer[i]);
                    }
                }
                if (bytes.length === 12) {
                    hexString = bytes.map(byte => byte.toString(16).padStart(2, '0')).join('');
                }
            }

            // If we still don't have a valid hex string, try toString() as fallback
            if (!hexString || hexString === '[object Object]') {
                hexString = id.toString();
            }

            if (hexString !== '[object Object]' && hexString.length === 24) {
                return hexString;
            }
        }
        
        // Check for populated object with _id or id
        const extractedId = id._id || id.id;
        if (extractedId) {
            return safeExtractId(extractedId); // Recursive call for nested objects
        }
    }
    
    // Try toString() as last resort
    if (id.toString && typeof id.toString === 'function') {
        const stringId = id.toString();
        if (stringId !== '[object Object]' && stringId.length >= 12) {
            return stringId;
        }
    }
    
    return null;
};
