import React, { useState, useEffect, useRef } from 'react';
import { useMessages } from './hooks/useMessages';
import storage from '../../../utils/storage';
import styles from './index.module.css';

/**
 * Customer Messaging Component
 * Allows real-time interaction between customer and staff
 */
export const Messages = ({ onClose }) => {
  const [tableNumber, setTableNumber] = useState(storage.getTableNumber());
  const [invoiceId, setInvoiceId] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const chatAreaRef = useRef(null);

  // Try to get current invoiceId from storage
  useEffect(() => {
    const cachedInvoice = storage.getItem('currentInvoice');
    if (cachedInvoice && cachedInvoice.id) {
      setInvoiceId(cachedInvoice.id);
    }
  }, []);

  const {
    messages,
    loading,
    error,
    sending,
    sendMessage,
    callStaff,
    requestBill
  } = useMessages(tableNumber, invoiceId);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || sending) return;

    const result = await sendMessage(inputValue);
    if (result.success) {
      setInputValue('');
    }
  };

  const handleQuickAction = async (text, type = 'NORMAL') => {
    await sendMessage(text, type);
  };

  const formatTime = (dateString) => {
    if (!dateString) return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const quickActions = [
    { text: 'Gọi nhân viên', type: 'CALL_WAITER' },
    { text: 'Thêm đồ ăn kèm', type: 'QUICK_ACTION' },
    { text: 'Thêm nước đá', type: 'QUICK_ACTION' },
    { text: 'Thêm khăn giấy', type: 'QUICK_ACTION' },
    { text: 'Đổi bàn', type: 'QUICK_ACTION' }
  ];

  const getMessageClass = (msg) => {
    if (msg.sender === 'SYSTEM') return styles.systemMessage;
    return msg.sender === 'CUSTOMER' ? styles.customerMessage : styles.staffMessage;
  };

  const getBubbleClass = (msg) => {
    if (msg.sender === 'SYSTEM') return styles.systemBubble;
    const baseClass = msg.sender === 'CUSTOMER' ? styles.customerBubble : styles.staffBubble;
    return msg.messageType !== 'TEXT' ? `${baseClass} ${styles.specialAction}` : baseClass;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h2 className={styles.headerTitle}>Hỗ trợ bàn {tableNumber}</h2>
        <button className={styles.callStaffBtn} onClick={() => callStaff()}>
          <i className="fas fa-bell"></i> Gọi NV
        </button>
      </header>

      {/* Chat Area */}
      <div className={styles.chatArea} ref={chatAreaRef}>
        {!invoiceId ? (
          <div className={styles.emptyChat}>
            <div className={styles.emptyIcon}>
              <i className="fas fa-receipt"></i>
            </div>
            <p>Vui lòng đặt món để bắt đầu hỗ trợ trực tuyến</p>
          </div>
        ) : loading && messages.length === 0 ? (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
            <p>Đang tải tin nhắn...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className={styles.emptyChat}>
            <div className={styles.emptyIcon}>
              <i className="fas fa-comments"></i>
            </div>
            <p>Gửi tin nhắn để bắt đầu trò chuyện với chúng tôi</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={msg.id || idx} className={`${styles.messageWrapper} ${getMessageClass(msg)}`}>
              <div className={`${styles.messageBubble} ${getBubbleClass(msg)}`}>
                {msg.content}
              </div>
              <div className={styles.messageTime}>
                {formatTime(msg.createdAt)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className={styles.inputArea}>
        <div className={styles.quickActions}>
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              className={styles.quickActionBtn}
              onClick={() => handleQuickAction(action.text, action.type)}
              disabled={!invoiceId}
            >
              {action.text}
            </button>
          ))}
        </div>

        <form className={styles.form} onSubmit={handleSend}>
          <input
            type="text"
            className={styles.input}
            placeholder={invoiceId ? "Nhập nội dung tin nhắn..." : "Chưa có hóa đơn tại bàn..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={sending || !invoiceId}
          />
          <button type="submit" className={styles.sendBtn} disabled={!inputValue.trim() || sending || !invoiceId}>
            {sending ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-paper-plane"></i>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Messages;
