import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing values
 * @param {any} value - The value to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {any} The debounced value
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for debounced search with loading state
 * @param {string} searchTerm - The search term to debounce
 * @param {number} delay - The delay in milliseconds (default: 500)
 * @returns {object} Object containing debouncedValue and isSearching state
 */
export function useDebounceSearch(searchTerm, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(searchTerm);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchTerm !== debouncedValue) {
      setIsSearching(true);
    }

    const handler = setTimeout(() => {
      setDebouncedValue(searchTerm);
      setIsSearching(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, debouncedValue, delay]);

  return { debouncedValue, isSearching };
}
