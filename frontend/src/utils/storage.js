/**
 * LocalStorage Utility Functions
 * Quản lý localStorage một cách an toàn
 */

/**
 * Storage keys constants
 */
export const STORAGE_KEYS = {
  TABLE_NUMBER: 'tableNumber',
  CART_ITEMS: 'cartItems',
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_INFO: 'userInfo',
  CUSTOMER_INFO: 'customerInfo',
};

/**
 * Get item from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Parsed value or default value
 */
export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    
    if (item === null) {
      return defaultValue;
    }
    
    // Try to parse JSON
    try {
      return JSON.parse(item);
    } catch {
      // If not JSON, return as string
      return item;
    }
  } catch (error) {
    console.error(`Error getting item from localStorage: ${key}`, error);
    return defaultValue;
  }
};

/**
 * Set item to localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified if object)
 * @returns {boolean} Success status
 */
export const setItem = (key, value) => {
  try {
    const serializedValue = typeof value === 'string' 
      ? value 
      : JSON.stringify(value);
    
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error(`Error setting item to localStorage: ${key}`, error);
    return false;
  }
};

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing item from localStorage: ${key}`, error);
    return false;
  }
};

/**
 * Clear all localStorage
 * @returns {boolean} Success status
 */
export const clearAll = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage', error);
    return false;
  }
};

/**
 * Check if key exists in localStorage
 * @param {string} key - Storage key
 * @returns {boolean} true if exists
 */
export const hasItem = (key) => {
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error(`Error checking item in localStorage: ${key}`, error);
    return false;
  }
};

// Specific storage functions for app

/**
 * Table Number
 */
export const getTableNumber = () => {
  return getItem(STORAGE_KEYS.TABLE_NUMBER, '1');
};

export const setTableNumber = (tableNumber) => {
  return setItem(STORAGE_KEYS.TABLE_NUMBER, tableNumber);
};

/**
 * Cart Items
 */
export const getCartItems = () => {
  return getItem(STORAGE_KEYS.CART_ITEMS, []);
};

export const setCartItems = (items) => {
  return setItem(STORAGE_KEYS.CART_ITEMS, items);
};

export const clearCart = () => {
  return setItem(STORAGE_KEYS.CART_ITEMS, []);
};

/**
 * Authentication Tokens
 */
export const getAccessToken = () => {
  return getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

export const setAccessToken = (token) => {
  return setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
};

export const getRefreshToken = () => {
  return getItem(STORAGE_KEYS.REFRESH_TOKEN);
};

export const setRefreshToken = (token) => {
  return setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
};

export const clearTokens = () => {
  removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  return true;
};

/**
 * User Info
 */
export const getUserInfo = () => {
  return getItem(STORAGE_KEYS.USER_INFO);
};

export const setUserInfo = (userInfo) => {
  return setItem(STORAGE_KEYS.USER_INFO, userInfo);
};

export const clearUserInfo = () => {
  return removeItem(STORAGE_KEYS.USER_INFO);
};

/**
 * Customer Info
 */
export const getCustomerInfo = () => {
  return getItem(STORAGE_KEYS.CUSTOMER_INFO);
};

export const setCustomerInfo = (customerInfo) => {
  return setItem(STORAGE_KEYS.CUSTOMER_INFO, customerInfo);
};

export const clearCustomerInfo = () => {
  return removeItem(STORAGE_KEYS.CUSTOMER_INFO);
};

/**
 * Clear all auth related data
 */
export const clearAuthData = () => {
  clearTokens();
  clearUserInfo();
  clearCustomerInfo();
  return true;
};

export default {
  STORAGE_KEYS,
  getItem,
  setItem,
  removeItem,
  clearAll,
  hasItem,
  getTableNumber,
  setTableNumber,
  getCartItems,
  setCartItems,
  clearCart,
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  clearTokens,
  getUserInfo,
  setUserInfo,
  clearUserInfo,
  getCustomerInfo,
  setCustomerInfo,
  clearCustomerInfo,
  clearAuthData,
};
