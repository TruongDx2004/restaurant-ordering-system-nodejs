/**
 * Helper Functions cho Customer Home Module
 */

/**
 * Format giá tiền theo định dạng VND
 * @param {number} price - Giá tiền (số)
 * @returns {string} Giá đã format (VD: "50.000 ₫")
 */
export const formatPrice = (price) => {
  if (!price && price !== 0) return '0 ₫';
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

/**
 * Format giá tiền đơn giản (không ký hiệu ₫)
 * @param {number} price - Giá tiền
 * @returns {string} Giá đã format (VD: "50.000")
 */
export const formatPriceSimple = (price) => {
  if (!price && price !== 0) return '0';
  
  return new Intl.NumberFormat('vi-VN').format(price);
};

/**
 * Lấy text hiển thị cho dish status
 * @param {string} status - Dish status ('AVAILABLE' hoặc 'SOLD_OUT')
 * @returns {string} Text hiển thị
 */
export const getDishStatusText = (status) => {
  const statusMap = {
    AVAILABLE: 'Còn hàng',
    SOLD_OUT: 'Hết hàng',
  };
  
  return statusMap[status] || 'Không xác định';
};

/**
 * Lấy CSS class cho dish status
 * @param {string} status - Dish status
 * @returns {string} CSS class name
 */
export const getDishStatusClass = (status) => {
  const classMap = {
    AVAILABLE: 'available',
    SOLD_OUT: 'sold-out',
  };
  
  return classMap[status] || '';
};

/**
 * Check xem món ăn có available không
 * @param {object} dish - Dish object
 * @returns {boolean} true nếu available
 */
export const isDishAvailable = (dish) => {
  return dish && dish.status === 'AVAILABLE';
};

/**
 * Lấy full image URL
 * @param {string} imagePath - Image path từ backend
 * @returns {string} Full image URL
 */
export const getImageUrl = (imagePath) => {
  // Nếu không có image, return placeholder
  if (!imagePath) {
    return '/placeholder-dish.jpg';
  }
  
  // Nếu đã là full URL (http/https), return nguyên
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Nếu là relative path, thêm base URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080';
  
  // Đảm bảo imagePath bắt đầu bằng /
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${baseUrl}${path}`;
};

/**
 * Truncate text với ellipsis
 * @param {string} text - Text cần truncate
 * @param {number} maxLength - Độ dài tối đa
 * @returns {string} Text đã truncate
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

/**
 * Debounce function - delay execution
 * @param {Function} func - Function cần debounce
 * @param {number} delay - Delay time (ms)
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

/**
 * Group dishes by category
 * @param {Array} dishes - Array of dishes
 * @returns {Object} Dishes grouped by category
 */
export const groupDishesByCategory = (dishes) => {
  if (!dishes || !Array.isArray(dishes)) return {};
  
  return dishes.reduce((acc, dish) => {
    const categoryName = dish.category?.name || 'Khác';
    
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    
    acc[categoryName].push(dish);
    return acc;
  }, {});
};

/**
 * Filter dishes by search query
 * @param {Array} dishes - Array of dishes
 * @param {string} query - Search query
 * @returns {Array} Filtered dishes
 */
export const filterDishesByQuery = (dishes, query) => {
  if (!dishes || !Array.isArray(dishes)) return [];
  if (!query || !query.trim()) return dishes;
  
  const searchTerm = query.toLowerCase().trim();
  
  return dishes.filter(dish => 
    dish.name?.toLowerCase().includes(searchTerm) ||
    dish.category?.name?.toLowerCase().includes(searchTerm)
  );
};

/**
 * Validate table number
 * @param {string|number} tableNumber - Table number
 * @returns {boolean} true nếu valid
 */
export const isValidTableNumber = (tableNumber) => {
  if (!tableNumber) return false;
  
  const num = parseInt(tableNumber);
  return !isNaN(num) && num > 0;
};

/**
 * Format date/time
 * @param {string|Date} date - Date object hoặc string
 * @returns {string} Formatted date
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * Calculate total price from cart items
 * @param {Array} items - Cart items
 * @returns {number} Total price
 */
export const calculateTotalPrice = (items) => {
  if (!items || !Array.isArray(items)) return 0;
  
  return items.reduce((total, item) => {
    const price = item.price || 0;
    const quantity = item.quantity || 0;
    return total + (price * quantity);
  }, 0);
};

/**
 * Get unique categories from dishes
 * @param {Array} dishes - Array of dishes
 * @returns {Array} Array of unique categories
 */
export const getUniqueCategoriesFromDishes = (dishes) => {
  if (!dishes || !Array.isArray(dishes)) return [];
  
  const categoriesMap = new Map();
  
  dishes.forEach(dish => {
    if (dish.category && dish.category.id) {
      categoriesMap.set(dish.category.id, dish.category);
    }
  });
  
  return Array.from(categoriesMap.values());
};

export default {
  formatPrice,
  formatPriceSimple,
  getDishStatusText,
  getDishStatusClass,
  isDishAvailable,
  getImageUrl,
  truncateText,
  debounce,
  groupDishesByCategory,
  filterDishesByQuery,
  isValidTableNumber,
  formatDateTime,
  calculateTotalPrice,
  getUniqueCategoriesFromDishes,
};
