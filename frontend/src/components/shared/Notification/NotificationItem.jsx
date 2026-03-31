import React, { useState } from 'react';
import PropTypes from 'prop-types';
import paymentApi from '../../../api/paymentApi';
import styles from './NotificationItem.module.css';

const NotificationItem = ({ notification, onMarkRead, onDelete }) => {
    const { id, title, message, isRead, createdAt, type, data } = notification;
    const [isProcessing, setIsProcessing] = useState(false);

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
        switch (type) {
            case 'CASH_PAYMENT_REQUEST':
                return { icon: 'fa-hand-holding-usd', class: styles.paymentRequest, label: 'Thanh toán' };
            case 'PAYMENT_SUCCESS':
                return { icon: 'fa-check-circle', class: styles.paymentSuccess, label: 'Thành công' };
            case 'NEW_ORDER':
                return { icon: 'fa-utensils', class: styles.newOrder, label: 'Đơn hàng' };
            default:
                return { icon: 'fa-info-circle', class: styles.system, label: 'Hệ thống' };
        }
    };

    const config = getTypeConfig();
    const isUrgent = type === 'CASH_PAYMENT_REQUEST' || type === 'NEW_ORDER';

    const handleConfirmPayment = async (e) => {
        e.stopPropagation();
        if (!data?.invoiceId || isProcessing) return;

        if (!window.confirm(`Xác nhận đã thu tiền cho hóa đơn #${data.invoiceId}?`)) {
            return;
        }

        try {
            setIsProcessing(true);
            const response = await paymentApi.confirmByInvoice(data.invoiceId);
            if (response.success) {
                alert('Xác nhận thanh toán thành công! Bàn đã được giải phóng.');
                onMarkRead(id);
            } else {
                alert('Lỗi: ' + (response.message || 'Không thể xác nhận thanh toán'));
            }
        } catch (err) {
            console.error('Confirm payment error:', err);
            alert('Lỗi: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div 
            className={`${styles.card} ${!isRead ? styles.unread : ''} ${isUrgent && !isRead ? styles.urgent : ''}`}
            onClick={() => !isRead && onMarkRead(id)}
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

                {type === 'CASH_PAYMENT_REQUEST' && !isRead && (
                    <div className={styles.actionBox}>
                        <button 
                            className={styles.confirmPaymentBtn}
                            onClick={handleConfirmPayment}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <><i className="fas fa-spinner fa-spin"></i> Đang xử lý...</>
                            ) : (
                                <><i className="fas fa-money-bill-wave"></i> Xác nhận đã thu tiền</>
                            )}
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.actions}>
                {!isRead && (
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
        isRead: PropTypes.bool,
        read: PropTypes.bool, // For backward compatibility if needed
        createdAt: PropTypes.string.isRequired,
        type: PropTypes.string,
        data: PropTypes.object,
    }).isRequired,
    onMarkRead: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default NotificationItem;
