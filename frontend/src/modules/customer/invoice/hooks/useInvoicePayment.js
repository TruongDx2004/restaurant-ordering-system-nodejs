import { useState, useCallback } from 'react';
import { paymentApi, invoiceApi } from '../../../../api';

/**
 * Custom hook để xử lý thanh toán hóa đơn
 * @returns {Object} { processPayment, isProcessing, error, paymentResult }
 */
export const useInvoicePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  /**
   * Process payment for invoice
   * @param {number} invoiceId - Invoice ID
   * @param {string} paymentMethod - Payment method
   * @param {number} amount - Payment amount
   * @returns {Promise<Object>} Payment result
   */
  const processPayment = useCallback(async (invoiceId, paymentMethod, amount) => {
    try {
      setIsProcessing(true);
      setError(null);

      console.log(`💳 Processing payment for invoice ${invoiceId}...`);
      console.log(`Method: ${paymentMethod}, Amount: ${amount}`);

      // Call payment API
      const response = await paymentApi.processPayment(invoiceId, paymentMethod, amount);

      if (response.success && response.data) {
        console.log(`✅ Payment processed successfully:`, response.data);
        setPaymentResult(response.data);
        return {
          success: true,
          payment: response.data
        };
      } else {
        throw new Error('Payment failed');
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Thanh toán thất bại';
      console.error('❌ Payment error:', err);
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Process MoMo payment
   * @param {number} invoiceId - Invoice ID
   * @param {number} amount - Payment amount
   */
  const processMoMoPayment = useCallback(async (invoiceId, amount) => {
    try {
      setIsProcessing(true);
      setError(null);

      console.log(`💳 Initiating MoMo payment for invoice ${invoiceId}...`);

      const response = await paymentApi.createMoMoPayment({
        invoiceId,
        amount,
        orderInfo: `Thanh toán hóa đơn #${invoiceId}`
      });

      // MoMo trả về nhiều URL: payUrl (web), deeplink (app), qrCodeUrl (ảnh QR)
      // Ta ưu tiên sử dụng payUrl để MoMo tự động điều hướng phù hợp trên từng thiết bị
      const momoUrl = response.data?.payUrl;

      if (response.success && momoUrl) {
        // Chuyển hướng đến trang thanh toán của MoMo
        window.location.href = momoUrl;
        return { success: true };
      } else {
        throw new Error(response.message || 'Không thể tạo thanh toán MoMo');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi thanh toán MoMo';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Reset payment state
   */
  const resetPayment = useCallback(() => {
    setError(null);
    setPaymentResult(null);
    setIsProcessing(false);
  }, []);

  return {
    processPayment,
    processMoMoPayment,
    isProcessing,
    error,
    paymentResult,
    resetPayment
  };
};

export default useInvoicePayment;
