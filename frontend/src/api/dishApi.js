import axiosInstance from './axiosConfig';
import { DISH_ENDPOINTS } from '../constants/apiEndpoints';

/**
 * Dish API Service
 * Tất cả các API calls liên quan đến món ăn
 */

export const dishApi = {
  /**
   * Lấy tất cả món ăn
   * @returns {Promise} Response với danh sách dishes
   */
  getAll: async () => {
    try {
      const response = await axiosInstance.get(DISH_ENDPOINTS.GET_ALL);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy món ăn theo ID
   * @param {number} id - Dish ID
   * @returns {Promise} Response với dish detail
   */
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(DISH_ENDPOINTS.GET_BY_ID(id));
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy món ăn theo category
   * @param {number} categoryId - Category ID
   * @returns {Promise} Response với danh sách dishes trong category
   */
  getByCategory: async (categoryId) => {
    try {
      const response = await axiosInstance.get(
        DISH_ENDPOINTS.GET_BY_CATEGORY(categoryId)
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy món ăn theo status (AVAILABLE/SOLD_OUT)
   * @param {string} status - Dish status ('AVAILABLE' hoặc 'SOLD_OUT')
   * @returns {Promise} Response với danh sách dishes theo status
   */
  getByStatus: async (status) => {
    try {
      const response = await axiosInstance.get(
        DISH_ENDPOINTS.GET_BY_STATUS(status)
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy tất cả món ăn có sẵn (AVAILABLE)
   * @returns {Promise} Response với danh sách dishes available
   */
  getAvailable: async () => {
    try {
      const response = await axiosInstance.get(
        DISH_ENDPOINTS.GET_BY_STATUS('AVAILABLE')
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Tìm kiếm món ăn theo tên
   * @param {string} name - Tên món ăn cần tìm
   * @returns {Promise} Response với danh sách dishes matching search
   */
  search: async (name) => {
    try {
      const response = await axiosInstance.get(DISH_ENDPOINTS.SEARCH, {
        params: { name },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Tạo món ăn mới (Admin only)
   * @param {object} dishData - Dish data {name, price, categoryId, image, status}
   * @returns {Promise} Response với dish đã tạo
   */
  create: async (dishData) => {
    try {
      const response = await axiosInstance.post(
        DISH_ENDPOINTS.CREATE,
        dishData
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật món ăn (Admin only)
   * @param {number} id - Dish ID
   * @param {object} dishData - Dish data cần update
   * @returns {Promise} Response với dish đã cập nhật
   */
  update: async (id, dishData) => {
    const isFormData = dishData instanceof FormData;

    const response = await axiosInstance.put(
      DISH_ENDPOINTS.UPDATE(id),
      dishData,
      isFormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {}
    );

    return response;
  },

  /**
   * Xóa món ăn (Admin only)
   * @param {number} id - Dish ID
   * @returns {Promise} Response xác nhận xóa
   */
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(DISH_ENDPOINTS.DELETE(id));
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật status của món ăn (Admin only)
   * @param {number} id - Dish ID
   * @param {string} status - New status ('AVAILABLE' hoặc 'SOLD_OUT')
   * @returns {Promise} Response với dish đã cập nhật status
   */
  updateStatus: async (id, status) => {
    try {
      const response = await axiosInstance.patch(
        DISH_ENDPOINTS.UPDATE_STATUS(id),
        null,
        {
          params: { status },
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Aliases for compatibility with admin components
  createDish: async (dishData) => dishApi.create(dishData),
  updateDish: async (id, dishData) => dishApi.update(id, dishData),
  deleteDish: async (id) => dishApi.delete(id),
  updateDishStatus: async (id, status) => dishApi.updateStatus(id, status),
};

export default dishApi;
