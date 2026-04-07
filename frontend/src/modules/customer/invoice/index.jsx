import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../orders/hooks';
import { useInvoicePayment } from './hooks';
import { InvoiceTable, PaymentSection, PaymentWaitingModal } from './components';
import { DesktopWarning } from '../../../components/shared';
import storage from '../../../utils/storage';
import { webSocketService } from '../../../services/webSocketService';
import styles from './index.module.css';

/**
 * Invoice Component
 * Trang hóa đơn - hiển thị chi tiết và thanh toán
 */
const Invoice = () => {
  const navigate = useNavigate();
  const [tableNumber, setTableNumber] = useState(null);
  const [toast, setToast] = useState(null);
  const [isWaitingModalOpen, setIsWaitingModalOpen] = useState(false);

  // Get table number from storage
  useEffect(() => {
    const storedTableNumber = storage.getTableNumber();
    if (storedTableNumber) {
      setTableNumber(storedTableNumber);
    } else {
      setTableNumber('1');
      storage.setTableNumber('1');
    }
  }, []);

  // Fetch orders data (reuse hook from orders page)
  const { invoice, items, loading, error, refetch } = useOrders(tableNumber, 0); // No auto-refresh

  // WebSocket Subscription
  useEffect(() => {
    if (!invoice?.id) return;

    console.log(`[Invoice] Subscribing to updates for invoice ${invoice.id}`);

    const unsubscribePayment = webSocketService.subscribe('/topic/payments', (message) => {
      if (message.invoiceId === invoice.id) {
        if (message.data === 'PAID') {
          showToast('Thanh toán thành công!', 'success');
          setTimeout(() => {
            navigate('/customer/payment-result', {
              state: {
                success: true,
                orderId: invoice.id,
                amount: invoice.totalAmount,
                method: 'CASH',
                message: 'Thanh toán tiền mặt thành công'
              }
            });
          }, 10);
        } else {
          showToast(`Trạng thái hóa đơn: ${message.data}`, 'info');
        }
        refetch();
      }
    });

    const unsubscribeItems = webSocketService.subscribe('/topic/orders/status', (message) => {
      if (message.invoiceId === invoice.id) {
        refetch();
      }
    });

    const unsubscribeOders = webSocketService.subscribe('/topic/orders', (message) => {
      if (message.invoiceId === invoice.id) {
        refetch();
      }
    });

    return () => {
      unsubscribePayment();
      unsubscribeItems();
      unsubscribeOders();
    };
  }, [invoice?.id, refetch]);

  /**
   * Logic gộp món ăn và lấy trạng thái ưu tiên
   * Loại bỏ hoàn toàn các món đã hủy (CANCELLED)
   * Ưu tiên: WAITING > PREPARING > SERVED
   */
  const groupedItems = useMemo(() => {
    if (!items || items.length === 0) return [];

    // Bước 1: Lọc bỏ các món đã hủy trước khi gộp
    const activeItems = items.filter(item => item.status !== 'CANCELLED');

    const grouped = {};
    const statusPriority = {
      'WAITING': 1,
      'PREPARING': 2,
      'SERVED': 3
    };

    activeItems.forEach(item => {
      const dishId = item.dish?.id;
      if (!dishId) return;

      if (!grouped[dishId]) {
        grouped[dishId] = {
          ...item,
          quantity: 0,
          totalPrice: 0
        };
      }

      // Cộng dồn số lượng và giá
      grouped[dishId].quantity += item.quantity;
      grouped[dishId].totalPrice += (item.totalPrice || (item.unitPrice * item.quantity));

      // Lấy trạng thái ưu tiên nhất (số nhỏ nhất)
      const currentPriority = statusPriority[grouped[dishId].status] || 999;
      const itemPriority = statusPriority[item.status] || 999;

      if (itemPriority < currentPriority) {
        grouped[dishId].status = item.status;
      }
    });

    return Object.values(grouped);
  }, [items]);

  // Payment processing
  const {
    processPayment,
    processMoMoPayment,
    requestCashPayment,
    isProcessing,
    error: paymentError
  } = useInvoicePayment();

  /**
   * Show toast notification
   */
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /**
   * Handle payment
   */
  const handlePayment = async (paymentMethod, amount) => {
    if (!invoice || !invoice.id) {
      showToast('Không tìm thấy hóa đơn', 'error');
      return;
    }

    if (paymentMethod === 'MOMO') {
      const result = await processMoMoPayment(invoice.id, amount);
      if (!result.success) {
        showToast(result.error || 'Thanh toán MoMo thất bại!', 'error');
      }
      return;
    }

    if (paymentMethod === 'CASH') {
      const result = await requestCashPayment(invoice.id, invoice.tableId || tableNumber, amount);
      if (result.success) {
        setIsWaitingModalOpen(true);
      } else {
        showToast(result.error || 'Không thể gửi yêu cầu thanh toán!', 'error');
      }
      return;
    }

    const result = await processPayment(invoice.id, paymentMethod, amount);

    if (result.success) {
      showToast('Thanh toán thành công!', 'success');

      setTimeout(() => {
        navigate('/customer/payment-result', {
          state: {
            success: true,
            orderId: invoice.id,
            amount: amount,
            method: paymentMethod,
            message: 'Thanh toán thành công'
          }
        });
      }, 100);
    } else {
      showToast(result.error || 'Thanh toán thất bại!', 'error');
    }
  };

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
   * Format date
   */
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  // Loading state
  if (loading && !invoice) {
    return (
      <div className={styles.invoiceContainer}>
        <div className={styles.loading}>
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải hóa đơn...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !invoice) {
    return (
      <div className={styles.invoiceContainer}>
        <div className={styles.error}>
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Có lỗi xảy ra</h3>
          <p>{error}</p>
          <button onClick={() => refetch()} className={styles.retryBtn}>
            <i className="fas fa-redo"></i> Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Empty state - no invoice
  if (!invoice) {
    return (
      <div className={styles.invoiceContainer}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <i className="fas fa-receipt"></i>
          </div>
          <h3>Chưa có hóa đơn nào</h3>
          <p>Hãy thêm món ăn từ trang menu</p>
          <a href="/customer/home" className={styles.browseMenuBtn}>
            Xem Menu
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <DesktopWarning />
      <div className={styles.invoiceContainer}>
        {/* Invoice Header */}
        <div className={styles.invoiceHeader}>
          <div className={styles.headerTop}>
            <button
              onClick={() => navigate(-1)}
              className={styles.backBtn}
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <h1>Hóa Đơn</h1>
            <button
              onClick={() => window.print()}
              className={styles.printBtn}
            >
              <i className="fas fa-print"></i>
            </button>
          </div>

          <div className={styles.invoiceInfo}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Mã hóa đơn:</span>
              <span className={styles.value}>#{invoice.id}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Bàn:</span>
              <span className={styles.value}>{invoice.table?.tableNumber || tableNumber}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Ngày giờ:</span>
              <span className={styles.value}>{formatDate(invoice.createdAt)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Trạng thái:</span>
              <span className={`${styles.status} ${styles[invoice.status?.toLowerCase()]}`}>
                {invoice.status === 'OPEN' ? 'Đang phục vụ' :
                  invoice.status === 'PAID' ? 'Đã thanh toán' :
                    invoice.status}
              </span>
            </div>
          </div>
        </div>

        {/* Invoice Table */}
        <InvoiceTable items={groupedItems} />

        {/* Payment Section */}
        {invoice.status === 'OPEN' && (
          <PaymentSection
            invoice={invoice}
            items={groupedItems}
            onPayment={handlePayment}
            isProcessing={isProcessing}
          />
        )}

        {/* Payment Waiting Modal */}
        <PaymentWaitingModal
          isOpen={isWaitingModalOpen}
          onClose={() => setIsWaitingModalOpen(false)}
          onRetry={() => handlePayment('CASH', invoice?.totalAmount)}
          tableNumber={invoice?.table?.tableNumber || tableNumber}
        />

        {/* Already Paid Message */}
        {invoice.status === 'PAID' && (
          <div className={styles.paidMessage}>
            <i className="fas fa-check-circle"></i>
            <h3>Hóa đơn đã được thanh toán</h3>
            <p>Cảm ơn bạn đã sử dụng dịch vụ!</p>
            {invoice.paidAt && (
              <p className={styles.paidTime}>Thanh toán lúc: {formatDate(invoice.paidAt)}</p>
            )}
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className={`${styles.toast} ${styles[`toast${toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}`]}`}>
            {toast.message}
          </div>
        )}
      </div>
    </>
  );
};

export default Invoice;
