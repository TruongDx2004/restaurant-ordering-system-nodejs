import React, { useState, useEffect } from 'react';
import styles from './PaymentWaitingModal.module.css';

/**
 * PaymentWaitingModal Component
 * Hiển thị animation vui nhộn trong lúc chờ nhân viên xác nhận thanh toán tiền mặt
 */
export const PaymentWaitingModal = ({ isOpen, onClose, onRetry, tableNumber }) => {
  const [countdown, setCountdown] = useState(0);
  
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const handleRetry = () => {
    if (countdown === 0) {
      onRetry();
      setCountdown(30); // Bắt đầu đếm ngược 30s
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalCard}>
        <button className={styles.closeBtn} onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        <div className={styles.animationContainer}>
          {/* Một animation vui nhộn: Nhân viên đang chạy */}
          <div className={styles.waiterRunner}>
            <div className={styles.waiterIcon}>
              <i className="fas fa-user-tie"></i>
              <div className={styles.tray}>
                <i className="fas fa-receipt"></i>
              </div>
            </div>
            <div className={styles.road}></div>
          </div>
          
          <div className={styles.bubbles}>
            <span style={{'--i': 1}}></span>
            <span style={{'--i': 2}}></span>
            <span style={{'--i': 3}}></span>
          </div>
        </div>

        <div className={styles.content}>
          <h2 className={styles.title}>Đang gọi nhân viên!</h2>
          <p className={styles.description}>
            Yêu cầu của bạn đã được gửi tới tất cả nhân viên. 
            Vui lòng chuẩn bị sẵn tiền mặt tại <strong>Bàn {tableNumber}</strong>.
          </p>
          <p className={styles.statusText}>
            <i className="fas fa-walking fa-spin"></i> Nhân viên đang di chuyển tới...
          </p>
        </div>

        <div className={styles.footer}>
          <button 
            className={styles.retryBtn} 
            onClick={handleRetry}
            disabled={countdown > 0}
          >
            {countdown > 0 ? (
              `Gửi lại sau (${countdown}s)`
            ) : (
              <>
                <i className="fas fa-bell"></i> Gửi lại yêu cầu
              </>
            )}
          </button>
          <button className={styles.cancelBtn} onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentWaitingModal;
