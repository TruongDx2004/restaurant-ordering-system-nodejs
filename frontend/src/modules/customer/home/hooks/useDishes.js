import { useState, useEffect } from 'react';
import { dishApi } from '../../../../api';

/**
 * Custom hook để fetch và quản lý dishes
 * @param {number|null} categoryId - Category ID để filter (null = tất cả)
 * @param {boolean} availableOnly - Chỉ lấy món có sẵn (default: true)
 * @returns {Object} { dishes, loading, error, refetch }
 */
export const useDishes = (categoryId = null, availableOnly = true) => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDishes = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;

      // Quyết định API call nào sẽ dùng
      if (categoryId) {
        // Lấy dishes theo category
        response = await dishApi.getByCategory(categoryId);
      } else if (availableOnly) {
        // Lấy tất cả dishes có sẵn
        response = await dishApi.getAvailable();
      } else {
        // Lấy tất cả dishes
        response = await dishApi.getAll();
      }

      // Backend trả về: { success: true, data: { data: [...] }, message: "..." }
      // hoặc { data: [...] }
      let dishesData = [];
      
      if (response.data && Array.isArray(response.data.data)) {
        // Nested structure: response.data.data
        dishesData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        // Direct array: response.data
        dishesData = response.data;
      } else if (Array.isArray(response)) {
        // Direct response
        dishesData = response;
      }

      // Nếu có categoryId nhưng vẫn muốn filter available
      if (categoryId && availableOnly && dishesData.length > 0) {
        dishesData = dishesData.filter(dish => dish.status === 'AVAILABLE');
      }

      setDishes(dishesData);
    } catch (err) {
      const errorMessage = err.message || 'Không thể tải danh sách món ăn';
      setError(errorMessage);
      console.error('❌ Error fetching dishes:', err);
      setDishes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, [categoryId, availableOnly]); // Re-fetch khi category hoặc filter thay đổi

  return {
    dishes,
    loading,
    error,
    refetch: fetchDishes,
  };
};
