import { useState, useEffect, useCallback } from 'react';
import { messageApi } from '../../../../api';
import { webSocketService } from '../../../../services/webSocketService';

/**
 * Custom hook for customer messaging
 * Unified with Staff view using tableId as primary identifier
 */
export const useMessages = (tableId, invoiceId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  /**
   * Fetch messages based on tableId
   */
  const fetchMessages = useCallback(async () => {
    if (!tableId) return;

    try {
      const response = await messageApi.getByTableOrdered(tableId);
      
      if (response && response.success) {
        // Sort by date ASC to ensure newest at bottom
        const sorted = (response.data || []).sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        setMessages(sorted);
      } else if (Array.isArray(response)) {
        const sorted = response.sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        setMessages(sorted);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Không thể tải tin nhắn');
    } finally {
      setLoading(false);
    }
  }, [tableId]);

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // WebSocket for real-time messages
  useEffect(() => {
    if (!tableId) return;

    console.log(`[Socket] Subscribing to chat for table ${tableId}`);
    const unsubscribe = webSocketService.subscribe(`/topic/chat/${tableId}`, (message) => {
      console.log('[Socket] New chat message received:', message);
      // Instead of refetching all, we can append if we have enough info, 
      // but fetchMessages is safer for consistency with the DB
      fetchMessages();
    });

    return () => unsubscribe();
  }, [tableId, fetchMessages]);

  /**
   * Send a new message
   */
  const sendMessage = async (content, type = 'TEXT') => {
    if (!content.trim() && type === 'TEXT') return { success: false };
    if (!tableId) return { success: false, error: 'Thiếu thông tin bàn' };

    setSending(true);
    try {
      const messageData = {
        tableId: parseInt(tableId),
        invoiceId: invoiceId ? parseInt(invoiceId) : null,
        content: content,
        messageType: type,
        sender: 'CUSTOMER'
      };

      const response = await messageApi.create(messageData);
      
      if (response && response.success && response.data) {
        setMessages(prev => [...prev, response.data]);
        return { success: true };
      } else if (response && response.id) {
        setMessages(prev => [...prev, response]);
        return { success: true };
      }
      
      return { success: false, error: 'Phản hồi không hợp lệ' };
    } catch (err) {
      console.error('Error sending message:', err);
      return { success: false, error: 'Gửi tin nhắn thất bại' };
    } finally {
      setSending(false);
    }
  };

  const callStaff = () => sendMessage('Yêu cầu nhân viên đến bàn', 'CALL_WAITER');
  const requestBill = () => sendMessage('Yêu cầu thanh toán hóa đơn', 'REQUEST_BILL');

  return {
    messages,
    loading,
    error,
    sending,
    sendMessage,
    callStaff,
    requestBill,
    refetch: fetchMessages
  };
};

export default useMessages;
