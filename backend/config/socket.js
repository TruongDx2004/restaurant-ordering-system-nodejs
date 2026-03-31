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
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join room for specific table
    socket.on("join-table", (tableId) => {
      socket.join(`table-${tableId}`);
      console.log(`[Socket] Client joined table room: table-${tableId}`);
    });

    // Join room for specific user
    socket.on("join-user", (userId) => {
      socket.join(`user-${userId}`);
      console.log(`[Socket] Client joined user room: user-${userId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  console.log("[Socket] khởi động thành công")

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIO };
