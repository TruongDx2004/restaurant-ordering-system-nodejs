import { useState, useCallback, useMemo } from 'react';

/**
 * Order item statuses configuration mapping to backend InvoiceItemStatus
 */
export const ORDER_STATUSES = {
  WAITING: {
    key: 'WAITING',
    label: 'Chờ xử lý',
    icon: 'fa-clock',
    color: '#f39c12',
    class: 'pending'
  },
  PREPARING: {
    key: 'PREPARING',
    label: 'Đang làm',
    icon: 'fa-fire',
    color: '#e74c3c',
    class: 'preparing'
  },
  SERVED: {
    key: 'SERVED',
    label: 'Đã phục vụ',
    icon: 'fa-utensils',
    color: '#3498db',
    class: 'served'
  },
  CANCELLED: {
    key: 'CANCELLED',
    label: 'Đã hủy',
    icon: 'fa-ban',
    color: '#95a5a6',
    class: 'cancelled'
  }
};

/**
 * Custom hook để quản lý order status
 * @param {Array} items - Danh sách order items
 * @returns {Object} { statusCounts, getItemStatus, updateItemStatus }
 */
export const useOrderStatus = (items = []) => {
  const [itemStatuses, setItemStatuses] = useState({});

  /**
   * Get status của một item (từ item hoặc local state)
   * @param {Object} item - Order item
   * @returns {string} Status key
   */
  const getItemStatus = useCallback((item) => {
    // Ưu tiên: local state > item.status > default
    if (itemStatuses[item.id]) {
      return itemStatuses[item.id];
    }
    // Backend status (nếu có)
    if (item.status && ORDER_STATUSES[item.status]) {
      return item.status;
    }

    // Default status
    return 'WAITING';
  }, [itemStatuses]);

  /**
   * Update status của một item (local only - cho WebSocket updates)
   * @param {number} itemId - Item ID
   * @param {string} newStatus - New status key
   */
  const updateItemStatus = useCallback((itemId, newStatus) => {
    if (!ORDER_STATUSES[newStatus]) {
      console.warn(`Invalid status: ${newStatus}`);
      return;
    }

    setItemStatuses(prev => ({
      ...prev,
      [itemId]: newStatus
    }));

    console.log(`✅ Updated item ${itemId} status to ${newStatus}`);
  }, []);

  /**
   * Tính toán số lượng items theo từng status
   */
  const statusCounts = useMemo(() => {
    const counts = {
      waiting: 0,
      preparing: 0,
      served: 0,
      cancelled: 0
    };

    items.forEach(item => {
      const status = getItemStatus(item).toLowerCase();
      if (counts.hasOwnProperty(status)) {
        counts[status]++;
      }
    });

    return counts;
  }, [items, getItemStatus]);

  /**
   * Get status config object
   * @param {string} statusKey - Status key
   * @returns {Object} Status config
   */
  const getStatusConfig = useCallback((statusKey) => {
    return ORDER_STATUSES[statusKey] || ORDER_STATUSES.WAITING;
  }, []);

  return {
    statusCounts,
    getItemStatus,
    updateItemStatus,
    getStatusConfig,
    ORDER_STATUSES
  };
};

export default useOrderStatus;
