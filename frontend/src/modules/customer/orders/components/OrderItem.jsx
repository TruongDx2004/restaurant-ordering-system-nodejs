import React from 'react';
import styles from './OrderItem.module.css';

/**
 * OrderItem Component
 * Hiển thị một món trong đơn hàng với status
 */
export const OrderItem = ({ item, statusConfig }) => {
  const {
    id,
    dish,
    quantity,
    unitPrice,
    totalPrice
  } = item;

  const dishName = dish?.name || 'Món ăn';
  const dishImage = dish?.image || '/placeholder-dish.jpg';
  const price = totalPrice || (quantity * unitPrice) || 0;

  /**
   * Format currency
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div
      className={styles.orderItem}
      data-item-id={id}
      data-status={statusConfig.class}
    >
      {/* Item Image */}
      <div className={styles.itemImage}>
        <img
          src={dishImage}
          alt={dishName}
          onError={(e) => {
            e.target.src = '/placeholder-dish.jpg';
          }}
        />
        <div className={styles.quantityBadge}>
          {quantity}x
        </div>
      </div>

      {/* Item Details */}
      <div className={styles.itemDetails}>
        <div className={styles.itemHeader}>
          <h3 className={styles.itemName}>{dishName}</h3>
          <span className={styles.itemPrice}>
            {formatCurrency(price)}
          </span>
        </div>

        <div className={styles.itemInfo}>
          <span className={styles.unitPrice}>
            {formatCurrency(unitPrice)} × {quantity}
          </span>
        </div>

        {/* Item Status */}
        <div className={`${styles.itemStatus} ${styles[`status${statusConfig.class.charAt(0).toUpperCase() + statusConfig.class.slice(1)}`]}`}>
          <i className={`fas ${statusConfig.icon}`}></i>
          <span>{statusConfig.label}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderItem;
