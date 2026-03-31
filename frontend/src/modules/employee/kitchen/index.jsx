import React, { useState, useEffect, useCallback } from 'react';
import { invoiceApi, invoiceItemApi } from '../../../api';
import { webSocketService } from '../../../services/webSocketService';
import styles from './index.module.css';

/**
 * Kitchen View for Employees
 * Mapping with backend InvoiceItemStatus: WAITING, PREPARING, SERVED
 */
const KitchenView = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // WebSocket Subscriptions
  useEffect(() => {
    console.log('[Kitchen View] Subscribing to real-time updates...');
    
    // 1. Subscribe to NEW_ORDER
    const unsubscribeNewOrders = webSocketService.subscribe('/topic/orders', (message) => {
      console.log('[Kitchen View] New order notification:', message);
      fetchKitchenItems(); // Reload all items
    });

    // 2. Subscribe to ITEM_STATUS_UPDATE (to catch changes made by other staff)
    const unsubscribeStatusUpdates = webSocketService.subscribe('/topic/orders/status', (message) => {
      console.log('[Kitchen View] Status update received:', message);
      fetchKitchenItems();
    });

    return () => {
      unsubscribeNewOrders();
      unsubscribeStatusUpdates();
    };
  }, []);

  const ITEM_STATUSES = {
    WAITING: { label: 'Chờ xử lý', color: '#f39c12', icon: 'fa-clock', priority: 1 },
    PREPARING: { label: 'Đang làm', color: '#e74c3c', icon: 'fa-fire', priority: 2 },
    SERVED: { label: 'Hoàn thành', color: '#27ae60', icon: 'fa-check-circle', priority: 3 }
  };

  /**
   * Fetch kitchen items (WAITING, PREPARING)
   */
  const fetchKitchenItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await invoiceApi.getAll();

      if (response.success && response.data) {
        // Get active invoices
        const activeInvoices = response.data.filter(
          inv => inv.status !== 'PAID' && inv.status !== 'CANCELLED'
        );

        // Fetch items for all active invoices
        const allItems = [];
        for (const invoice of activeInvoices) {
          try {
            const itemsResponse = await invoiceApi.getInvoiceItems(invoice.id);
            if (itemsResponse.success && itemsResponse.data) {
              const itemsWithInvoice = itemsResponse.data.map(item => ({
                ...item,
                invoiceId: invoice.id,
                tableId: invoice.tableId
              }));
              allItems.push(...itemsWithInvoice);
            }
          } catch (err) {
            console.error(`Error fetching items for invoice ${invoice.id}:`, err);
          }
        }

        // Filter kitchen-relevant statuses: WAITING, PREPARING
        // We also show SERVED briefly or just filter it out if we want only active kitchen tasks
        const kitchenItems = allItems.filter(item => 
          item.status === 'WAITING' || 
          item.status === 'PREPARING'
        );

        // Sort by priority and creation time
        kitchenItems.sort((a, b) => {
          const priorityA = ITEM_STATUSES[a.status]?.priority || 999;
          const priorityB = ITEM_STATUSES[b.status]?.priority || 999;
          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }
          return new Date(a.createdAt) - new Date(b.createdAt);
        });

        setItems(kitchenItems);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKitchenItems();
    const interval = setInterval(fetchKitchenItems, 10000);
    return () => clearInterval(interval);
  }, [fetchKitchenItems]);

  /**
   * Quick status update
   */
  const handleQuickUpdate = async (itemId, newStatus) => {
    try {
      const response = await invoiceItemApi.updateStatus(itemId, newStatus);
      
      if (response.success) {
        // Update local state
        setItems(prevItems => 
          prevItems.map(item => 
            item.id === itemId ? { ...item, status: newStatus } : item
          ).filter(item => 
            item.status === 'WAITING' || 
            item.status === 'PREPARING'
          )
        );
      }
    } catch (err) {
      alert('Lỗi: ' + (err.message || 'Không thể cập nhật'));
    }
  };

  /**
   * Group items by status
   */
  const groupedItems = {
    WAITING: items.filter(item => item.status === 'WAITING'),
    PREPARING: items.filter(item => item.status === 'PREPARING')
  };

  if (loading && items.length === 0) {
    return (
      <div className={styles.loading}>
        <i className="fas fa-spinner fa-spin"></i>
        <p>Đang tải dữ liệu bếp...</p>
      </div>
    );
  }

  return (
    <div className={styles.kitchenView}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>
            <i className="fas fa-utensils"></i>
            Màn hình bếp
          </h1>
          <p>Theo dõi món ăn đang chế biến</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.liveIndicator}>
            <span className={styles.liveDot}></span>
            LIVE
          </div>
          <button className={styles.refreshBtn} onClick={fetchKitchenItems}>
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {/* Kitchen Board - Kanban Style (2 columns for WAITING and PREPARING) */}
      <div className={styles.kitchenBoard}>
        {/* Waiting Column */}
        <div className={styles.statusColumn}>
          <div className={styles.columnHeader} style={{ background: ITEM_STATUSES.WAITING.color }}>
            <i className={`fas ${ITEM_STATUSES.WAITING.icon}`}></i>
            <h2>{ITEM_STATUSES.WAITING.label}</h2>
            <span className={styles.count}>{groupedItems.WAITING.length}</span>
          </div>
          <div className={styles.columnContent}>
            {groupedItems.WAITING.map(item => (
              <div key={item.id} className={styles.kitchenCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.tableLabel}>Bàn #{item.tableId}</span>
                  <span className={styles.quantity}>{item.quantity}x</span>
                </div>
                <div className={styles.dishName}>{item.dish?.name || 'Món ăn'}</div>
                {item.note && (
                  <div className={styles.notes}>
                    <i className="fas fa-sticky-note"></i>
                    {item.note}
                  </div>
                )}
                <div className={styles.cardFooter}>
                  <span className={styles.time}>
                    <i className="fas fa-clock"></i>
                    {new Date(item.createdAt).toLocaleTimeString('vi-VN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  <button 
                    className={styles.startBtn}
                    onClick={() => handleQuickUpdate(item.id, 'PREPARING')}
                  >
                    Bắt đầu
                  </button>
                </div>
              </div>
            ))}
            {groupedItems.WAITING.length === 0 && (
              <div className={styles.emptyColumn}>
                <i className="fas fa-check"></i>
                <p>Không có món chờ</p>
              </div>
            )}
          </div>
        </div>

        {/* Preparing Column */}
        <div className={styles.statusColumn}>
          <div className={styles.columnHeader} style={{ background: ITEM_STATUSES.PREPARING.color }}>
            <i className={`fas ${ITEM_STATUSES.PREPARING.icon}`}></i>
            <h2>{ITEM_STATUSES.PREPARING.label}</h2>
            <span className={styles.count}>{groupedItems.PREPARING.length}</span>
          </div>
          <div className={styles.columnContent}>
            {groupedItems.PREPARING.map(item => (
              <div key={item.id} className={styles.kitchenCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.tableLabel}>Bàn #{item.tableId}</span>
                  <span className={styles.quantity}>{item.quantity}x</span>
                </div>
                <div className={styles.dishName}>{item.dish?.name || 'Món ăn'}</div>
                {item.note && (
                  <div className={styles.notes}>
                    <i className="fas fa-sticky-note"></i>
                    {item.note}
                  </div>
                )}
                <div className={styles.cardFooter}>
                  <span className={styles.time}>
                    <i className="fas fa-clock"></i>
                    {new Date(item.createdAt).toLocaleTimeString('vi-VN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  <button 
                    className={styles.doneBtn}
                    onClick={() => handleQuickUpdate(item.id, 'SERVED')}
                  >
                    Hoàn thành
                  </button>
                </div>
              </div>
            ))}
            {groupedItems.PREPARING.length === 0 && (
              <div className={styles.emptyColumn}>
                <i className="fas fa-check"></i>
                <p>Không có món đang làm</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenView;
