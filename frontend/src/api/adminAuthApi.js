import axiosInstance from './axiosConfig';

/**
 * Admin & Employee Authentication API
 */
const adminAuthApi = {
  /**
   * Login for admin/employee
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise} Response with token and user data
   */
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise} Response with new tokens
   */
  refreshToken: async (refreshToken) => {
    try {
      const response = await axiosInstance.post('/auth/refresh-token', null, {
        headers: {
          'Refresh-Token': refreshToken
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

};

export default adminAuthApi;
