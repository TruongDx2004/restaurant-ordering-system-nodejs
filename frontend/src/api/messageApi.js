import axios from './axiosConfig';

/**
 * API service for managing messages
 * Interface for backend MessageController
 */
export const messageApi = {
  /**
   * Create a new message
   * @param {Object} messageData - { tableId, invoiceId, content, messageType, sender }
   * @returns {Promise<Object>} Created message response
   */
  create: async (messageData) => {
    try {
      const response = await axios.post('/messages', messageData);
      return response;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  },

  /**
   * Get messages by invoice ID
   * @param {number} invoiceId
   * @returns {Promise<Object>} List of messages
   */
  getByInvoice: async (invoiceId) => {
    try {
      const response = await axios.get(`/messages/invoice/${invoiceId}`);
      return response;
    } catch (error) {
      console.error(`Error getting messages for invoice ${invoiceId}:`, error);
      throw error;
    }
  },

  /**
   * Get messages by table ID
   * @param {number} tableId
   * @returns {Promise<Object>} List of messages
   */
  getByTable: async (tableId) => {
    try {
      const response = await axios.get(`/messages/table/${tableId}`);
      return response;
    } catch (error) {
      console.error(`Error getting messages for table ${tableId}:`, error);
      throw error;
    }
  },

  /**
   * Get messages by table ordered by date
   * @param {number} tableId
   * @returns {Promise<Object>} Ordered list of messages
   */
  getByTableOrdered: async (tableId) => {
    try {
      const response = await axios.get(`/messages/table/${tableId}/ordered`);
      return response;
    } catch (error) {
      console.error(`Error getting ordered messages for table ${tableId}:`, error);
      throw error;
    }
  },

  /**
   * Send a specific type of message to table
   * @param {number} tableId
   * @param {string} content
   * @param {string} messageType - 'NORMAL', 'CALL_WAITER', 'REQUEST_BILL'
   * @param {string} sender - 'CUSTOMER', 'STAFF', 'SYSTEM'
   */
  sendToTable: async (tableId, content, messageType, sender) => {
    try {
      const params = new URLSearchParams({
        tableId,
        content,
        messageType,
        sender
      });
      const response = await axios.post(`/messages/send-to-table?${params.toString()}`);
      return response;
    } catch (error) {
      console.error(`Error sending message to table ${tableId}:`, error);
      throw error;
    }
  }
};

export default messageApi;
