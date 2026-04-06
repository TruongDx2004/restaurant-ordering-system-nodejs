import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { invoiceApi, invoiceItemApi, tableApi } from '../../../api';
import { useModal } from '../../../contexts/ModalContext';
import { webSocketService } from '../../../services/webSocketService';
import styles from './index.module.css';

/**
 * Order Processing Page for Employees
 * Mapping with backend InvoiceItemStatus: WAITING, PREPARING, SERVED, CANCELLED
 */
const OrderProcessing = () => {
  const { showAlert } = useModal();
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('WAITING'); // WAITING, PREPARING, SERVED, CANCELLED
  const [searchTable, setSearchTable] = useState('');

  // WebSocket Subscriptions
  useEffect(() => {
    console.log('[Employee Orders] Subscribing to real-time updates...');
    
    const unsubscribeNewOrders = webSocketService.subscribe('/topic/orders', (message) => {
      console.log('[Employee Orders] New order notification:', message);
      fetchData(); 
    });

    const unsubscribeStatusUpdates = webSocketService.subscribe('/topic/orders/status', (message) => {
      console.log('[Employee Orders] Status update received:', message);
      fetchData();
    });

    return () => {
      unsubscribeNewOrders();
      unsubscribeStatusUpdates();
    };
  }, []);


  const TABS = [
    { id: 'WAITING', label: 'Đang chờ', icon: 'fa-clock', color: '#f39c12' },
    { id: 'PREPARING', label: 'Đang làm', icon: 'fa-fire', color: '#e74c3c' },
    { id: 'SERVED', label: 'Đã giao', icon: 'fa-check-double', color: '#27ae60' },
    { id: 'CANCELLED', label: 'Đã hủy', icon: 'fa-ban', color: '#95a5a6' }
  ];

  // Map item statuses to tabs
  const statusToTab = {
    'WAITING': 'WAITING',
    'PREPARING': 'PREPARING',
    'SERVED': 'SERVED',
    'CANCELLED': 'CANCELLED'
  };

  /**
   * Fetch all active orders and tables
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [invoicesResponse, tablesResponse] = await Promise.all([
        invoiceApi.getAll(),
        tableApi.getAllTables()
      ]);

      if (invoicesResponse.success && invoicesResponse.data) {
        // Filter active invoices
        const activeInvoices = invoicesResponse.data.filter(
          inv => inv.status !== 'PAID' && inv.status !== 'CANCELLED'
        );

        // Fetch items for each invoice
        const invoicesWithItems = await Promise.all(
          activeInvoices.map(async (invoice) => {
            try {
              const itemsResponse = await invoiceApi.getInvoiceItems(invoice.id);
              return {
                ...invoice,
                items: itemsResponse.success ? itemsResponse.data : []
              };
            } catch (err) {
              return { ...invoice, items: [] };
            }
          })
        );

        setOrders(invoicesWithItems);
      }
      if (tablesResponse.success && tablesResponse.data) {
        setTables(tablesResponse.data);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  /**
   * Update item status
   */
  const handleUpdateStatus = async (itemId, newStatus) => {
    try {
      const response = await invoiceItemApi.updateStatus(itemId, newStatus);
      if (response.success) {
        setOrders(prevOrders => 
          prevOrders.map(order => ({
            ...order,
            items: order.items.map(item => 
              item.id === itemId ? { ...item, status: newStatus } : item
            )
          }))
        );
      }
    } catch (err) {
      showAlert('Lỗi: ' + (err.message || 'Không thể cập nhật'), 'Lỗi', 'error');
    }
  };

  const getTableName = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    return table ? `Bàn ${table.tableNumber}` : `Bàn #${tableId}`;
  };

  /**
   * Filtered data based on active tab and search
   */
  const filteredData = useMemo(() => {
    return orders.map(order => {
      // Filter items that belong to the current tab
      const itemsInTab = order.items.filter(item => 
        statusToTab[item.status || 'WAITING'] === activeTab
      );
      console.log('Order', order, 'Items in tab', activeTab, itemsInTab.length);
      // Check search match
      const tableName = getTableName(order.table.id);
      const matchesSearch = searchTable === '' || 
        tableName.toLowerCase().includes(searchTable.toLowerCase());

      if (itemsInTab.length > 0 && matchesSearch) {
        return { ...order, items: itemsInTab };
      }
      return null;
    }).filter(Boolean);
  }, [orders, activeTab, searchTable, tables]);

  // Statistics for badges
  const stats = useMemo(() => {
    const counts = { WAITING: 0, PREPARING: 0, SERVED: 0, CANCELLED: 0 };
    orders.forEach(order => {
      order.items.forEach(item => {
        const tabId = statusToTab[item.status || 'WAITING'];
        if (counts[tabId] !== undefined) counts[tabId]++;
      });
    });
    return counts;
  }, [orders]);

  if (loading && orders.length === 0) {
    return (
      <div className={styles.loading}>
        <i className="fas fa-spinner fa-spin"></i>
        <p>Đang tải đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className={styles.orderProcessing}>
      {/* Header & Search */}
      <div className={styles.header}>
        <div className={styles.searchBox}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm theo số bàn..."
            value={searchTable}
            onChange={(e) => setSearchTable(e.target.value)}
          />
        </div>
        <button className={styles.refreshBtn} onClick={fetchData}>
          <i className="fas fa-sync-alt"></i>
        </button>
      </div>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ '--accent-color': tab.color }}
          >
            <i className={`fas ${tab.icon}`}></i>
            <span>{tab.label}</span>
            {stats[tab.id] > 0 && (
              <span className={styles.badge}>{stats[tab.id]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={styles.contentArea}>
        {error && <div className={styles.errorMsg}>{error}</div>}

        {filteredData.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fas fa-clipboard-check"></i>
            <p>Không có đơn hàng nào trong mục này</p>
          </div>
        ) : (
          <div className={styles.ordersGrid}>
            {filteredData.map(order => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderCardHeader}>
                  <h3>{getTableName(order.table.id)}</h3>
                  <span className={styles.timeLabel}>
                    {new Date(order.createdAt).toLocaleTimeString('vi-VN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>

                <div className={styles.itemList}>
                  {order.items.map(item => (
                    <div key={item.id} className={styles.itemRow}>
                      <div className={styles.itemMain}>
                        <div className={styles.itemName}>
                          <strong>{item.quantity}x</strong> {item.dish?.name || 'Món ăn'}
                        </div>
                        {item.note && (
                          <div className={styles.itemNote}>
                            <i className="fas fa-comment-dots"></i> {item.note}
                          </div>
                        )}
                      </div>

                      <div className={styles.itemActions}>
                        {activeTab === 'WAITING' && (
                          <>
                            <button 
                              className={styles.acceptBtn}
                              onClick={() => handleUpdateStatus(item.id, 'PREPARING')}
                            >
                              Nhận
                            </button>
                            <button 
                              className={styles.cancelIconBtn}
                              onClick={() => {
                                if(window.confirm('Hủy món này?')) handleUpdateStatus(item.id, 'CANCELLED')
                              }}
                              title="Hủy món"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </>
                        )}

                        {activeTab === 'PREPARING' && (
                          <>
                            <button 
                              className={styles.deliverBtn}
                              onClick={() => handleUpdateStatus(item.id, 'SERVED')}
                            >
                              Giao
                            </button>
                            <button 
                              className={styles.cancelIconBtn}
                              onClick={() => {
                                if(window.confirm('Hủy món này?')) handleUpdateStatus(item.id, 'CANCELLED')
                              }}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </>
                        )}

                        {(activeTab === 'SERVED' || activeTab === 'CANCELLED') && (
                          <span className={styles.statusLabel}>
                            {item.status === 'SERVED' ? 'Đã giao' : 'Đã hủy'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderProcessing;
