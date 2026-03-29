import axiosInstance from './axiosConfig';
import { CUSTOMER_AUTH_ENDPOINTS } from '../constants/apiEndpoints';

/**
 * Authentication API Service
 * Handles customer login and registration
 * 
 * Backend Response Structure:
 * {
 *   success: boolean,
 *   data: { ... },
 *   message: string
 * }
 */
export const authApi = {
  /**
   * Customer Login
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.phone - Phone number (10 digits, starts with 0)
   * @param {string} credentials.password - Password
   * @returns {Promise<Object>} Response: { success, data: { accessToken, tokenType, expiresIn }, message }
   */
  login: async (credentials) => {
    try {
      // axiosInstance already returns response.data (from interceptor)
      // Backend returns: { success: true, data: TokenResponse, message: "..." }
      const response = await axiosInstance.post('/customers/login', credentials);
      
      // response = { success: true, data: { accessToken, tokenType, expiresIn }, message }
      if (response.success && response.data) {
        // Save token to localStorage
        const { accessToken, expiresIn } = response.data;
        const expiryTime = Date.now() + (expiresIn * 1000);
        
        localStorage.setItem('token', accessToken);
        localStorage.setItem('tokenExpiry', expiryTime.toString());
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      // Error format from interceptor: { status, message, data }
      throw error;
    }
  },

  /**
   * Customer Registration
   * @param {Object} userData - Registration data
   * @param {string} userData.fullName - Full name of customer
   * @param {string} userData.phone - Phone number (10 digits, starts with 0)
   * @param {string} userData.password - Password (min 6 characters)
   * @returns {Promise<Object>} Response: { success, data: CustomerRegisterResponse, message }
   */
  register: async (userData) => {
    try {
      // Backend returns: { success: true, data: { id, fullName, phone, status, createdAt, message }, message }
      const response = await axiosInstance.post('/customers/register', userData);
      
      // Save user info if registration successful
      if (response.success && response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  /**
   * Logout (clear local token)
   * Note: Backend doesn't have logout endpoint yet
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('isGuest');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const expiry = localStorage.getItem('tokenExpiry');
    
    if (!token || !expiry) {
      return false;
    }

    // Check if token is expired
    const now = Date.now();
    if (now > parseInt(expiry, 10)) {
      authApi.logout();
      return false;
    }

    return true;
  },

  /**
   * Get current user from localStorage
   * @returns {Object|null}
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Get access token
   * @returns {string|null}
   */
  getToken: () => {
    return localStorage.getItem('token');
  }
};
