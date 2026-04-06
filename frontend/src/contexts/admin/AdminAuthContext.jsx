import React, { createContext, useState, useContext, useEffect } from 'react';
import { adminAuthApi } from '../../api';

const AdminAuthContext = createContext(null);

/**
 * Admin Auth Provider
 * Manages authentication state for admin and employee users
 */
export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRefreshToken = localStorage.getItem('adminRefreshToken');
    const storedUser = localStorage.getItem('adminUser');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setRefreshToken(storedRefreshToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  /**
   * Login function
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login result
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminAuthApi.login({ email, password });
      if (response.success && response.data) {
        const { token: accessToken, refreshToken: refToken, user: userData } = response.data;

        // Save to state
        setToken(accessToken);
        setRefreshToken(refToken);
        setUser(userData);

        // Save to localStorage
        localStorage.setItem('adminToken', accessToken);
        localStorage.setItem('adminRefreshToken', refToken);
        localStorage.setItem('adminUser', JSON.stringify(userData));

        return { success: true, user: userData };
      }

      throw new Error('Login failed');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout function
   */
  const logout = async () => {
    try {
      if (user?.id) {
        await adminAuthApi.logout(user.id);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear state
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      setError(null);

      // Clear localStorage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminRefreshToken');
      localStorage.removeItem('adminUser');
    }
  };

  /**
   * Refresh token function
   */
  const refresh = async () => {
    try {
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await adminAuthApi.refreshToken(refreshToken);

      if (response.success && response.data) {
        const { token: accessToken, refreshToken: refToken, user: userData } = response.data;

        // Update state
        setToken(accessToken);
        setRefreshToken(refToken);
        setUser(userData);

        // Update localStorage
        localStorage.setItem('adminToken', accessToken);
        localStorage.setItem('adminRefreshToken', refToken);
        localStorage.setItem('adminUser', JSON.stringify(userData));

        return { success: true };
      }

      throw new Error('Refresh token failed');
    } catch (err) {
      // If refresh fails, logout
      await logout();
      return { success: false, error: err.message };
    }
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = () => {
    return !!user && !!token;
  };

  /**
   * Check if user has specific role
   * @param {string} role - Role to check (ADMIN or EMPLOYEE)
   */
  const hasRole = (role) => {
    return user?.role === role;
  };

  /**
   * Check if user is admin
   */
  const isAdmin = () => {
    return hasRole('ADMIN');
  };

  /**
   * Check if user is employee
   */
  const isEmployee = () => {
    return hasRole('EMPLOYEE');
  };

  const value = {
    user,
    token,
    refreshToken,
    loading,
    error,
    login,
    logout,
    refresh,
    isAuthenticated,
    hasRole,
    isAdmin,
    isEmployee
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

/**
 * Custom hook to use admin auth context
 */
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }

  return context;
};

export default AdminAuthContext;
