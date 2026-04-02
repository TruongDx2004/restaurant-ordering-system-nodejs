import React, { useState } from 'react';
import PropTypes from 'prop-types';
import paymentApi from '../../../api/paymentApi';
import { useModal } from '../../../contexts/ModalContext';
import styles from './NotificationItem.module.css';

const NotificationItem = ({ notification, onMarkRead, onDelete }) => {
    const { showAlert } = useModal();
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

    const handleConfirmPayment = (e) => {
        e.stopPropagation();
        if (!data?.invoiceId || isProcessing) return;

        showConfirm(`Xác nhận thu tiền hóa đơn #${data.invoiceId}?`, async () => {
            try {
                setIsProcessing(true);
                const response = await paymentApi.confirmByInvoice(data.invoiceId);

                if (response.success) {
                    showAlert('Thanh toán thành công! Bàn đã được giải phóng.', 'Thành công', 'success');
                    onMarkRead(id);
                } else {
                    showAlert('Lỗi: ' + (response.message || 'Không thể xác nhận'), 'Lỗi', 'error');
                }
            } catch (err) {
                showAlert('Lỗi: ' + (err.response?.data?.message || err.message), 'Lỗi', 'error');
            } finally {
                setIsProcessing(false);
            }
        }, null, 'Xác nhận');
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
