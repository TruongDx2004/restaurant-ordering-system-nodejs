import axiosInstance from './axiosConfig';

/**
 * Invoice API Service
 * Quản lý các API calls liên quan đến hóa đơn/đơn hàng
 */

export const invoiceApi = {
  /**
   * Tạo invoice mới (đặt món) - Simple create
   * @param {object} invoiceData - Invoice data
   * @returns {Promise} Response với invoice đã tạo
   */
  create: async (invoiceData) => {
    try {
      const response = await axiosInstance.post('/invoices', invoiceData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Tạo invoice với items (đặt món từ giỏ hàng)
   * @param {object} orderData - { tableId, items: [{ dishId, quantity, notes }] }
   * @returns {Promise} Response với invoice đã tạo kèm items
   */
  createWithItems: async (orderData) => {
    try {
      const response = await axiosInstance.post('/invoices/create-with-items', orderData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy tất cả invoices
   * @returns {Promise} Response với danh sách invoices
   */
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/invoices');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy invoice theo ID
   * @param {number} id - Invoice ID
   * @returns {Promise} Response với invoice detail
   */
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/invoices/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy invoices theo table
   * @param {number} tableId - Table ID
   * @returns {Promise} Response với danh sách invoices của bàn
   */
  getByTable: async (tableId) => {
    try {
      const response = await axiosInstance.get(`/invoices/table/${tableId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật invoice
   * @param {number} id - Invoice ID
   * @param {object} invoiceData - Invoice data cần update
   * @returns {Promise} Response với invoice đã cập nhật
   */
  update: async (id, invoiceData) => {
    try {
      const response = await axiosInstance.put(`/invoices/${id}`, invoiceData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật status của invoice
   * @param {number} id - Invoice ID
   * @param {string} status - New status
   * @returns {Promise} Response với invoice đã cập nhật
   */
  updateStatus: async (id, status) => {
    try {
      const response = await axiosInstance.patch(`/invoices/${id}/status`, null, {
        params: { status }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xóa invoice
   * @param {number} id - Invoice ID
   * @returns {Promise} Response xác nhận xóa
   */
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/invoices/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy active invoice của bàn (đang chờ thanh toán)
   * @param {number} tableId - Table ID
   * @returns {Promise} Response với active invoice và items
   */
  getActiveInvoice: async (tableId) => {
    try {
      const response = await axiosInstance.get(`/invoices/table/${tableId}/active`);
      return response;
    } catch (error) {
      // Return null nếu không có active invoice
      if (error.response?.status === 404) {
        return { success: false, data: null };
      }
      throw error;
    }
  },

  /**
   * Lấy invoice items theo invoice ID
   * @param {number} invoiceId - Invoice ID
   * @returns {Promise} Response với danh sách items
   */
  getInvoiceItems: async (invoiceId) => {
    try {
      const response = await axiosInstance.get(`/invoice-items/invoice/${invoiceId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy active invoice của bàn theo số bàn (table number)
   * @param {string|number} tableNumber - Số bàn
   * @returns {Promise} Response với active invoice và items
   */
  getActiveInvoiceByTableNumber: async (tableNumber) => {
    try {
      // Endpoint mới: /invoices/table-number/{tableNumber}/active
      const response = await axiosInstance.get(`/invoices/table-number/${tableNumber}/active`);
      return response;
    } catch (error) {
      // Return null nếu không có active invoice
      if (error.response?.status === 404) {
        return { success: false, data: null };
      }
      throw error;
    }
  },

  // Aliases for compatibility
  updateInvoiceStatus: async (id, status) => invoiceApi.updateStatus(id, status),
};

export default invoiceApi;
