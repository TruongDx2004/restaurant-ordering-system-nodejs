import { io } from 'socket.io-client';

/**
 * WebSocket Service (Clean Version)
 */
class WebSocketService {
  constructor() {
    this.socket = null;
    this.connected = false;

    // topic -> [callbacks]
    this.subscriptions = new Map();

    // Map topic → event
    this.topicMap = {
      '/topic/notifications': 'notifications',
      '/topic/orders': 'orders',
      '/topic/table-status': 'table-status',
      '/topic/payments': 'payments',
      '/topic/orders/status': 'order-item-status',
      '/queue/notifications': 'user-notifications',
      '/topic/employee/chat': 'employee-chat',
    };

    this.baseUrl = import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
      : 'http://localhost:8080';
  }

  // ================= CONNECT =================
  connect() {
    if (this.socket) return;

    this.socket = io(this.baseUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('[WS] Connected:', this.socket.id);

      // re-subscribe
      this.subscriptions.forEach((_, topic) => {
        this._bindEvent(topic);
      });
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('[WS] Disconnected');
    });

    this.socket.on('connect_error', (err) => {
      console.error('[WS] Error:', err.message);
    });
  }

  // ================= SUBSCRIBE =================
  subscribe(topic, callback) {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, []);
      this._bindEvent(topic);
    }

    this.subscriptions.get(topic).push(callback);

    return () => this.unsubscribe(topic, callback);
  }

  unsubscribe(topic, callback) {
    const list = this.subscriptions.get(topic);
    if (!list) return;

    this.subscriptions.set(
      topic,
      list.filter(cb => cb !== callback)
    );

    if (this.subscriptions.get(topic).length === 0) {
      this.subscriptions.delete(topic);

      const event = this._getEvent(topic);
      this.socket?.off(event);
    }
  }

  // ================= SEND =================
  send(event, data) {
    if (!this.socket || !this.connected) return;
    this.socket.emit(event, data);
  }

  // ================= ROOMS =================
  joinTable(tableId) {
    this.socket?.emit('join-table', tableId);
  }

  joinUser(userId) {
    this.socket?.emit('join-user', userId);
  }

  // ================= PRIVATE =================
  _bindEvent(topic) {
    if (!this.socket) return;

    const event = this._getEvent(topic);

    this.socket.off(event); // tránh duplicate

    this.socket.on(event, (data) => {
      const callbacks = this.subscriptions.get(topic) || [];
      callbacks.forEach(cb => cb(data));
    });

    // auto join room nếu là chat
    if (topic.startsWith('/topic/chat/')) {
      const tableId = topic.split('/').pop();
      this.joinTable(tableId);
    }
  }

  _getEvent(topic) {
    if (this.topicMap[topic]) return this.topicMap[topic];

    if (topic.startsWith('/topic/chat/')) return 'chat-message';

    return topic;
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;