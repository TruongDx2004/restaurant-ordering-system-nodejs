import axiosInstance from './axiosConfig';

/**
 * User Management API
 * For admin to manage users (employees, admins)
 */
const userApi = {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise} Response with created user
   */
  createUser: async (userData) => {
    try {
      const response = await axiosInstance.post('/users', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise} Response with user data
   */
  getUserById: async (id) => {
    try {
      const response = await axiosInstance.get(`/users/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all users
   * @returns {Promise} Response with list of users
   */
  getAllUsers: async () => {
    try {
      const response = await axiosInstance.get('/users');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user
   * @param {number} id - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise} Response with updated user
   */
  updateUser: async (id, userData) => {
    try {
      const response = await axiosInstance.put(`/users/${id}`, userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise} Success response
   */
  deleteUser: async (id) => {
    try {
      const response = await axiosInstance.delete(`/users/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise} Response with user data
   */
  getUserByEmail: async (email) => {
    try {
      const response = await axiosInstance.get(`/users/email/${email}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user by phone
   * @param {string} phone - User phone
   * @returns {Promise} Response with user data
   */
  getUserByPhone: async (phone) => {
    try {
      const response = await axiosInstance.get(`/users/phone/${phone}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get users by role
   * @param {string} role - User role (ADMIN, EMPLOYEE)
   * @returns {Promise} Response with list of users
   */
  getUsersByRole: async (role) => {
    try {
      const response = await axiosInstance.get(`/users/role/${role}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default userApi;
