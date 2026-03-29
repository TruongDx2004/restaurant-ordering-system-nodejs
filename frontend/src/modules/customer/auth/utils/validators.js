/**
 * Validation utilities for authentication forms
 */

/**
 * Validate Vietnamese phone number
 * Must be 10 digits and start with 0
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^0\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate password
 * Must be at least 6 characters
 * @param {string} password
 * @returns {boolean}
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Validate full name
 * Must not be empty and at least 2 characters
 * @param {string} fullName
 * @returns {boolean}
 */
export const isValidFullName = (fullName) => {
  return fullName && fullName.trim().length >= 2;
};

/**
 * Validate login form
 * @param {Object} formData - { phone, password }
 * @returns {Object} { isValid: boolean, errors: {} }
 */
export const validateLoginForm = (formData) => {
  const errors = {};

  // Validate phone
  if (!formData.phone) {
    errors.phone = 'Vui lòng nhập số điện thoại';
  } else if (!isValidPhone(formData.phone)) {
    errors.phone = 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)';
  }

  // Validate password
  if (!formData.password) {
    errors.password = 'Vui lòng nhập mật khẩu';
  } else if (!isValidPassword(formData.password)) {
    errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate register form
 * @param {Object} formData - { fullName, phone, password }
 * @returns {Object} { isValid: boolean, errors: {} }
 */
export const validateRegisterForm = (formData) => {
  const errors = {};

  // Validate full name
  if (!formData.fullName) {
    errors.fullName = 'Vui lòng nhập họ tên';
  } else if (!isValidFullName(formData.fullName)) {
    errors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
  }

  // Validate phone
  if (!formData.phone) {
    errors.phone = 'Vui lòng nhập số điện thoại';
  } else if (!isValidPhone(formData.phone)) {
    errors.phone = 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)';
  }

  // Validate password
  if (!formData.password) {
    errors.password = 'Vui lòng nhập mật khẩu';
  } else if (!isValidPassword(formData.password)) {
    errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Parse API error to user-friendly message
 * @param {Error|Object} error
 * @returns {string}
 */
export const parseApiError = (error) => {
  // Error from axios interceptor: { status, message, data }
  if (error.message) {
    return error.message;
  }
  
  // Axios error object
  if (error.response) {
    const { data, status } = error.response;
    
    // Backend returns: { success: false, data: null, message: "..." }
    if (data && data.message) {
      return data.message;
    }
    
    // Default messages based on status code
    switch (status) {
      case 400:
        return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
      case 401:
        return 'Số điện thoại hoặc mật khẩu không đúng.';
      case 404:
        return 'Không tìm thấy tài khoản.';
      case 409:
        return 'Số điện thoại đã được đăng ký.';
      case 500:
        return 'Lỗi máy chủ. Vui lòng thử lại sau.';
      default:
        return 'Đã xảy ra lỗi. Vui lòng thử lại.';
    }
  }
  
  // Network error
  if (error.request) {
    return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
  }
  
  // Other errors
  return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
};
