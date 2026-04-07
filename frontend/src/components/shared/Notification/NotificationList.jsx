import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import NotificationItem from './NotificationItem';
import useNotifications from './useNotifications';
import styles from './NotificationList.module.css';

const NOTIFICATION_TYPES = {
    PAYMENT: 'PAYMENT',
    ORDER: 'ORDER',
    SYSTEM: 'SYSTEM'
};

const NotificationList = ({ recipientType, recipientId }) => {
    const [activeTab, setActiveTab] = useState(NOTIFICATION_TYPES.PAYMENT);
    const [filterUnread, setFilterUnread] = useState(false);

    const {
        notifications,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotifications(recipientType, recipientId);

    const categorizedNotifications = useMemo(() => {
        const categories = {
            [NOTIFICATION_TYPES.PAYMENT]: [],
            [NOTIFICATION_TYPES.ORDER]: [],
            [NOTIFICATION_TYPES.SYSTEM]: []
        };

        notifications.forEach(n => {
            const type = n.type;

            let targetCategory = NOTIFICATION_TYPES.SYSTEM;
            if (type === "CASH_PAYMENT_REQUEST" || type === "PAYMENT_STATUS") {
                targetCategory = NOTIFICATION_TYPES.PAYMENT;
            } else if (type === "ORDER_STATUS" || type === "NEW_ORDER") {
                targetCategory = NOTIFICATION_TYPES.ORDER;
            }

            // Áp dụng bộ lọc "Chưa đọc"
            if (!filterUnread || !n.isRead) {
                categories[targetCategory].push(n);
            }
        });

        // Sắp xếp Payment: Tiền mặt lên đầu
        categories[NOTIFICATION_TYPES.PAYMENT].sort((a, b) => {
            const msgA = (a.message || "").toLowerCase();
            const msgB = (b.message || "").toLowerCase();

            const isACash = msgA.includes("tiền mặt");
            const isBCash = msgB.includes("tiền mặt");

            if (isACash && !isBCash) return -1;
            if (!isACash && isBCash) return 1;

            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        return categories;
    }, [notifications, filterUnread]);

    const getUnreadCount = (type = null) => {
        if (!type) return notifications.filter(n => !n.isRead).length;
        return notifications.filter(n => {
            const isType = type === NOTIFICATION_TYPES.PAYMENT
                ? (n.title + n.message).toLowerCase().match(/thanh toán|tiền mặt|ví/)
                : type === NOTIFICATION_TYPES.ORDER
                    ? (n.title + n.message).toLowerCase().match(/đơn hàng|gọi món/)
                    : !(n.title + n.message).toLowerCase().match(/thanh toán|tiền mặt|ví|đơn hàng|gọi món/);
            return isType && !n.isRead;
        }).length;
    };

    if (loading && notifications.length === 0) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Đang đồng bộ dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            {/* Thanh điều khiển trên cùng */}
            <div className={styles.controlBar}>
                <div className={styles.summary}>
                    <span className={styles.unreadCount}>{getUnreadCount()}</span>
                    <span className={styles.summaryText}>tin nhắn mới</span>
                </div>
                <div className={styles.actions}>
                    <label className={styles.toggleFilter}>
                        <input
                            type="checkbox"
                            checked={filterUnread}
                            onChange={(e) => setFilterUnread(e.target.checked)}
                        />
                        <span className={styles.toggleSlider}></span>
                        <span className={styles.toggleText}>Chưa đọc</span>
                    </label>
                    <button className={styles.btnReadAll} onClick={markAllAsRead}>
                        Đọc tất cả
                    </button>
                </div>
            </div>

            {/* Hệ thống Tabs hiện đại */}
            <div className={styles.tabsContainer}>
                {Object.values(NOTIFICATION_TYPES).map(type => (
                    <button
                        key={type}
                        className={`${styles.tabBtn} ${activeTab === type ? styles.active : ''}`}
                        onClick={() => setActiveTab(type)}
                    >
                        <span className={styles.tabLabel}>
                            {type === NOTIFICATION_TYPES.PAYMENT ? 'Thanh toán' : type === NOTIFICATION_TYPES.SYSTEM ? 'Hệ thống' : 'Đơn hàng'}
                        </span>
                    </button>
                ))}
            </div>

            <div className={styles.scrollArea}>
                {categorizedNotifications[activeTab].length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <i className="fas fa-inbox"></i>
                        </div>
                        <h3>Mọi thứ đã xong!</h3>
                        <p>Không có thông báo nào trong mục này.</p>
                    </div>
                ) : (
                    <div className={styles.list}>
                        {categorizedNotifications[activeTab].map(notification => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkRead={markAsRead}
                                onDelete={deleteNotification}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

NotificationList.propTypes = {
    recipientType: PropTypes.oneOf(['USER', 'CUSTOMER']).isRequired,
    recipientId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default NotificationList;
