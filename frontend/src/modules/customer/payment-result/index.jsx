import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import styles from './index.module.css';

/**
 * PaymentResult Component
 * Hiển thị kết quả thanh toán từ MoMo redirect về
 */
const PaymentResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    // 1. Ưu tiên lấy từ location.state (Dành cho thanh toán tiền mặt hoặc chuyển trang từ Invoice)
    if (location.state) {
      const { success, orderId, message, amount, transId, time, method } = location.state;
      setResult({
        success: success !== false,
        orderId: orderId || 'N/A',
        message: message || 'Giao dịch thành công',
        amount: amount || 0,
        transId: transId || '',
        time: time || new Date().toLocaleString('vi-VN'),
        method: method || 'CASH'
      });
      return;
    }

    // 2. Parse query parameters (Dành cho MoMo redirect URL)
    const queryParams = new URLSearchParams(location.search);
    const resultCode = queryParams.get('resultCode');
    
    // Nếu không có cả state và query params thì quay lại
    if (!resultCode && !location.state) {
        return;
    }

    const orderId = queryParams.get('orderId');
    const message = queryParams.get('message');
    const amount = queryParams.get('amount');
    const transId = queryParams.get('transId');
    const responseTime = queryParams.get('responseTime');

    setResult({
      success: resultCode === '0',
      orderId,
      message: message || (resultCode === '0' ? 'Giao dịch thành công' : 'Giao dịch thất bại'),
      amount,
      transId,
      time: responseTime,
      method: 'MOMO'
    });
  }, [location]);

  if (!result) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Đang xử lý kết quả thanh toán...</p>
    </div>
  );

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return new Date().toLocaleString('vi-VN');
    return timeStr;
  };

  const getMethodLabel = (method) => {
    switch (method) {
      case 'MOMO': return 'Ví MoMo';
      case 'CASH': return 'Tiền mặt';
      case 'BANK_TRANSFER': return 'Chuyển khoản';
      default: return method || 'Tiền mặt';
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${result.success ? styles.successCard : styles.errorCard}`}>
        {/* Status Icon */}
        <div className={styles.iconWrapper}>
          {result.success ? (
            <div className={styles.successIcon}>
              <i className="fas fa-check"></i>
            </div>
          ) : (
            <div className={styles.errorIcon}>
              <i className="fas fa-times"></i>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={styles.content}>
          <h1 className={styles.title}>
            {result.success ? 'Thanh Toán Thành Công!' : 'Thanh Toán Thất Bại'}
          </h1>
          
          {result.success ? (
            <p className={styles.thanksMsg}>
              Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của nhà hàng chúng tôi. 
              Chúc bạn có một bữa ăn ngon miệng!
            </p>
          ) : (
            <p className={styles.errorMsg}>
              Rất tiếc, đã có lỗi xảy ra trong quá trình xử lý giao dịch. 
              Vui lòng thử lại hoặc liên hệ nhân viên để được hỗ trợ.
            </p>
          )}

          {/* Transaction Details */}
          <div className={styles.detailsBox}>
            <div className={styles.detailRow}>
              <span>Mã đơn hàng</span>
              <span className={styles.bold}>{result.orderId}</span>
            </div>
            {result.transId && (
              <div className={styles.detailRow}>
                <span>Mã giao dịch</span>
                <span className={styles.bold}>{result.transId}</span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span>Số tiền</span>
              <span className={styles.amountText}>{formatCurrency(result.amount)}</span>
            </div>
            <div className={styles.detailRow}>
              <span>Thời gian</span>
              <span>{formatTime(result.time)}</span>
            </div>
            <div className={styles.detailRow}>
              <span>Phương thức</span>
              <span className={result.method === 'MOMO' ? styles.momoText : styles.bold}>
                {getMethodLabel(result.method)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {result.success ? (
            <>
              <button onClick={() => navigate('/customer/home')} className={styles.primaryBtn}>
                <i className="fas fa-home"></i> Quay lại trang chủ
              </button>
              <button onClick={() => window.print()} className={styles.secondaryBtn}>
                <i className="fas fa-print"></i> In hóa đơn
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/customer/invoices')} className={styles.primaryBtn}>
                <i className="fas fa-redo"></i> Thử lại thanh toán
              </button>
              <button onClick={() => navigate('/customer/home')} className={styles.secondaryBtn}>
                Quay lại trang chủ
              </button>
            </>
          )}
        </div>
        
        <div className={styles.footer}>
          <p>© 2026 Restaurant Management System</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
