import React, { useState, useEffect } from 'react';
import { useOrders, useOrderStatus } from './hooks';
import { OrderItem, StatusOverview } from './components';
import { DesktopWarning } from '../../../components/shared';
import storage from '../../../utils/storage';
import { webSocketService } from '../../../services/webSocketService';
import styles from './index.module.css';

/**
 * Orders Component
 * Trang hiển thị đơn hàng với trạng thái từng món
 */
const Orders = () => {
  // State
  const [tableNumber, setTableNumber] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('WAITING');

  // Fetch orders data
  const { invoice, items, loading, error, refetch } = useOrders(tableNumber, 60000); // Tăng interval polling lên vì đã có WebSocket

  // WebSocket Subscription
  useEffect(() => {
    if (!invoice?.id) return;

    console.log(`[Orders] Subscribing to updates for invoice ${invoice.id}`);
    
    // Subscribe to status updates
    const unsubscribeStatus = webSocketService.subscribe('/topic/orders/status', (message) => {
      console.log('[Status Orders] Received WebSocket update:', message);
      
      // Nếu message liên quan đến invoice hiện tại của khách hàng
      if (message.orderId === invoice.id) {
        showToast('Trạng thái món ăn đã được cập nhật!', 'info');
        refetch(); // Reload data
      }
    });

    // Subscribe to new orders
    const unsubscribeOrders = webSocketService.subscribe('/topic/orders', (message) => {
      console.log('[New Orders] Received WebSocket new:', message);

      //Nếu message liên quan đến invoice hiện tại của khách hàng
      if(message.orderId == invoice.id){
        showToast('Đơn hàng mới đã được cập nhật!', 'info');
        refetch(); // Reload data
      }
    })

    return () => {
      unsubscribeStatus();
      unsubscribeOrders();
    }
  }, [invoice?.id, refetch]);

  // Get table number from storage
  useEffect(() => {
    // Ưu tiên lấy từ localStorage
    const storedTableNumber = storage.getTableNumber();
    if (storedTableNumber) {
      setTableNumber(storedTableNumber);
    } else {
      // Fallback: default table 1
      setTableNumber('1');
      storage.setTableNumber('1');
    }
  }, []);

  // Manage item statuses
  const { 
    statusCounts, 
    getItemStatus, 
    getStatusConfig, 
    ORDER_STATUSES 
  } = useOrderStatus(items);

  // Filter items based on activeTab
  const filteredItems = items.filter(item => {
    const status = getItemStatus(item);
    return status === activeTab;
  });

  /**
   * Show toast notification
   */
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /**
   * Handle refresh
   */
  const handleRefresh = async () => {
    showToast('Đang làm mới...', 'info');
    await refetch();
    showToast('Đã cập nhật!', 'success');
  };

  /**
   * Calculate totals
   */
  const calculateTotals = () => {
    const subtotal = items.filter(item => item.status != 'CANCELLED').reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const serviceFee = subtotal * 0.1; // 10% service fee
    const total = invoice?.totalAmount || (subtotal + serviceFee);

    return { subtotal, serviceFee, total };
  };

  const { subtotal, serviceFee, total } = calculateTotals();

  /**
   * Format currency
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Loading state
  if (loading && !invoice) {
    return (
      <div className={styles.ordersContainer}>
        <div className={styles.loading}>
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !invoice) {
    return (
      <div className={styles.ordersContainer}>
        <div className={styles.error}>
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Có lỗi xảy ra</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className={styles.retryBtn}>
            <i className="fas fa-redo"></i> Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Empty state - no invoice
  if (!invoice || !items || items.length === 0) {
    return (
      <div className={styles.ordersContainer}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <i className="fas fa-receipt"></i>
          </div>
          <h3>Bạn chưa có đơn hàng nào</h3>
          <p>Hãy thêm món ăn từ trang menu</p>
          <a href="/customer/home" className={styles.browseMenuBtn}>
            Xem Menu
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <DesktopWarning />
      <div className={styles.ordersContainer}>
      {/* Header */}
      <div className={styles.ordersHeader}>
        <h1>Đơn Hàng Của Bạn</h1>
        <div className={styles.ordersInfo}>
          {invoice && (
            <span className={styles.invoiceBadge}>
              Hóa đơn #{invoice.id}
            </span>
          )}
          <button 
            onClick={handleRefresh} 
            className={styles.refreshBtn}
            disabled={loading}
          >
            <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <StatusOverview 
        statusCounts={statusCounts}
        ORDER_STATUSES={ORDER_STATUSES}
        activeStatus={activeTab}
        onStatusChange={setActiveTab}
      />

      {/* Order Items List */}
      <div className={styles.orderItems}>
        {filteredItems.length > 0 ? (
          filteredItems.map(item => {
            const status = getItemStatus(item);
            const statusConfig = getStatusConfig(status);
            
            return (
              <OrderItem
                key={item.id}
                item={item}
                statusConfig={statusConfig}
              />
            );
          })
        ) : (
          <div className={styles.emptyStatus}>
            <p>Không có món nào trong trạng thái này</p>
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className={styles.orderSummary}>
        <div className={styles.summaryRow}>
          <span>Tạm tính:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className={`${styles.summaryRow} ${styles.total}`}>
          <span>Tổng cộng:</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <div className={styles.summaryInfo}>
          <p>
            <i className="fas fa-info-circle"></i>
            Trạng thái sẽ được cập nhật tự động
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`${styles.toast} ${styles[`toast${toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}`]}`}>
          {toast.message}
        </div>
      )}

      {/* Floating Action Button - Add More Items
      <a href="/customer/home" className={styles.addMoreBtn}>
        <i className="fas fa-plus"></i>
      </a> */}
    </div>
    </>
  );
};

export default Orders;
