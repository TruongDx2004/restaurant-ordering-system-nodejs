import axios from 'axios';

// Base URL từ environment variable hoặc default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Tạo axios instance với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Thêm token vào header nếu có
axiosInstance.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage (ưu tiên adminToken nếu đang ở trang admin)
    const isAdminPath = window.location.pathname.startsWith('/admin') || 
                        window.location.pathname.startsWith('/employee');
    
    let token = null;
    if (isAdminPath) {
      token = localStorage.getItem('adminToken');
    }
    
    // Nếu không có adminToken hoặc không phải path admin, thử các key khác
    if (!token) {
      token = localStorage.getItem('token') || 
              localStorage.getItem('accessToken');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request khi ở development mode
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

// Response interceptor - Xử lý response và error
axiosInstance.interceptors.response.use(
  (response) => {
    // Log response khi ở development mode
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }

    // Backend trả về format: { success: true, data: [...], message: "..." }
    // Ta sẽ return nguyên response.data để giữ structure này
    return response.data;
  },
  (error) => {
    // Xử lý các loại error
    if (error.response) {
      // Server trả về error response (4xx, 5xx)
      const { status, data } = error.response;

      console.error('❌ API Error Response:', {
        status,
        message: data?.message || 'Unknown error',
        url: error.config?.url,
      });

      // Xử lý các status code đặc biệt
      switch (status) {
        case 401:
          // Unauthorized - Token hết hạn hoặc không hợp lệ
          console.warn('🔒 Unauthorized - Clearing token and redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('tokenExpiry');
          // Redirect về trang login
          window.location.href = '/login';
          break;

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

      // Trả về error với message từ backend
      return Promise.reject({
        status,
        message: data?.message || 'Đã xảy ra lỗi, vui lòng thử lại',
        data: data,
      });
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error('❌ No Response:', error.request);
      return Promise.reject({
        message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
      });
    } else {
      // Lỗi khác (setup request, etc.)
      console.error('❌ Error:', error.message);
      return Promise.reject({
        message: error.message || 'Đã xảy ra lỗi không xác định',
      });
    }
  }
);

export default axiosInstance;
