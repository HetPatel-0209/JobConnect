import { useState, useEffect, useCallback } from 'react';
import { OrganizationService } from '../services/organization.service';

export const useOrganizationSearch = () => {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const searchOrganizations = useCallback(async (searchQuery, options = {}) => {
        if (!searchQuery?.trim()) {
            setOrganizations([]);
            setError(null);
            return [];
        }

        setLoading(true);
        setError(null);
        
        try {
            const response = await OrganizationService.searchOrganizations(searchQuery, options);
            // Handle both direct data array and nested success response
            const orgsData = response.data?.data || response.data || [];
            setOrganizations(orgsData);
            return orgsData;
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to search organizations');
            setOrganizations([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const clearSearch = useCallback(() => {
        setOrganizations([]);
        setError(null);
        setLoading(false);
    }, []);

    return {
        organizations,
        loading,
        error,
        searchOrganizations,
        clearSearch
    };
};
