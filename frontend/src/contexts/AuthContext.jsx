import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../api';

/**
 * Authentication Context
 * Manages global authentication state
 * 
 * Backend Response Structure:
 * Login: { success: true, data: { accessToken, tokenType, expiresIn }, message }
 * Register: { success: true, data: { id, fullName, phone, status, createdAt }, message }
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      if (authApi.isAuthenticated()) {
        const currentUser = authApi.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Login function
   * @param {Object} credentials - phone and password
   * @returns {Promise<Object>} { success, data?, message }
   */
  const login = async (credentials) => {
    try {
      // authApi.login already handles saving token to localStorage
      // Returns: { success: true, data: { accessToken, tokenType, expiresIn }, message }
      const response = await authApi.login(credentials);
      
      if (response.success && response.data) {
        // Get user from localStorage or create basic user object
        const userData = authApi.getCurrentUser() || {
          phone: credentials.phone,
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        
        return { 
          success: true, 
          data: response.data,
          message: response.message || 'Đăng nhập thành công!'
        };
      }
      
      return { 
        success: false, 
        message: response.message || 'Đăng nhập thất bại!'
      };
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      return {
        success: false,
        message: error.message || 'Đăng nhập thất bại! Vui lòng thử lại.'
      };
    }
  };

  /**
   * Register function
   * @param {Object} userData - fullName, phone, password
   * @returns {Promise<Object>} { success, data?, message }
   */
  const register = async (userData) => {
    try {
      // authApi.register already handles saving user to localStorage
      // Returns: { success: true, data: { id, fullName, phone, status, createdAt }, message }
      const response = await authApi.register(userData);
      
      if (response.success && response.data) {
        // After successful registration, auto login
        const loginResult = await login({
          phone: userData.phone,
          password: userData.password
        });
        
        if (loginResult.success) {
          return { 
            success: true, 
            data: response.data,
            message: response.message || 'Đăng ký thành công!'
          };
        } else {
          // Registration OK but login failed
          return {
            success: true,
            data: response.data,
            message: 'Đăng ký thành công! Vui lòng đăng nhập.',
            requireLogin: true
          };
        }
      }
      
      return { 
        success: false, 
        message: response.message || 'Đăng ký thất bại!'
      };
    } catch (error) {
      console.error('Registration error in AuthContext:', error);
      return {
        success: false,
        message: error.message || 'Đăng ký thất bại! Vui lòng thử lại.'
      };
    }
  };

  /**
   * Logout function
   */
  const logout = () => {
    authApi.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Update user data
   */
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
