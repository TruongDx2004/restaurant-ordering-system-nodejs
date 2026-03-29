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
   * Reset payment state
   */
  const resetPayment = useCallback(() => {
    setError(null);
    setPaymentResult(null);
    setIsProcessing(false);
  }, []);

  return {
    processPayment,
    isProcessing,
    error,
    paymentResult,
    resetPayment
  };
};

export default useInvoicePayment;
