import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { OrganizationService } from '../services/organization.service';
import { useAuth } from './AuthContext';
import { UserIdUtils } from '../utils/userIdUtils';
import { safeGetOrganizationId } from '../utils/debugUtils';

const OrganizationContext = createContext(null);

export const OrganizationProvider = ({ children }) => {
    const { user } = useAuth();
    const [currentOrganization, setCurrentOrganization] = useState(null);
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load user's organization on mount if they're a recruiter
    useEffect(() => {
        if (user && user.role === 'recruiter') {
            loadUserOrganization();
        } else {
            setCurrentOrganization(null);
        }
    }, [user]);

    const loadUserOrganization = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Check if user has recruiter profile with organization
            const organizationId = safeGetOrganizationId(user, 'OrganizationContext.loadUserOrganization');
            const debugInfo = UserIdUtils.debugOrganizationId(user);
            console.log('OrganizationContext - Organization ID debug info:', debugInfo); // Debug log

            if (organizationId && organizationId !== '[object Object]') {
                const response = await OrganizationService.getOrganization(organizationId);
                setCurrentOrganization(response.data);
            } else if (organizationId === '[object Object]') {
                setError('Invalid organization ID format. Please log out and log back in.');
            } else {
                // No organization ID found - this might be a recruiter without an organization set up
                console.warn('No organization ID found for recruiter. User may need to set up organization.');
                setCurrentOrganization(null);
                // Don't set this as an error since it might be a valid state for new recruiters
            }
        } catch (err) {
            console.error('Error loading organization:', err);
            setError('Failed to load organization data');
        } finally {
            setLoading(false);
        }
    }, [user]);

    const fetchByGST = useCallback(async (gstNumber) => {
        setLoading(true);
        setError(null);
        try {
            const response = await OrganizationService.fetchByGST(gstNumber);
            return response;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch organization by GST');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createOrganization = useCallback(async (organizationData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await OrganizationService.createOrganization(organizationData);
            setCurrentOrganization(response.data);
            return response;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create organization');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateOrganization = useCallback(async (orgId, organizationData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await OrganizationService.updateOrganization(orgId, organizationData);

            // Update current organization if it's the same one being updated
            if (currentOrganization && currentOrganization.id === orgId) {
                setCurrentOrganization(response.data);
            }

            return response;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update organization');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [currentOrganization]);

    const uploadImages = useCallback(async (orgId, files) => {
        setLoading(true);
        setError(null);
        try {
            const response = await OrganizationService.uploadImages(orgId, files);

            // Update current organization if it's the same one being updated
            if (currentOrganization && currentOrganization.id === orgId) {
                setCurrentOrganization(response.data);
            }

            return response;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload images');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [currentOrganization]);

    const searchOrganizations = useCallback(async (searchQuery, options = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await OrganizationService.searchOrganizations(searchQuery, options);
            setOrganizations(response.data);
            return response;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to search organizations');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getAllOrganizations = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await OrganizationService.getAllOrganizations(params);
            setOrganizations(response.data);
            return response;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch organizations');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const validateGSTFormat = useCallback((gstNumber) => {
        return OrganizationService.validateGSTFormat(gstNumber);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const value = {
        currentOrganization,
        organizations,
        loading,
        error,
        fetchByGST,
        createOrganization,
        updateOrganization,
        uploadImages,
        searchOrganizations,
        getAllOrganizations,
        validateGSTFormat,
        clearError,
        loadUserOrganization
    };

    return (
        <OrganizationContext.Provider value={value}>
            {children}
        </OrganizationContext.Provider>
    );
};

export const useOrganization = () => {
    const context = useContext(OrganizationContext);
    if (!context) {
        throw new Error('useOrganization must be used within an OrganizationProvider');
    }
    return context;
};
