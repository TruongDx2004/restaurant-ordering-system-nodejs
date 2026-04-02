import { useRef, useState, useEffect, useCallback } from 'react';
import { messageApi, invoiceApi, paymentApi } from '../../../../api';
import { webSocketService } from '../../../../services/webSocketService';

/**
 * Custom hook for employee inbox management
 * Tối ưu hóa việc lấy dữ liệu hội thoại kèm lastMessage
 */
export const useEmployeeInbox = () => {
  const [conversations, setConversations] = useState([]);
  const [activeTable, setActiveTable] = useState(null);
  const [activeInvoiceId, setActiveInvoiceId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState({ list: true, chat: false });
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const activeTableRef = useRef(activeTable);

  /**
   * Lấy danh sách hội thoại kèm tin nhắn cuối cùng (lastMessage)
   */
  const fetchConversations = useCallback(async () => {
    try {
      const response = await messageApi.getConversations();
      if (response.success) {
        setConversations(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Không thể tải danh sách hội thoại');
    } finally {
      setLoading(prev => ({ ...prev, list: false }));
    }
  }, []);

  /**
   * Lấy lịch sử tin nhắn của một bàn cụ thể
   */
  const fetchMessages = useCallback(async (tableId) => {
    if (!tableId) return;

    setLoading(prev => ({ ...prev, chat: true }));
    try {
      const response = await messageApi.getByTable(tableId);
      if (response.success) {
        // API Backend đã sắp xếp theo thời gian ASC
        setMessages(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Không thể tải tin nhắn');
    } finally {
      setLoading(prev => ({ ...prev, chat: false }));
    }
  }, []);

  // Cập nhật ref để dùng trong WebSocket
  useEffect(() => {
    activeTableRef.current = activeTable;
  }, [activeTable]);

  // Đăng ký nhận tin nhắn mới qua WebSocket
  useEffect(() => {
    const unsubscribe = webSocketService.subscribe('/topic/employee/chat', (message) => {
      const currentTable = activeTableRef.current;

      // Nếu đang mở chat của bàn này thì tải lại tin nhắn
      if (message.tableId === currentTable?.id || message.tableId == currentTable?.id) {
        fetchMessages(currentTable.id);
      }

      // Luôn cập nhật lastMessage trong danh sách hội thoại
      setConversations(prev => prev.map(conv => {
        if (conv.id === message.tableId || conv.id == message.tableId) {
          return {
            ...conv,
            sender: message.sender,
            lastMessage: message.content,
            unreadCount: (message.tableId === currentTable?.id) ? 0 : (conv.unreadCount + 1)
          };
        }
        return conv;
      }));
    });

    return () => unsubscribe();
  }, [fetchMessages]);

  // Tải danh sách lần đầu
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Tải tin nhắn và invoiceId khi chọn bàn
  useEffect(() => {
    if (activeTable) {
      fetchMessages(activeTable.id);

      const getActiveInvoice = async () => {
        try {
          const response = await invoiceApi.getActiveInvoice(activeTable.id);
          if (response && response.success && response.data) {
            setActiveInvoiceId(response.data.id);
          } else {
            setActiveInvoiceId(null);
          }
        } catch (err) {
          setActiveInvoiceId(null);
        }
      };
      getActiveInvoice();
    } else {
      setActiveInvoiceId(null);
    }
  }, [activeTable, fetchMessages]);

  const markAsRead = (tableId) => {
    setConversations(prev =>
      prev.map(c => c.id === tableId ? { ...c, unreadCount: 0 } : c)
    );
  };

  const refreshChat = useCallback(() => {
    if (activeTable) fetchMessages(activeTable.id);
  }, [activeTable, fetchMessages]);

  const sendMessage = async (content, type = 'TEXT') => {
    if (!content.trim() || !activeTable || sending) return;

    setSending(true);
    try {
      const messageData = {
        tableId: activeTable.id,
        invoiceId: activeInvoiceId,
        content: content,
        messageType: type,
        sender: 'STAFF'
      };

      const response = await messageApi.create(messageData);

      if (response && response.success) {
        setMessages(prev => [...prev, response.data]);

        // Cập nhật ngay lastMessage cho chính mình và senderTag
        setConversations(prev => prev.map(c =>
          c.id === activeTable.id ? { ...c, lastMessage: response.data.content, sender: 'STAFF' } : c
        )); 

        return { success: true };
        }
      return { success: false, error: 'Phản hồi không hợp lệ' };
      } catch (err) {
        console.error('Error sending message:', err);
        return { success: false, error: 'Gửi thất bại' };
      } finally {
        setSending(false);
      }
    };

    const confirmPayment = async (invoiceId) => {
      try {
        const response = await paymentApi.confirmByInvoice(invoiceId);
        if (response.success) {
          await sendMessage('Nhân viên đã xác nhận thanh toán tiền mặt. Cảm ơn quý khách!', 'SYSTEM');
          refreshChat();
          fetchConversations();
          return { success: true };
        }
        return { success: false, error: response.message };
      } catch (err) {
        return { success: false, error: err.message };
      }
    };

    return {
      conversations,
      activeTable,
      setActiveTable,
      messages,
      loading,
      error,
      sending,
      sendMessage,
      confirmPayment,
      markAsRead,
      refreshList: fetchConversations,
      refreshChat
    };
  };
