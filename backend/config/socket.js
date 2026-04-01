const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] Client kết nối: ${socket.id}`);

    // Join room for specific table
    socket.on("join-table", (tableId) => {
      socket.join(`table-${tableId}`);
      console.log(`[Socket] Client vào room: table-${tableId}`);
    });

    // Join room for specific user
    socket.on("join-user", (userId) => {
      socket.join(`user-${userId}`);
      console.log(`[Socket] Client vào room: user-${userId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Client ngắt kết nối: ${socket.id}`);
    });
  });

  console.log("[Socket] khởi động thành công")

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io chưa được khởi tạo!");
  }
  return io;
};

module.exports = { initSocket, getIO };
