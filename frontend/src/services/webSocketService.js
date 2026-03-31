import { io } from 'socket.io-client';

/**
 * WebSocket Service (Socket.io version)
 * Quản lý kết nối WebSocket cho real-time updates sử dụng Socket.io client
 */

class WebSocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.subscriptions = new Map(); // topic -> callback list
    this.topicToEventMap = {
      '/topic/notifications': 'notifications',
      '/topic/orders': 'orders',
      '/topic/table-status': 'table-status',
      '/topic/payments': 'payments',
      '/topic/orders/status': 'order-item-status',
      '/queue/notifications': 'user-notifications',
      '/topic/employee/chat': 'employee-chat',
    };
    
    // Convert VITE_API_BASE_URL (http://...) to WebSocket URL (ws://...) if needed
    // In Socket.io, it usually handles the protocol itself, so http://localhost:8080 is fine
    this.baseUrl = import.meta.env.VITE_API_BASE_URL 
      ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
      : 'http://localhost:8080';
  }

  /**
   * Kết nối đến WebSocket server
   */
  connect() {
    if (this.socket) return;

    console.log('[Socket.io] Connecting to:', this.baseUrl);
    this.socket = io(this.baseUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket.io] Connected with ID:', this.socket.id);
      this.connected = true;
      
      // Re-subscribe to all existing topics
      this.subscriptions.forEach((callbacks, topic) => {
        this._setupSocketEvent(topic);
      });
    });

    this.socket.on('disconnect', () => {
      console.log('[Socket.io] Disconnected');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket.io] Connection Error:', error);
    });
  }

  /**
   * Subscribe vào một topic (Hỗ trợ syntax cũ của STOMP)
   * @param {string} topic - Ví dụ: /topic/orders/status
   * @param {function} callback - Hàm xử lý khi có tin nhắn
   */
  subscribe(topic, callback) {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, []);
      this._setupSocketEvent(topic);
    }
    this.subscriptions.get(topic).push(callback);

    // Trả về hàm để unsubscribe
    return () => this.unsubscribe(topic, callback);
  }

  /**
   * Hủy subscribe
   */
  unsubscribe(topic, callback) {
    if (this.subscriptions.has(topic)) {
      const callbacks = this.subscriptions.get(topic);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      
      if (callbacks.length === 0) {
        this.subscriptions.delete(topic);
        const eventName = this._mapTopicToEvent(topic);
        if (this.socket) {
            this.socket.off(eventName);
        }
      }
    }
  }

  /**
   * Gửi tin nhắn đến server (Hỗ trợ syntax cũ)
   */
  send(destination, body) {
    if (!this.socket || !this.connected) {
      console.warn('[Socket.io] Cannot send message, not connected');
      return;
    }

    // Mapping for special actions if needed
    if (destination.startsWith('/app/')) {
        const action = destination.replace('/app/', '');
        this.socket.emit(action, body);
    } else {
        this.socket.emit('message', { destination, body });
    }
  }
  
  /**
   * Helper để join vào room cụ thể
   */
  joinTable(tableId) {
      if (this.socket) {
          this.socket.emit('join-table', tableId);
      }
  }

  joinUser(userId) {
      if (this.socket) {
          this.socket.emit('join-user', userId);
      }
  }

  /**
   * Private: Thiết lập lắng nghe event từ socket dựa trên topic
   */
  _setupSocketEvent(topic) {
    if (!this.socket) return;

    const eventName = this._mapTopicToEvent(topic);
    
    // Tránh đăng ký nhiều lần cho cùng một eventName
    this.socket.off(eventName); 
    
    this.socket.on(eventName, (data) => {
      const callbacks = this.subscriptions.get(topic);
      if (callbacks) {
        callbacks.forEach(cb => cb(data));
      }
    });

    // Nếu là chat topic, cần join room
    if (topic.startsWith('/topic/chat/')) {
        const tableId = topic.split('/').pop();
        this.joinTable(tableId);
    }
  }

  /**
   * Private: Map STOMP topic sang Socket.io event name
   */
  _mapTopicToEvent(topic) {
    if (this.topicToEventMap[topic]) {
        return this.topicToEventMap[topic];
    }
    
    // Xử lý các topic động như /topic/chat/{tableId}
    if (topic.startsWith('/topic/chat/')) {
        return 'chat-message';
    }

    // Default: dùng luôn topic name làm event name
    return topic;
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;
