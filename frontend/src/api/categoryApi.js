import axiosInstance from './axiosConfig';
import { CATEGORY_ENDPOINTS } from '../constants/apiEndpoints';

/**
 * Category API Service
 * Tất cả các API calls liên quan đến danh mục món ăn
 */

export const categoryApi = {
  /**
   * Lấy tất cả categories
   * @returns {Promise} Response với danh sách categories
   */
  getAll: async () => {
    try {
      const response = await axiosInstance.get(CATEGORY_ENDPOINTS.GET_ALL);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy category theo ID
   * @param {number} id - Category ID
   * @returns {Promise} Response với category detail
   */
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(
        CATEGORY_ENDPOINTS.GET_BY_ID(id)
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy category theo tên
   * @param {string} name - Category name
   * @returns {Promise} Response với category detail
   */
  getByName: async (name) => {
    try {
      const response = await axiosInstance.get(
        CATEGORY_ENDPOINTS.GET_BY_NAME(name)
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Tạo category mới (Admin only)
   * @param {object} categoryData - Category data {name}
   * @returns {Promise} Response với category đã tạo
   */
  create: async (categoryData) => {
    try {
      const response = await axiosInstance.post(
        CATEGORY_ENDPOINTS.CREATE,
        categoryData
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật category (Admin only)
   * @param {number} id - Category ID
   * @param {object} categoryData - Category data cần update
   * @returns {Promise} Response với category đã cập nhật
   */
  update: async (id, categoryData) => {
    try {
      const response = await axiosInstance.put(
        CATEGORY_ENDPOINTS.UPDATE(id),
        categoryData
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xóa category (Admin only)
   * @param {number} id - Category ID
   * @returns {Promise} Response xác nhận xóa
   */
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(
        CATEGORY_ENDPOINTS.DELETE(id)
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Aliases for compatibility with admin components
  createCategory: async (categoryData) => categoryApi.create(categoryData),
  updateCategory: async (id, categoryData) => categoryApi.update(id, categoryData),
  deleteCategory: async (id) => categoryApi.delete(id),
};

export default categoryApi;
