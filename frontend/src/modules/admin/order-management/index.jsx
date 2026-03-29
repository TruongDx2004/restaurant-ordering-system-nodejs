import React, { useState, useEffect } from 'react';
import { invoiceApi } from '../../../api';
import styles from './index.module.css';

/**
 * Order Management Page
 * Manages customer orders/invoices
 */
const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Load orders
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await invoiceApi.getAll();
      
      if (response.success) {
        // Sort by date descending
        const sortedOrders = response.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id?.toString().includes(searchTerm) ||
                         order.table?.tableNumber?.toString().includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Handle status change
  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await invoiceApi.updateInvoiceStatus(id, newStatus);
      if (response.success) {
        await loadOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'orange';
      case 'CONFIRMED': return 'blue';
      case 'PREPARING': return 'purple';
      case 'READY': return 'teal';
      case 'PAID': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ xác nhận';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'PREPARING': return 'Đang chuẩn bị';
      case 'READY': return 'Sẵn sàng';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <i className="fas fa-spinner fa-spin"></i>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <i className="fas fa-exclamation-triangle"></i>
        <p>{error}</p>
        <button onClick={loadOrders}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className={styles.orderManagement}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Quản lý đơn hàng</h1>
          <p>Theo dõi và xử lý đơn hàng</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm đơn hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filters}>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="PREPARING">Đang chuẩn bị</option>
            <option value="READY">Sẵn sàng</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>

        <button className={styles.refreshBtn} onClick={loadOrders}>
          <i className="fas fa-sync-alt"></i>
          Làm mới
        </button>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Tổng đơn:</span>
          <span className={styles.statValue}>{orders.length}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Chờ xác nhận:</span>
          <span className={styles.statValue}>
            {orders.filter(o => o.status === 'PENDING').length}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Đang xử lý:</span>
          <span className={styles.statValue}>
            {orders.filter(o => ['CONFIRMED', 'PREPARING'].includes(o.status)).length}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Hoàn thành:</span>
          <span className={styles.statValue}>
            {orders.filter(o => o.status === 'COMPLETED').length}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Bàn</th>
              <th>Thời gian</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className={styles.emptyState}>
                  <i className="fas fa-inbox"></i>
                  <p>Không tìm thấy đơn hàng</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id}>
                  <td>
                    <div className={styles.orderId}>#{order.id}</div>
                  </td>
                  <td>
                    <div className={styles.tableInfo}>
                      <i className="fas fa-table"></i>
                      Bàn {order.table?.tableNumber || 'N/A'}
                    </div>
                  </td>
                  <td>
                    {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'N/A'}
                  </td>
                  <td className={styles.price}>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(order.totalAmount || 0)}
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[getStatusColor(order.status)]}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.viewBtn}
                        onClick={() => setSelectedOrder(order)}
                        title="Xem chi tiết"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Chi tiết đơn hàng #{selectedOrder.id}</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedOrder(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.orderInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Bàn:</span>
                  <span className={styles.value}>Bàn {selectedOrder.table?.tableNumber}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Thời gian:</span>
                  <span className={styles.value}>
                    {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Trạng thái:</span>
                  <span className={`${styles.statusBadge} ${styles[getStatusColor(selectedOrder.status)]}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
              </div>

              <h3>Món đã đặt</h3>
              <div className={styles.itemsList}>
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className={styles.item}>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{item.dish?.name || 'N/A'}</span>
                      <span className={styles.itemQuantity}>x{item.quantity}</span>
                    </div>
                    <span className={styles.itemPrice}>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Tổng cộng:</span>
                <span className={styles.totalValue}>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(selectedOrder.totalAmount || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
