import { useState, useCallback } from 'react';
import { dishApi } from '../../../../api';

/**
 * Custom hook để search dishes
 * @returns {Object} { searchResults, searching, searchQuery, search, clearSearch }
 */
export const useSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  /**
   * Thực hiện search
   * @param {string} query - Search query
   */
  const search = useCallback(async (query) => {
    // Nếu query rỗng, clear search
    if (!query || !query.trim()) {
      setSearchResults([]);
      setSearchQuery('');
      setError(null);
      return;
    }

    try {
      setSearching(true);
      setError(null);
      setSearchQuery(query);

      const response = await dishApi.search(query);

      // Backend trả về: { success: true, data: [...], message: "..." }
      if (response.success) {
        setSearchResults(response.data || []);
      } else {
        throw new Error(response.message || 'Search failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'Không thể tìm kiếm món ăn';
      setError(errorMessage);
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  /**
   * Clear search results và query
   */
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchQuery('');
    setError(null);
  }, []);

  return {
    searchResults,
    searching,
    searchQuery,
    error,
    search,
    clearSearch,
  };
};
