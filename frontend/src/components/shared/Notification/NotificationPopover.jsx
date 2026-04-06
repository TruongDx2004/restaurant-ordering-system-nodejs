import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import NotificationItem from './NotificationItem';
import useNotifications from './useNotifications';
import styles from './NotificationPopover.module.css';

const NotificationPopover = ({ recipientType, recipientId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef(null);
    const { 
        notifications, 
        unreadCount, 
        loading, 
        markAsRead, 
        markAllAsRead, 
        deleteNotification 
    } = useNotifications(recipientType, recipientId);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const togglePopover = () => setIsOpen(!isOpen);

    return (
        <div className={styles.container} ref={popoverRef}>
            <button className={styles.trigger} onClick={togglePopover}>
                <svg 
                    width="24" height="24" viewBox="0 0 24 24" 
                    fill="none" stroke="currentColor" strokeWidth="2" 
                    strokeLinecap="round" strokeLinejoin="round"
                >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                    <span className={styles.badge}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={styles.popover}>
                    <div className={styles.header}>
                        <h3 className={styles.title}>Thông báo</h3>
                        {unreadCount > 0 && (
                            <button className={styles.markAll} onClick={markAllAsRead}>
                                Đọc tất cả
                            </button>
                        )}
                    </div>
                    <div className={styles.list}>
                        {loading && notifications.length === 0 ? (
                            <div className={styles.empty}>Đang tải...</div>
                        ) : notifications.length === 0 ? (
                            <div className={styles.empty}>Không có thông báo nào</div>
                        ) : (
                            notifications.map(notification => (
                                <NotificationItem 
                                    key={notification.id} 
                                    notification={notification}
                                    onMarkRead={markAsRead}
                                    onDelete={deleteNotification}
                                />
                            ))
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <div className={styles.footer}>
                            <button className={styles.viewAll}>Xem tất cả</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

NotificationPopover.propTypes = {
    recipientType: PropTypes.oneOf(['USER', 'CUSTOMER']).isRequired,
    recipientId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default NotificationPopover;
