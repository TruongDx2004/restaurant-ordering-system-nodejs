import { useState, useEffect } from 'react';
import { categoryApi } from '../../../../api';

/**
 * Custom hook để fetch và quản lý categories
 * @returns {Object} { categories, loading, error, refetch }
 */
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await categoryApi.getAll();

      // Backend trả về: { success: true, data: [...], message: "..." }
      if (response.success) {
        setCategories(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch categories');
      }
    } catch (err) {
      const errorMessage = err.message || 'Không thể tải danh mục món ăn';
      setError(errorMessage);
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};
