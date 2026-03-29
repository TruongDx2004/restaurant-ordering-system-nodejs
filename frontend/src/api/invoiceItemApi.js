import axiosInstance from './axiosConfig';
import { INVOICE_ITEM_ENDPOINTS } from '../constants/apiEndpoints';

/**
 * Invoice Item API Service
 * For managing individual invoice items and their statuses
 * 
 * Backend Response Structure:
 * {
 *   success: boolean,
 *   data: {
 *     id: number,
 *     invoiceId: number,
 *     dishId: number,
 *     dish: { id, name, price, image, category, status },
 *     quantity: number,
 *     unitPrice: number,
 *     totalPrice: number,
 *     status: 'WAITING' | 'PREPARING' | 'SERVED' | 'CANCELLED',
 *     notes: string,
 *     createdAt: string,
 *     updatedAt: string
 *   },
 *   message: string
 * }
 */
export const invoiceItemApi = {
  /**
   * Get all invoice items
   * @returns {Promise} Response with list of invoice items
   */
  getAll: async () => {
    try {
      const response = await axiosInstance.get(INVOICE_ITEM_ENDPOINTS.GET_ALL);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get invoice item by ID
   * @param {number} id - Invoice item ID
   * @returns {Promise} Response with invoice item detail
   */
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(INVOICE_ITEM_ENDPOINTS.GET_BY_ID(id));
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get items by invoice ID
   * @param {number} invoiceId - Invoice ID
   * @returns {Promise} Response with list of items
   */
  getByInvoice: async (invoiceId) => {
    try {
      const response = await axiosInstance.get(INVOICE_ITEM_ENDPOINTS.GET_BY_INVOICE(invoiceId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new invoice item
   * @param {object} itemData - Invoice item data
   * @returns {Promise} Response with created item
   */
  create: async (itemData) => {
    try {
      const response = await axiosInstance.post(INVOICE_ITEM_ENDPOINTS.CREATE, itemData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update invoice item
   * @param {number} id - Invoice item ID
   * @param {object} itemData - Updated item data
   * @returns {Promise} Response with updated item
   */
  update: async (id, itemData) => {
    try {
      const response = await axiosInstance.put(INVOICE_ITEM_ENDPOINTS.UPDATE(id), itemData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update invoice item status (for employees)
   * @param {number} id - Invoice item ID
   * @param {string} status - New status (WAITING, PREPARING, SERVED, CANCELLED)
   * @returns {Promise} Response with updated item
   */
  updateStatus: async (id, status) => {
    try {
      const response = await axiosInstance.patch(
        INVOICE_ITEM_ENDPOINTS.UPDATE_STATUS(id),
        null,
        {
          params: { status }
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete invoice item
   * @param {number} id - Invoice item ID
   * @returns {Promise} Success response
   */
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(INVOICE_ITEM_ENDPOINTS.DELETE(id));
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default invoiceItemApi;
