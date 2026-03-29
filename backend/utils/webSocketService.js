const { getIO } = require('../config/socket');

/**
 * WebSocket Service - Quản lý việc gửi thông báo real-time
 * Tương đương với Spring WebSocket Service trong Java
 */
const WebSocketService = {
  /**
   * Send notification to all connected clients (/topic/notifications)
   */
  sendGlobalNotification: (type, content, data) => {
    const io = getIO();
    const message = {
      type,
      sender: "SYSTEM",
      content,
      data,
      timestamp: new Date()
    };
    io.emit("notifications", message);
    console.log(`[Socket] Sent global notification: ${content}`);
  },

  /**
   * Send new order notification to staff (/topic/orders)
   */
  sendNewOrderNotification: (orderId, tableId, content) => {
    const io = getIO();
    const message = {
      type: "NEW_ORDER",
      sender: "SYSTEM",
      content,
      orderId,
      tableId,
      timestamp: new Date()
    };
    io.emit("orders", message);
    console.log(`[Socket] Sent new order notification for table ${tableId}`);
  },

  /**
   * Send table status update (/topic/table-status)
   */
  sendTableStatusUpdate: (tableId, status, data) => {
    const io = getIO();
    const message = {
      type: "TABLE_STATUS_UPDATE",
      sender: "SYSTEM",
      content: `Table ${tableId} status: ${status}`,
      tableId,
      data,
      timestamp: new Date()
    };
    io.emit("table-status", message);
    console.log(`[Socket] Sent table status update for table ${tableId}`);
  },

  /**
   * Send message to specific table (/topic/chat/{tableId})
   */
  sendMessageToTable: (tableId, sender, content) => {
    const io = getIO();
    const message = {
      type: "CHAT_MESSAGE",
      sender,
      content,
      tableId,
      timestamp: new Date()
    };
    io.to(`table-${tableId}`).emit("chat-message", message);
    console.log(`[Socket] Sent message to table ${tableId}: ${content}`);
  },

  /**
   * Send notification to specific user (/queue/notifications)
   */
  sendNotificationToUser: (userId, type, content, data) => {
    const io = getIO();
    const message = {
      type,
      sender: "SYSTEM",
      content,
      data,
      timestamp: new Date()
    };
    io.to(`user-${userId}`).emit("user-notifications", message);
    console.log(`[Socket] Sent notification to user ${userId}: ${content}`);
  },

  /**
   * Broadcast payment notification (/topic/payments)
   */
  sendPaymentNotification: (invoiceId, tableId, status) => {
    const io = getIO();
    const message = {
      type: "PAYMENT_STATUS",
      sender: "SYSTEM",
      content: `Payment ${status} for table ${tableId}`,
      orderId: invoiceId,
      tableId,
      data: status,
      timestamp: new Date()
    };
    io.emit("payments", message);
    console.log(`[Socket] Sent payment notification for invoice ${invoiceId}`);
  },

  /**
   * Send invoice item status update (/topic/orders/status)
   */
  sendInvoiceItemStatusUpdate: (invoiceId, itemId, status) => {
    const io = getIO();
    const message = {
      type: "ITEM_STATUS_UPDATE",
      sender: "SYSTEM",
      content: `Item ${itemId} in order ${invoiceId} status: ${status}`,
      orderId: invoiceId,
      data: itemId,
      timestamp: new Date()
    };
    io.emit("order-item-status", message);
    console.log(`[Socket] Sent status update for item ${itemId} in order ${invoiceId}`);
  }
};

module.exports = WebSocketService;
