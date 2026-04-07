import axios from './axiosConfig';

/**
 * API service for managing messages
 * Tối giản và đồng nhất giữa Customer và Staff
 */
export const messageApi = {
  /**
   * Tạo tin nhắn mới (Dùng chung)
   * @param {Object} messageData - { tableId, invoiceId, content, messageType, sender }
   */
  create: async (messageData) => {
    try {
      const response = await axios.post('/messages', messageData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy danh sách hội thoại cho nhân viên (Inbox) - Có lastMessage
   */
  getConversations: async () => {
    try {
      const response = await axios.get('/messages/conversations');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy lịch sử tin nhắn của một bàn
   * @param {number} tableId
   */
  getByTable: async (tableId) => {
    try {
      const response = await axios.get(`/messages/table/${tableId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy lịch sử tin nhắn của một hóa đơn
   * @param {number} invoiceId
   */
  getByInvoice: async (invoiceId) => {
    try {
      const response = await axios.get(`/messages/invoice/${invoiceId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  /**
   * Xóa tin nhắn
   */
  delete: async (id) => {
    try {
      const response = await axios.delete(`/messages/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default messageApi;
