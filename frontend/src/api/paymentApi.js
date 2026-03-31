import axiosInstance from './axiosConfig';

/**
 * Payment API
 * Các endpoint liên quan đến thanh toán
 */
const paymentApi = {
  /**
   * Tạo payment mới
   * @param {Object} paymentData - Dữ liệu payment
   * @returns {Promise} Response với payment data
   */
  create: async (paymentData) => {
    try {
      const response = await axiosInstance.post('/payments', paymentData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xử lý thanh toán cho hóa đơn
   * @param {number} invoiceId - Invoice ID
   * @param {string} paymentMethod - Payment method (CASH, BANK_TRANSFER, CREDIT_CARD, E_WALLET)
   * @param {number} amount - Số tiền thanh toán
   * @returns {Promise} Response với payment data
   */
  processPayment: async (invoiceId, paymentMethod, amount) => {
    try {
      const response = await axiosInstance.post('/payments/process', null, {
        params: {
          invoiceId,
          method: paymentMethod,
          amount
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy payment theo invoice ID
   * @param {number} invoiceId - Invoice ID
   * @returns {Promise} Response với payment data
   */
  getByInvoice: async (invoiceId) => {
    try {
      const response = await axiosInstance.get(`/payments/invoice/${invoiceId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Confirm payment
   * @param {number} paymentId - Payment ID
   * @param {string} transactionCode - Mã giao dịch
   * @returns {Promise} Response với payment data
   */
  confirmPayment: async (paymentId, transactionCode) => {
    try {
      const response = await axiosInstance.patch(`/payments/${paymentId}/confirm`, null, {
        params: { transactionCode }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Request cash payment (notifies staff)
   * @param {Object} data - { invoiceId, tableId, amount }
   */
  requestCashPayment: async (data) => {
    try {
      const response = await axiosInstance.post('/payments/request-cash', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Confirm payment using invoice ID
   * @param {number} invoiceId - Invoice ID
   * @param {string} transactionCode - Transaction code (optional)
   * @returns {Promise} Response with payment data
   */
  confirmByInvoice: async (invoiceId, transactionCode) => {
    try {
      const response = await axiosInstance.patch('/payments/confirm-by-invoice', {
        invoiceId,
        transactionCode
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cancel payment
   * @param {number} paymentId - Payment ID
   * @returns {Promise} Response với payment data
   */
  cancelPayment: async (paymentId) => {
    try {
      const response = await axiosInstance.patch(`/payments/${paymentId}/cancel`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Tạo thanh toán qua MoMo
   * @param {Object} paymentData - { invoiceId, amount, orderInfo }
   * @returns {Promise} Response chứa payUrl từ MoMo
   */
  createMoMoPayment: async (paymentData) => {
    try {
      const response = await axiosInstance.post('/payments/momo', paymentData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật status của payment
   * @param {number} paymentId - Payment ID
   * @param {string} status - Payment status
   * @returns {Promise} Response với payment data
   */
  updateStatus: async (paymentId, status) => {
    try {
      const response = await axiosInstance.patch(`/payments/${paymentId}/status`, null, {
        params: { status }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default paymentApi;
