import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Tạo axios instance với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const isAdminPath = window.location.pathname.startsWith('/admin') ||
      window.location.pathname.startsWith('/employee');

    let token = null;
    if (isAdminPath) {
      token = localStorage.getItem('adminToken');
    }

    if (!token) {
      token = localStorage.getItem('token') ||
        localStorage.getItem('accessToken');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      console.error('❌ API Error Response:', {
        status,
        message: data?.message || 'Unknown error',
        url: error.config?.url,
      });

      switch (status) {
        case 401: {
          console.warn('🔒 Unauthorized - Clearing token and redirecting');

          const isAdminPath =
            window.location.pathname.startsWith('/admin') ||
            window.location.pathname.startsWith('/employee');

          if (isAdminPath) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminRefreshToken');
            localStorage.removeItem('adminUser');

          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');

          }

          break;
        }

        case 403:
          // Forbidden - Không có quyền truy cập
          console.warn('🚫 Forbidden - Access denied');
          break;

        case 404:
          // Not Found
          console.warn('🔍 Resource not found');
          break;

        case 500:
          // Internal Server Error
          console.error('🔥 Server error');
          break;

        default:
          console.error('⚠️ HTTP Error:', status);
      }

      return Promise.reject({
        status,
        message: data?.message || 'Đã xảy ra lỗi, vui lòng thử lại',
        data: data,
      });
    } else if (error.request) {
      return Promise.reject({
        message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
      });
    } else {
      return Promise.reject({
        message: error.message || 'Đã xảy ra lỗi không xác định',
      });
    }
  }
);

export default axiosInstance;
