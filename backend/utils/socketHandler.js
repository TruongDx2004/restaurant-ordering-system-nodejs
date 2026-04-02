const { Server } = require('socket.io');
const User = require('../schemas/userSchema');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'restaurant_secret';

let io;

module.exports = {
    SocketServer: function (server) {
        io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        io.on('connection', async (socket) => {
            console.log(`[Socket] Client kết nối: ${socket.id}`);
            let userId;

            try {
                let token = socket.handshake.auth?.token;
                if (token) {
                    let result = jwt.verify(token, SECRET);
                    if (result.exp * 1000 > Date.now()) {
                        let user = await User.findByPk(result.id);
                        if (user) {
                            userId = user.id;
                            socket.emit('welcome', user.name);
                            socket.join(`user-${userId}`);
                        }
                    }
                }
            } catch (err) {
                console.log("[Socket] Auth error:", err.message);
            }

            socket.on('join-table', (tableId) => {
                socket.join(`table-${tableId}`);
            });

            socket.on('user', (data) => {
                socket.join(data);
                if (userId) socket.join(`user-${userId}`);
            });

            socket.on('newMessage', (data) => {
                console.log(data);
                io.to(`user-${data.from}`).emit('newMessage', data);
                io.to(`user-${data.to}`).emit('newMessage', data);
            });

            socket.on('disconnect', () => {
                console.log(`[Socket] Client ngắt kết nối: ${socket.id}`);
            });
        });

        console.log("[Socket] Khởi động thành công");
    },

    sendGlobalNotification: (type, message, data) => {
        if (io) io.emit("notifications", { type, message, data, timestamp: new Date() });
    },

    sendNewOrderNotification: (orderId, tableId, content) => {
        if (io) io.emit("orders", { type: "NEW_ORDER", orderId, tableId, content, timestamp: new Date() });
    },

    sendTableStatusUpdate: (tableId, status, data) => {
        if (io) io.emit("table-status", { type: "TABLE_STATUS_UPDATE", tableId, status, data, timestamp: new Date() });
    },

    sendMessageToTable: (tableId, sender, content) => {
        if (io) io.to(`table-${tableId}`).emit("chat-message", { sender, content, tableId, timestamp: new Date() });
    },

    sendNotificationToUser: (userId, type, message, data) => {
        if (io) io.to(`user-${userId}`).emit("user-notifications", { type, message, data, timestamp: new Date() });
    },

    sendPaymentNotification: (invoiceId, tableId, status) => {
        if (io) io.emit("payments", { type: "PAYMENT_STATUS", invoiceId, tableId, data: status, timestamp: new Date() });
    },

    sendInvoiceItemStatusUpdate: (invoiceId, itemId, status) => {
        if (io) io.emit("order-item-status", { type: "ITEM_STATUS_UPDATE", invoiceId, itemId, status, timestamp: new Date() });
    },

    sendMessageToStaff: (tableId, sender, content) => {
        if (io) io.emit("employee-chat", { sender, content, tableId, timestamp: new Date() });
    }
};
