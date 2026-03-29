import { useState, useEffect } from 'react';
import { dishApi } from '../../../../api';

/**
 * Custom hook để fetch dish detail by ID
 * @param {number} dishId - Dish ID
 * @returns {Object} { dish, loading, error, refetch }
 */
export const useDishDetail = (dishId) => {
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDishDetail = async () => {
    if (!dishId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await dishApi.getById(dishId);

      // Backend trả về: { success: true, data: {...}, message: "..." }
      if (response.success) {
        setDish(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch dish detail');
      }
    } catch (err) {
      const errorMessage = err.message || 'Không thể tải thông tin món ăn';
      setError(errorMessage);
      console.error('Error fetching dish detail:', err);
      setDish(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishDetail();
  }, [dishId]);

  return {
    dish,
    loading,
    error,
    refetch: fetchDishDetail,
  };
};
