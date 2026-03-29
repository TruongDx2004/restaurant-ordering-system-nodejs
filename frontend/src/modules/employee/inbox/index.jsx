import React, { useState, useRef, useEffect } from 'react';
import { useEmployeeInbox } from './hooks/useEmployeeInbox';
import styles from './index.module.css';

/**
 * Employee Inbox Component
 * High-performance messaging interface for staff
 */
const EmployeeInbox = () => {
  const {
    conversations,
    activeTable,
    setActiveTable,
    messages,
    loading,
    sending,
    sendMessage,
    refreshChat
  } = useEmployeeInbox();

  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState('');
  const messageAreaRef = useRef(null);

  // Auto scroll to bottom whenever messages change
  useEffect(() => {
    if (messageAreaRef.current) {
      const scrollHeight = messageAreaRef.current.scrollHeight;
      const height = messageAreaRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      messageAreaRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }, [messages]);

  const filteredConversations = conversations.filter(conv => 
    conv.tableNumber.toString().includes(searchTerm)
  );

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || sending) return;

    const result = await sendMessage(inputValue);
    if (result.success) {
      setInputValue('');
    }
  };

  const handleQuickReply = (text) => {
    setInputValue(text);
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const quickReplies = [
    "Dạ vâng, em đến ngay ạ!",
    "Nhà hàng đã nhận được yêu cầu của anh/chị.",
    "Món ăn của mình đang được chuẩn bị ạ.",
    "Dạ, em mang thêm nước đá cho mình ngay.",
    "Chúc anh/chị ngon miệng!"
  ];

  return (
    <div className={styles.container}>
      {/* Sidebar - Conversation List */}
      <aside className={`${styles.sidebar} ${activeTable ? styles.sidebarHidden : ''}`}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.sidebarTitle}>Hội thoại</h1>
          <div className={styles.searchWrapper}>
            <i className={`fas fa-search ${styles.searchIcon}`}></i>
            <input 
              type="text" 
              placeholder="Tìm số bàn..." 
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.conversationList}>
          {loading.list ? (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinner}></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Không tìm thấy bàn nào</p>
            </div>
          ) : (
            filteredConversations.map(conv => (
              <div 
                key={conv.id} 
                className={`${styles.conversationItem} ${activeTable?.id === conv.id ? styles.activeItem : ''}`}
                onClick={() => setActiveTable(conv)}
              >
                <div className={styles.tableAvatar}>{conv.tableNumber}</div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemHeader}>
                    <span className={styles.tableName}>Bàn {conv.tableNumber}</span>
                    <span className={styles.lastTime}></span>
                  </div>
                  <div className={styles.itemFooter}>
                    <span className={styles.lastMsg}>{conv.lastMessage}</span>
                    {conv.unreadCount > 0 && (
                      <span className={styles.unreadBadge}>{conv.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Window */}
      <main className={styles.chatWindow}>
        {activeTable ? (
          <>
            {/* Chat Header */}
            <header className={styles.chatHeader}>
              <div className={styles.activeUserInfo}>
                <button 
                  className={styles.mobileBack}
                  onClick={() => setActiveTable(null)}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <div className={styles.tableAvatar}>{activeTable.tableNumber}</div>
                <div>
                  <h2 className={styles.activeTableName}>Bàn {activeTable.tableNumber}</h2>
                  <div className={styles.activeStatus}>
                    <span className={styles.statusDot}></span>
                    Đang hoạt động
                  </div>
                </div>
              </div>
              <div className={styles.chatActions}>
                <button className={styles.actionBtn} onClick={refreshChat}>
                  <i className="fas fa-sync-alt"></i>
                </button>
              </div>
            </header>

            {/* Messages Area */}
            <div className={styles.messageArea} ref={messageAreaRef}>
              {loading.chat && messages.length === 0 ? (
                <div className={styles.loadingOverlay}>
                  <div className={styles.spinner}></div>
                </div>
              ) : messages.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <i className="fas fa-comments"></i>
                  </div>
                  <p>Chưa có tin nhắn nào. Hãy bắt đầu hỗ trợ khách hàng!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isStaff = msg.sender === 'STAFF';
                  const isSystem = msg.sender === 'SYSTEM';
                  
                  return (
                    <div 
                      key={msg.id || idx} 
                      className={`${styles.messageRow} ${
                        isStaff ? styles.myMessageRow : 
                        isSystem ? styles.systemRow : styles.theirMessageRow
                      }`}
                    >
                      <div className={`${styles.messageBubble} ${
                        isStaff ? styles.myBubble : 
                        isSystem ? styles.systemBubble : styles.theirBubble
                      }`}>
                        {msg.content}
                        <div className={styles.msgTime}>{formatTime(msg.createdAt)}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Area */}
            <div className={styles.inputArea}>
              <div className={styles.quickReplies}>
                {quickReplies.map((reply, idx) => (
                  <button 
                    key={idx} 
                    className={styles.replyBtn}
                    onClick={() => handleQuickReply(reply)}
                  >
                    {reply}
                  </button>
                ))}
              </div>
              <form className={styles.inputWrapper} onSubmit={handleSend}>
                <input 
                  type="text" 
                  className={styles.messageInput}
                  placeholder="Aa"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={sending}
                />
                <button 
                  type="submit" 
                  className={styles.sendButton}
                  disabled={!inputValue.trim() || sending}
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <i className="fab fa-facebook-messenger"></i>
            </div>
            <h2>Chào mừng bạn đến với mục hỗ trợ khách hàng</h2>
            <p>Chọn một bàn từ danh sách bên trái để bắt đầu nhắn tin.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmployeeInbox;
