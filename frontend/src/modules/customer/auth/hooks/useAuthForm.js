import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { validateLoginForm, validateRegisterForm, parseApiError } from '../utils';

/**
 * Custom hook for handling authentication form logic
 * @param {string} formType - 'login' or 'register'
 */
export const useAuthForm = (formType = 'login') => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: ''
  });
  
  // UI state
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error
    if (generalError) {
      setGeneralError('');
    }
  };

  /**
   * Handle login submission
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setGeneralError('');
    
    // Validate form
    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    
    try {
      // login returns: { success, data?, message }
      const result = await login({
        phone: formData.phone,
        password: formData.password
      });

      if (result.success) {
        // Redirect to home page
        navigate('/customer/home');
      } else {
        setGeneralError(result.message || 'Đăng nhập thất bại!');
      }
    } catch (error) {
      console.error('Login error:', error);
      setGeneralError(parseApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle register submission
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    setGeneralError('');
    
    // Validate form
    const validation = validateRegisterForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    
    try {
      // register returns: { success, data?, message, requireLogin? }
      const result = await register({
        fullName: formData.fullName,
        phone: formData.phone,
        password: formData.password
      });

      if (result.success) {
        if (result.requireLogin) {
          // Registration successful but needs to login manually
          setGeneralError(result.message || 'Đăng ký thành công! Vui lòng đăng nhập.');
          // Switch to login tab after 2 seconds
          setTimeout(() => {
            navigate('/auth'); // Or switch tab if on same page
          }, 2000);
        } else {
          // Auto-login successful, redirect to home
          navigate('/customer/home');
        }
      } else {
        setGeneralError(result.message || 'Đăng ký thất bại!');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setGeneralError(parseApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset form
   */
  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      password: ''
    });
    setErrors({});
    setGeneralError('');
  };

  // Return appropriate handler based on form type
  const handleSubmit = formType === 'login' ? handleLogin : handleRegister;

  return {
    formData,
    errors,
    isLoading,
    generalError,
    handleChange,
    handleSubmit,
    resetForm
  };
};
