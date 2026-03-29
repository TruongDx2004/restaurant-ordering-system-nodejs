import { useState, useEffect, useCallback } from 'react';
import { messageApi, tableApi, invoiceApi } from '../../../../api';

/**
 * Custom hook for employee inbox management
 */
export const useEmployeeInbox = () => {
  const [conversations, setConversations] = useState([]);
  const [activeTable, setActiveTable] = useState(null);
  const [activeInvoiceId, setActiveInvoiceId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState({ list: true, chat: false });
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  /**
   * Fetch all tables that have messages or are active
   */
  const fetchConversations = useCallback(async () => {
    try {
      const tablesResponse = await tableApi.getAllTables();
      if (!tablesResponse.success) return;

      const tables = tablesResponse.data || [];
      
      const conversationsData = tables.map(table => ({
        id: table.id,
        tableNumber: table.tableNumber,
        status: table.status,
        lastMessage: 'Xem chi tiết hội thoại',
        unreadCount: 0,
        type: 'NORMAL'
      }));

      setConversations(conversationsData);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Không thể tải danh sách hội thoại');
    } finally {
      setLoading(prev => ({ ...prev, list: false }));
    }
  }, []);

  /**
   * Fetch messages for a specific table
   */
  const fetchMessages = useCallback(async (tableId) => {
    if (!tableId) return;
    
    setLoading(prev => ({ ...prev, chat: true }));
    try {
      const response = await messageApi.getByTableOrdered(tableId);
      if (response.success) {
        // Ensure newest messages are at the bottom (Sort by date ASC)
        const sortedMessages = (response.data || []).sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        setMessages(sortedMessages);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Không thể tải tin nhắn');
    } finally {
      setLoading(prev => ({ ...prev, chat: false }));
    }
  }, []);

  // Initial fetch only - removed intervals as requested
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages and active invoice when active table changes
  useEffect(() => {
    if (activeTable) {
      fetchMessages(activeTable.id);
      
      // Fetch current active invoice to link staff messages
      const getActiveInvoice = async () => {
        try {
          const response = await invoiceApi.getActiveInvoice(activeTable.id);
          if (response && response.success && response.data) {
            setActiveInvoiceId(response.data.id);
          } else {
            setActiveInvoiceId(null);
          }
        } catch (err) {
          console.error('Error getting active invoice:', err);
          setActiveInvoiceId(null);
        }
      };
      getActiveInvoice();
    } else {
      setActiveInvoiceId(null);
    }
  }, [activeTable, fetchMessages]);

  /**
   * Send message to a table
   */
  const sendMessage = async (content, type = 'TEXT') => {
    if (!content.trim() || !activeTable || sending) return;

    setSending(true);
    try {
      const messageData = {
        tableId: activeTable.id,
        invoiceId: activeInvoiceId, // Include active invoice ID so customers see the reply
        content: content,
        messageType: type,
        sender: 'STAFF'
      };

      const response = await messageApi.create(messageData);
      
      // Handle ApiResponse structure { success, data, message }
      if (response && response.success && response.data) {
        setMessages(prev => [...prev, response.data]);
        return { success: true };
      } else if (response && response.id) {
        // Fallback if interceptor returns data directly
        setMessages(prev => [...prev, response]);
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

  return {
    conversations,
    activeTable,
    setActiveTable,
    messages,
    loading,
    error,
    sending,
    sendMessage,
    refreshList: fetchConversations,
    refreshChat: () => fetchMessages(activeTable?.id)
  };
};
