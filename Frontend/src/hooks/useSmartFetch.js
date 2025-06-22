import { useState, useEffect, useCallback, useRef } from 'react';
import cacheService from '../services/cache.service';

/**
 * Smart data fetching hook that uses cache and prevents unnecessary API calls
 * @param {string|Function} cacheKey - Cache key or function that returns cache key
 * @param {Function} fetchFunction - Function to fetch data from API
 * @param {Object} options - Configuration options
 * @returns {Object} { data, loading, error, refetch, isStale }
 */
export const useSmartFetch = (cacheKey, fetchFunction, options = {}) => {
    const {
        dependencies = [], // Dependencies that trigger refetch
        ttl = 5 * 60 * 1000, // Time to live in milliseconds
        staleTime = 2 * 60 * 1000, // Time after which data is considered stale
        enabled = true, // Whether to fetch data
        onSuccess = null, // Callback on successful fetch
        onError = null, // Callback on error
        retryCount = 3, // Number of retry attempts
        retryDelay = 1000, // Delay between retries
        background = false, // Whether to fetch in background (don't show loading)
        realtime = false, // Whether to subscribe to real-time updates
    } = options;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isStale, setIsStale] = useState(false);
    
    const retryCountRef = useRef(0);
    const mountedRef = useRef(true);
    const lastFetchRef = useRef(0);
    const unsubscribeRef = useRef(null);

    // Get the actual cache key
    const actualCacheKey = typeof cacheKey === 'function' ? cacheKey() : cacheKey;

    // Check if data is stale
    const checkStale = useCallback(() => {
        if (actualCacheKey) {
            const isDataStale = cacheService.isStale(actualCacheKey, staleTime);
            setIsStale(isDataStale);
            return isDataStale;
        }
        return false;
    }, [actualCacheKey, staleTime]);

    // Fetch data with retry logic
    const fetchData = useCallback(async (force = false, showLoading = true) => {
        console.log('🎣 useSmartFetch fetchData called:', {
            enabled,
            actualCacheKey,
            force,
            showLoading
        });
        
        if (!enabled || !actualCacheKey) {
            console.log('⚠️ useSmartFetch: Not enabled or no cache key', {
                enabled,
                actualCacheKey
            });
            return;
        }

        // Prevent rapid successive calls
        const now = Date.now();
        if (!force && now - lastFetchRef.current < 1000) {
            return;
        }
        lastFetchRef.current = now;

        // Check cache first
        if (!force) {
            const cachedData = cacheService.get(actualCacheKey);
            if (cachedData) {
                setData(cachedData);
                setError(null);
                checkStale();
                if (onSuccess) onSuccess(cachedData);
                return cachedData;
            }
        }

        if (showLoading && !background) {
            setLoading(true);
        }
        setError(null);

        try {
            // Use cache service's getOrFetch to prevent duplicate requests
            const result = await cacheService.getOrFetch(actualCacheKey, async () => {
                const fetchResult = await fetchFunction();
                return fetchResult;
            });

            if (mountedRef.current) {
                setData(result);
                setError(null);
                retryCountRef.current = 0;
                checkStale();
                if (onSuccess) onSuccess(result);
            }

            // Cache the result with specified TTL
            cacheService.set(actualCacheKey, result, ttl);
            
            return result;
        } catch (err) {
            if (mountedRef.current) {
                // Retry logic
                if (retryCountRef.current < retryCount) {
                    retryCountRef.current++;
                    setTimeout(() => {
                        if (mountedRef.current) {
                            fetchData(force, showLoading);
                        }
                    }, retryDelay * retryCountRef.current);
                    return;
                }

                setError(err);
                if (onError) onError(err);
            }
            throw err;
        } finally {
            if (mountedRef.current && showLoading && !background) {
                setLoading(false);
            }
        }
    }, [
        enabled, 
        actualCacheKey, 
        fetchFunction, 
        ttl, 
        background, 
        retryCount, 
        retryDelay, 
        onSuccess, 
        onError,
        checkStale
    ]);

    // Refetch function for manual refresh
    const refetch = useCallback((showLoading = true) => {
        return fetchData(true, showLoading);
    }, [fetchData]);

    // Force reload function - clears cache first then refetches
    const forceReload = useCallback((showLoading = true) => {
        if (actualCacheKey) {
            // Clear this specific cache entry
            cacheService.delete(actualCacheKey);
            console.log(`Force reloading data for ${actualCacheKey}`);
            return fetchData(true, showLoading);
        }
        return Promise.resolve(null);
    }, [fetchData, actualCacheKey]);

    // Subscribe to cache updates if realtime is enabled
    useEffect(() => {
        if (realtime && actualCacheKey) {
            const unsubscribe = cacheService.subscribe(actualCacheKey, ({ data: newData, action }) => {
                if (mountedRef.current) {
                    if (action === 'deleted') {
                        setData(null);
                    } else {
                        setData(newData);
                        checkStale();
                    }
                }
            });
            
            unsubscribeRef.current = unsubscribe;
            
            return () => {
                if (unsubscribeRef.current) {
                    unsubscribeRef.current();
                }
            };
        }
    }, [realtime, actualCacheKey, checkStale]);

    // Initial fetch and dependency-based refetch
    useEffect(() => {
        console.log('🔄 useSmartFetch effect triggered:', {
            enabled,
            actualCacheKey,
            dependencies
        });

        if (enabled && actualCacheKey) {
            console.log('✅ useSmartFetch: Conditions met, calling fetchData');
            // Add a small delay to prevent rapid successive calls
            const timeoutId = setTimeout(() => {
                if (mountedRef.current) {
                    fetchData(false, true);
                }
            }, 10);

            return () => clearTimeout(timeoutId);
        } else {
            console.log('❌ useSmartFetch: Conditions not met', {
                enabled,
                actualCacheKey
            });
        }
    }, [enabled, actualCacheKey, ...dependencies]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            mountedRef.current = false;
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, []);

    // Check for stale data periodically
    useEffect(() => {
        if (data && actualCacheKey) {
            const interval = setInterval(checkStale, 30000); // Check every 30 seconds
            return () => clearInterval(interval);
        }
    }, [data, actualCacheKey, checkStale]);

    return {
        data,
        loading,
        error,
        refetch,
        forceReload,
        isStale,
        cacheKey: actualCacheKey
    };
};

/**
 * Hook for fetching paginated data with smart caching
 */
export const useSmartPaginatedFetch = (cacheKeyGenerator, fetchFunction, options = {}) => {
    const [page, setPage] = useState(options.initialPage || 1);
    const [allData, setAllData] = useState([]);
    const [pagination, setPagination] = useState({});
    
    const cacheKey = cacheKeyGenerator(page);
    
    const { data, loading, error, refetch } = useSmartFetch(
        cacheKey,
        () => fetchFunction({ page, ...options.filters }),
        {
            ...options,
            dependencies: [page, ...(options.dependencies || [])],
            onSuccess: (result) => {
                // Extract data array from various possible property names
                const dataArray = result.data || result.items || result.jobs || result.applications || [];

                if (options.accumulate && page > 1) {
                    setAllData(prev => [...prev, ...dataArray]);
                } else {
                    setAllData(dataArray);
                }
                setPagination(result.pagination || {});
                if (options.onSuccess) options.onSuccess(result);
            }
        }
    );

    const loadMore = useCallback(() => {
        if (pagination.hasNext) {
            setPage(prev => prev + 1);
        }
    }, [pagination.hasNext]);

    const reset = useCallback(() => {
        setPage(1);
        setAllData([]);
        setPagination({});
    }, []);

    return {
        data: options.accumulate ? allData : (data?.data || data?.items || data?.jobs || data?.applications || []),
        pagination,
        loading,
        error,
        refetch,
        loadMore,
        reset,
        page,
        setPage
    };
};

/**
 * Hook for fetching multiple related data sources
 */
export const useSmartMultiFetch = (fetchConfigs) => {
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});

    // Create a stable reference for fetchConfigs to prevent infinite re-renders
    const stableConfigsRef = useRef();
    const [configsHash, setConfigsHash] = useState('');

    // Generate a hash of the configs to detect changes
    useEffect(() => {
        const newHash = JSON.stringify(
            Object.entries(fetchConfigs).map(([key, config]) => [
                key,
                config.cacheKey,
                config.enabled !== false
            ])
        );

        if (newHash !== configsHash) {
            setConfigsHash(newHash);
            stableConfigsRef.current = fetchConfigs;
        }
    }, [fetchConfigs, configsHash]);

    useEffect(() => {
        if (!stableConfigsRef.current) return;

        const fetchAll = async () => {
            setLoading(true);
            const newResults = {};
            const newErrors = {};

            // Filter enabled configs
            const enabledConfigs = Object.entries(stableConfigsRef.current).filter(
                ([, config]) => config.enabled !== false && config.cacheKey
            );

            if (enabledConfigs.length === 0) {
                setLoading(false);
                return;
            }

            await Promise.allSettled(
                enabledConfigs.map(async ([key, config]) => {
                    try {
                        const result = await cacheService.getOrFetch(
                            config.cacheKey,
                            config.fetchFunction
                        );
                        newResults[key] = result;
                    } catch (error) {
                        console.error(`Error fetching ${key}:`, error);
                        newErrors[key] = error;
                    }
                })
            );

            setResults(newResults);
            setErrors(newErrors);
            setLoading(false);
        };

        fetchAll();
    }, [configsHash]);

    return { results, loading, errors };
};

export default useSmartFetch;
