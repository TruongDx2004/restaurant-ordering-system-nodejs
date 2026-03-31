import React from 'react';
import PropTypes from 'prop-types';
import styles from './NotificationItem.module.css';

const NotificationItem = ({ notification, onMarkRead, onDelete }) => {
    const { id, title, message, read, createdAt } = notification;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes}p trước`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h trước`;
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    const getTypeConfig = () => {
        const msg = message.toLowerCase();
        if (msg.includes('tiền mặt')) return { icon: 'fa-hand-holding-usd', class: styles.cash, label: 'Tiền mặt' };
        if (msg.includes('ví') || msg.includes('thanh toán')) return { icon: 'fa-check-circle', class: styles.eWallet, label: 'E-Wallet' };
        if (msg.includes('đơn hàng')) return { icon: 'fa-utensils', class: styles.order, label: 'Đơn hàng' };
        return { icon: 'fa-info-circle', class: styles.system, label: 'Hệ thống' };
    };

    const config = getTypeConfig();
    const isUrgent = message.toLowerCase().includes('tiền mặt');

    return (
        <div 
            className={`${styles.card} ${!read ? styles.unread : ''} ${isUrgent ? styles.urgent : ''}`}
            onClick={() => !read && onMarkRead(id)}
        >
            <div className={`${styles.statusIndicator} ${config.class}`}></div>
            
            <div className={styles.iconWrapper}>
                <div className={`${styles.iconCircle} ${config.class}`}>
                    <i className={`fas ${config.icon}`}></i>
                </div>
                <span className={styles.typeLabel}>{config.label}</span>
            </div>

            <div className={styles.mainContent}>
                <div className={styles.header}>
                    <h4 className={styles.title}>{title}</h4>
                    <span className={styles.time}>{formatDate(createdAt)}</span>
                </div>
                <p className={styles.message}>{message}</p>
            </div>

            <div className={styles.actions}>
                {!read && (
                    <button 
                        className={styles.actionBtn} 
                        onClick={(e) => { e.stopPropagation(); onMarkRead(id); }}
                        title="Đánh dấu đã đọc"
                    >
                        <i className="fas fa-check"></i>
                    </button>
                )}
                <button 
                    className={`${styles.actionBtn} ${styles.delete}`} 
                    onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                    title="Xóa"
                >
                    <i className="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    );
};

NotificationItem.propTypes = {
    notification: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
        read: PropTypes.bool.isRequired,
        createdAt: PropTypes.string.isRequired,
    }).isRequired,
    onMarkRead: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default NotificationItem;
