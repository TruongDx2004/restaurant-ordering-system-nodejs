import { useState, useEffect, useCallback, useRef } from 'react';
import { messageApi } from '../../../../api';
import { webSocketService } from '../../../../services/webSocketService';

/**
 * Custom hook for customer messaging
 * Tối ưu hóa việc lấy dữ liệu và đồng nhất với logic WebSocket mới
 */
export const useMessages = (tableId, invoiceId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const tableIdRef = useRef(tableId);

  /**
   * Lấy lịch sử tin nhắn của bàn
   */
  const fetchMessages = useCallback(async () => {
    if (!tableId) return;

    try {
      const response = await messageApi.getByTable(tableId);
      
      if (response && response.success) {
        setMessages(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Không thể tải tin nhắn');
    } finally {
      setLoading(false);
    }
  }, [tableId]);

  useEffect(() => {
    tableIdRef.current = tableId;
  }, [tableId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!tableId) return;

    console.log(`[Socket] Subscribing to chat for table ${tableId}`);
    
    const unsubscribe = webSocketService.subscribe(`/topic/chat/${tableId}`, (message) => {
      if (message.tableId === tableIdRef.current || message.tableId == tableIdRef.current) {
        fetchMessages();
      }
    });

    return () => unsubscribe();
  }, [tableId]);

  /**
   * Gửi tin nhắn mới
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
      
      if (response && response.success) {
        // Thêm tin nhắn vào danh sách cục bộ để hiển thị ngay
        setMessages(prev => [...prev, response.data]);
        return { success: true };
      }
      
      return { success: false, error: 'Gửi tin nhắn thất bại' };
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
