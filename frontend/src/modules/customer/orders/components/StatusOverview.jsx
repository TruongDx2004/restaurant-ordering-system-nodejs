import React from 'react';
import styles from './StatusOverview.module.css';

/**
 * StatusOverview Component
 * Hiển thị tổng quan các trạng thái đơn hàng (WAITING, PREPARING, SERVED)
 */
export const StatusOverview = ({ statusCounts, ORDER_STATUSES, activeStatus, onStatusChange }) => {
  const statusCards = [
    {
      key: 'WAITING',
      config: ORDER_STATUSES.WAITING,
      count: statusCounts.waiting
    },
    {
      key: 'PREPARING',
      config: ORDER_STATUSES.PREPARING,
      count: statusCounts.preparing
    },
    {
      key: 'SERVED',
      config: ORDER_STATUSES.SERVED,
      count: statusCounts.served
    }
  ];

  return (
    <div className={styles.statusOverview}>
      {statusCards.map(({ key, config, count }) => (
        <div
          key={key}
          className={`${styles.statusCard} ${activeStatus === key ? styles.selected : ''} ${count > 0 ? styles.hasItems : ''}`}
          onClick={() => onStatusChange(key)}
          data-status={key}
        >
          <div 
            className={styles.statusIcon}
            style={{ 
              background: `linear-gradient(135deg, ${config?.color || '#ccc'}, ${config?.color || '#ccc'}dd)`,
              boxShadow: activeStatus === key ? `0 4px 10px ${config?.color}44` : 'none'
            }}
          >
            <i className={`fas ${config?.icon || 'fa-info-circle'}`}></i>
          </div>
          <div className={styles.statusInfo}>
            <span className={styles.statusCount}>{count || 0}</span>
            <span className={styles.statusLabel}>{config?.label || 'N/A'}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusOverview;
