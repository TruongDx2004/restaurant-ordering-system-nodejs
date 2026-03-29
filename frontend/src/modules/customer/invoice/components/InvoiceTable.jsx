import React from 'react';
import styles from './InvoiceTable.module.css';

/**
 * Invoice item statuses configuration mapping to backend InvoiceItemStatus
 */
const ITEM_STATUSES = {
  WAITING: { label: 'Chờ xử lý', icon: 'fa-clock', color: '#f39c12', class: 'waiting' },
  PREPARING: { label: 'Đang làm', icon: 'fa-fire', color: '#e74c3c', class: 'preparing' },
  SERVED: { label: 'Đã phục vụ', icon: 'fa-check-circle', color: '#27ae60', class: 'served' },
  CANCELLED: { label: 'Đã hủy', icon: 'fa-ban', color: '#95a5a6', class: 'cancelled' }
};

/**
 * InvoiceTable Component
 * Hiển thị danh sách món ăn trong hóa đơn dạng bảng
 */
export const InvoiceTable = ({ items }) => {
  /**
   * Format currency
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  /**
   * Get status configuration
   */
  const getStatusConfig = (status) => {
    return ITEM_STATUSES[status] || ITEM_STATUSES.WAITING;
  };

  if (!items || items.length === 0) {
    return (
      <div className={styles.emptyTable}>
        <p>Chưa có món ăn nào trong hóa đơn</p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.invoiceTable}>
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên món</th>
            <th>Đơn giá</th>
            <th>SL</th>
            <th>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const statusConfig = getStatusConfig(item.status);
            return (
              <tr key={item.id} className={styles[statusConfig.class]}>
                <td className={styles.stt}>{index + 1}</td>
                <td className={styles.dishName}>
                  <div className={styles.dishInfo}>
                    {item.dish?.image && (
                      <img 
                        src={item.dish.image} 
                        alt={item.dish.name}
                        className={styles.dishImage}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className={styles.nameWithStatus}>
                      <span className={styles.itemName}>{item.dish?.name || 'Món ăn'}</span>
                      <div className={`${styles.statusLine} ${styles[statusConfig.class]}`}>
                      </div>
                    </div>
                  </div>
                </td>
                <td className={styles.price}>
                  {formatCurrency(item.unitPrice || 0)}
                </td>
                <td className={styles.quantity}>
                  {item.quantity}
                </td>
                <td className={styles.totalPrice}>
                  {formatCurrency(item.totalPrice || 0)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceTable;
