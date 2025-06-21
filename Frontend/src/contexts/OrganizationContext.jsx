import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { OrganizationService } from '../services/organization.service';
import { useAuth } from './AuthContext';

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
        try {
            // Check if user has recruiter profile with organization
            const organizationId = user?.recruiterProfile?.organizationId?._id || user?.recruiterProfile?.organizationId || user?.organizationId;
            if (organizationId) {
                const response = await OrganizationService.getOrganization(organizationId);
                setCurrentOrganization(response.data);
            }
        } catch (err) {
            console.error(err);
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
            if (currentOrganization && currentOrganization._id === orgId) {
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
            if (currentOrganization && currentOrganization._id === orgId) {
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
