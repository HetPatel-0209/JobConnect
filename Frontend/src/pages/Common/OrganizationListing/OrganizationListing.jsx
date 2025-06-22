import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { OrganizationService } from '../../../services/organization.service';
import { useDebounceSearch } from '../../../hooks/useDebounce';
import { useSmartPaginatedFetch } from '../../../hooks/useSmartFetch';
import { CacheKeys } from '../../../services/cache.service';
import {
  Building2,
  MapPin,
  Users,
  Globe,
  Search,
  Filter,
  ArrowLeft,
  ExternalLink,
  Loader2,
  AlertCircle,
  Eye,
  ChevronRight
} from 'lucide-react';

export default function OrganizationListing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Use custom debounce hook for search
  const { debouncedValue: debouncedSearchTerm, isSearching } = useDebounceSearch(searchTerm, 500);

  // Memoize cache key to prevent unnecessary re-renders
  const cacheKeyGenerator = useMemo(() => {
    return (page) => CacheKeys.ORGANIZATIONS(page, { search: debouncedSearchTerm });
  }, [debouncedSearchTerm]);

  // Smart paginated fetch for organizations
  const {
    data: organizations,
    pagination,
    loading,
    error: fetchError,
    page: currentPage,
    setPage: setCurrentPage,
    refetch: loadOrganizations
  } = useSmartPaginatedFetch(
    cacheKeyGenerator,
    ({ page }) => OrganizationService.getAllOrganizations({
      page,
      limit: 12,
      ...(debouncedSearchTerm && { search: debouncedSearchTerm })
    }),
    {
      ttl: 3 * 60 * 1000, // 3 minutes cache
      dependencies: [debouncedSearchTerm],
      onSuccess: (data) => {
        console.log('Organizations loaded:', data);
      },
      onError: (err) => {
        console.error('Failed to load organizations:', err);
      }
    }
  );

  // Handle response structure - extract organizations from response
  const actualOrganizations = organizations?.data?.organizations || organizations?.organizations || organizations || [];
  const error = fetchError || (!organizations?.success && organizations?.message ? organizations.message : null);

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is now handled automatically by debouncing
    // This function is kept for form submission but doesn't trigger additional API calls
  };

  const handleOrganizationClick = (orgId) => {
    if (user && user.role === 'jobseeker') {
      // For jobseekers, navigate to detailed organization view
      navigate(`/user/organization/${orgId}`);
    } else {
      // For visitors, show basic organization info (could be a modal or separate page)
      navigate(`/organization/${orgId}`);
    }
  };

  if (loading && actualOrganizations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Listed Organizations</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover companies and organizations that are actively hiring. 
            {user && user.role === 'jobseeker' 
              ? ' Click on any organization to view detailed information and available positions.'
              : ' Explore opportunities with leading companies across various industries.'
            }
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search organizations by name or GST number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {isSearching && (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin absolute right-3 top-1/2 transform -translate-y-1/2" />
              )}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              {isSearching ? 'Searching...' : `${actualOrganizations.length} organizations`}
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Organizations Grid */}
        {actualOrganizations.length === 0 && !loading ? (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Organizations Found</h3>
            <p className="text-gray-600 mb-6">
              {debouncedSearchTerm
                ? `No organizations match your search for "${debouncedSearchTerm}"`
                : 'No organizations are currently listed in our system.'
              }
            </p>
            {(searchTerm || debouncedSearchTerm) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {actualOrganizations.map((org) => (
              <div
                key={org.id}
                onClick={() => handleOrganizationClick(org.id)}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-200 ${
                  user && user.role === 'jobseeker' 
                    ? 'hover:shadow-lg hover:scale-105 cursor-pointer' 
                    : 'hover:shadow-md'
                }`}
              >
                {/* Organization Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {org.logo ? (
                      <img
                        src={org.logo}
                        alt={`${org.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                      {org.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      GST: {org.gstin}
                    </p>
                  </div>
                  {user && user.role === 'jobseeker' && (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {/* Organization Details */}
                <div className="space-y-3">
                  {org.contact?.address && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm truncate">
                        {org.contact.address.city}, {org.contact.address.state}
                      </span>
                    </div>
                  )}

                  {org.companySize && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{org.companySize} employees</span>
                    </div>
                  )}

                  {org.website && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Globe className="w-4 h-4 flex-shrink-0" />
                      <a
                        href={org.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-blue-600 hover:text-blue-800 truncate flex items-center gap-1"
                      >
                        Website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Action Button for Visitors */}
                {(!user || user.role !== 'jobseeker') && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOrganizationClick(org.id);
                      }}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                )}

                {/* Member Since */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Member since {new Date(org.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination?.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              {Array.from({ length: pagination?.totalPages || 1 }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading indicator for pagination */}
        {loading && actualOrganizations.length > 0 && (
          <div className="flex justify-center mt-8">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
