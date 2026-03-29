import { useState, useEffect, useCallback } from 'react';
import { invoiceApi } from '../../../../api';
import storage from '../../../../utils/storage';

/**
 * Custom hook để quản lý orders (invoice và items)
 * @param {string|null} tableNumber - Số bàn
 * @param {number} autoRefreshInterval - Thời gian tự động refresh (ms), 0 = tắt
 * @returns {Object} { invoice, items, loading, error, refetch, clearCache }
 */
export const useOrders = (tableNumber = null, autoRefreshInterval = 30000) => {
  const [invoice, setInvoice] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch order data (invoice + items)
   */
  const fetchOrders = useCallback(async () => {
    if (!tableNumber) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`📦 Fetching orders for table number: ${tableNumber}`);

      // Get active invoice for table by table number
      const response = await invoiceApi.getActiveInvoiceByTableNumber(tableNumber);

      if (response.success && response.data) {
        const invoiceData = response.data;
        console.log(`✅ Active invoice found:`, invoiceData);

        setInvoice(invoiceData);

        // Extract items from invoice response or fetch separately
        let itemsData = [];

        if (invoiceData.items && Array.isArray(invoiceData.items)) {
          // Items are included in invoice response
          itemsData = invoiceData.items;
        } else if (invoiceData.id) {
          // Fetch items separately
          const itemsResponse = await invoiceApi.getInvoiceItems(invoiceData.id);
          if (itemsResponse.success && itemsResponse.data) {
            itemsData = Array.isArray(itemsResponse.data) 
              ? itemsResponse.data 
              : itemsResponse.data.data || [];
          }
        }

        setItems(itemsData);

        // Cache data
        storage.setItem('currentInvoice', invoiceData);
        storage.setItem('currentInvoiceItems', itemsData);

        console.log(`✅ Loaded ${itemsData.length} items`);
      } else {
        // No active invoice
        console.log(`ℹ️ No active invoice for table ${tableNumber}`);
        setInvoice(null);
        setItems([]);
        storage.removeItem('currentInvoice');
        storage.removeItem('currentInvoiceItems');
      }
    } catch (err) {
      const errorMessage = err.message || 'Không thể tải đơn hàng';
      console.error('❌ Error fetching orders:', err);
      setError(errorMessage);

      // Try to load from cache
      const cachedInvoice = storage.getItem('currentInvoice');
      const cachedItems = storage.getItem('currentInvoiceItems');

      if (cachedInvoice && cachedItems) {
        console.log('📦 Loading from cache...');
        setInvoice(cachedInvoice);
        setItems(cachedItems);
      }
    } finally {
      setLoading(false);
    }
  }, [tableNumber]);

  /**
   * Clear cached data
   */
  const clearCache = useCallback(() => {
    storage.removeItem('currentInvoice');
    storage.removeItem('currentInvoiceItems');
    setInvoice(null);
    setItems([]);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefreshInterval > 0 && tableNumber) {
      const intervalId = setInterval(() => {
        console.log('⏰ Auto-refreshing orders...');
        fetchOrders();
      }, autoRefreshInterval);

      return () => clearInterval(intervalId);
    }
  }, [autoRefreshInterval, tableNumber, fetchOrders]);

  return {
    invoice,
    items,
    loading,
    error,
    refetch: fetchOrders,
    clearCache,
  };
};

export default useOrders;
