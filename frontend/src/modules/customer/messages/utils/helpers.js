/**
 * Message utility helpers
 * Synchronized with backend MessageType
 */

/**
 * Format timestamp for message display
 * @param {string} dateString 
 * @returns {string} Formatted time
 */
export const formatMessageTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

/**
 * Get message status label
 * @param {string} type - Matches backend MessageType
 * @returns {string} Human readable label
 */
export const getMessageTypeLabel = (type) => {
  switch (type) {
    case 'CALL_WAITER': return 'Gọi nhân viên';
    case 'REQUEST_BILL': return 'Yêu cầu thanh toán';
    case 'QUICK_ACTION': return 'Hành động nhanh';
    case 'TEXT': return 'Tin nhắn';
    case 'SYSTEM': return 'Hệ thống';
    case 'IMAGE': return 'Hình ảnh';
    default: return type;
  }
};

/**
 * Identify if a message is from the customer
 * @param {Object} message 
 * @returns {boolean}
 */
export const isCustomerMessage = (message) => {
  return message && message.sender === 'CUSTOMER';
};

/**
 * Identify if a message is from staff
 * @param {Object} message 
 * @returns {boolean}
 */
export const isStaffMessage = (message) => {
  return message && message.sender === 'STAFF';
};

/**
 * Identify if a message is from the system
 * @param {Object} message 
 * @returns {boolean}
 */
export const isSystemMessage = (message) => {
  return message && message.sender === 'SYSTEM';
};
