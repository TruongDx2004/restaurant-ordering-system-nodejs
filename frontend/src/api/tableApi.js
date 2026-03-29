import axiosInstance from './axiosConfig';

/**
 * Table Management API
 * For admin to manage restaurant tables
 */
const tableApi = {
  /**
   * Create a new table
   * @param {Object} tableData - Table data
   * @returns {Promise} Response with created table
   */
  createTable: async (tableData) => {
    try {
      const response = await axiosInstance.post('/tables', tableData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get table by ID
   * @param {number} id - Table ID
   * @returns {Promise} Response with table data
   */
  getTableById: async (id) => {
    try {
      const response = await axiosInstance.get(`/tables/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all tables
   * @returns {Promise} Response with list of tables
   */
  getAllTables: async () => {
    try {
      const response = await axiosInstance.get('/tables');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update table
   * @param {number} id - Table ID
   * @param {Object} tableData - Updated table data
   * @returns {Promise} Response with updated table
   */
  updateTable: async (id, tableData) => {
    try {
      const response = await axiosInstance.put(`/tables/${id}`, tableData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete table
   * @param {number} id - Table ID
   * @returns {Promise} Success response
   */
  deleteTable: async (id) => {
    try {
      const response = await axiosInstance.delete(`/tables/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get table by table number
   * @param {number} tableNumber - Table number
   * @returns {Promise} Response with table data
   */
  getTableByNumber: async (tableNumber) => {
    try {
      const response = await axiosInstance.get(`/tables/number/${tableNumber}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get tables by status
   * @param {string} status - Table status (AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE)
   * @returns {Promise} Response with list of tables
   */
  getTablesByStatus: async (status) => {
    try {
      const response = await axiosInstance.get(`/tables/status/${status}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get tables by area
   * @param {string} area - Table area
   * @returns {Promise} Response with list of tables
   */
  getTablesByArea: async (area) => {
    try {
      const response = await axiosInstance.get(`/tables/area/${area}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get active tables (with active invoices)
   * @returns {Promise} Response with list of active tables
   */
  getActiveTables: async () => {
    try {
      const response = await axiosInstance.get('/tables/active');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update table status
   * @param {number} id - Table ID
   * @param {string} status - New status
   * @returns {Promise} Response with updated table
   */
  updateTableStatus: async (id, status) => {
    try {
      const response = await axiosInstance.patch(`/tables/${id}/status`, null, {
        params: { status }
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default tableApi;
