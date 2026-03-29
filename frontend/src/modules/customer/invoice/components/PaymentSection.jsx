import React, { useState } from 'react';
import styles from './PaymentSection.module.css';

/**
 * PaymentSection Component
 * Hiển thị thông tin thanh toán và nút thanh toán
 */
export const PaymentSection = ({ 
  invoice, 
  items,
  onPayment,
  isProcessing 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('CASH');

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
   * Calculate totals
   */
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const serviceFee = subtotal * 0.1; // 10%
    const total = invoice?.totalAmount || (subtotal + serviceFee);

    return { subtotal, serviceFee, total };
  };

  const { subtotal, serviceFee, total } = calculateTotals();

  /**
   * Check if all items are ready
   * Only allows payment if items are 'SERVED' or 'CANCELLED'
   */
  const hasPendingItems = items && items.some(item => 
    item.status === 'WAITING' || item.status === 'PREPARING'
  );
  
  const canPay = items && items.length > 0 && !isProcessing && !hasPendingItems;

  /**
   * Handle payment
   */
  const handlePayment = () => {
    if (canPay && onPayment) {
      onPayment(paymentMethod, total);
    }
  };

  return (
    <div className={styles.paymentSection}>
      {/* Payment Summary */}
      <div className={styles.summary}>
        <h3>Tổng kết</h3>
        
        <div className={styles.summaryRow}>
          <span>Tạm tính:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        
        <div className={`${styles.summaryRow} ${styles.total}`}>
          <span>Tổng cộng:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className={styles.paymentMethod}>
        <h3>Phương thức thanh toán</h3>
        
        <div className={styles.methodOptions}>
          <label className={styles.methodOption}>
            <input
              type="radio"
              name="paymentMethod"
              value="CASH"
              checked={paymentMethod === 'CASH'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <div className={styles.methodInfo}>
              <i className="fas fa-money-bill-wave"></i>
              <span>Tiền mặt</span>
            </div>
          </label>

          <label className={styles.methodOption}>
            <input
              type="radio"
              name="paymentMethod"
              value="BANK_TRANSFER"
              checked={paymentMethod === 'BANK_TRANSFER'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <div className={styles.methodInfo}>
              <i className="fas fa-university"></i>
              <span>Chuyển khoản</span>
            </div>
          </label>

          <label className={styles.methodOption}>
            <input
              type="radio"
              name="paymentMethod"
              value="CREDIT_CARD"
              checked={paymentMethod === 'CREDIT_CARD'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <div className={styles.methodInfo}>
              <i className="fas fa-credit-card"></i>
              <span>Thẻ tín dụng</span>
            </div>
          </label>

          <label className={styles.methodOption}>
            <input
              type="radio"
              name="paymentMethod"
              value="E_WALLET"
              checked={paymentMethod === 'E_WALLET'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <div className={styles.methodInfo}>
              <i className="fas fa-wallet"></i>
              <span>Ví điện tử</span>
            </div>
          </label>
        </div>
      </div>

      {/* Payment Button */}
      <button
        className={styles.paymentButton}
        onClick={handlePayment}
        disabled={!canPay}
      >
        {isProcessing ? (
          <>
            <i className="fas fa-spinner fa-spin"></i>
            <span>Đang xử lý...</span>
          </>
        ) : (
          <>
            <i className="fas fa-check-circle"></i>
            <span>Thanh toán {formatCurrency(total)}</span>
          </>
        )}
      </button>

      {!canPay && !isProcessing && (
        <p className={styles.warning}>
          <i className="fas fa-info-circle"></i>
          {items.length === 0 ? 'Chưa có món ăn nào để thanh toán' : 'Vui lòng đợi tất cả món đã giao'}
        </p>
      )}
    </div>
  );
};

export default PaymentSection;
