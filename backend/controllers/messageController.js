const { Message, Table, Invoice } = require("../schemas");
const socketHandler = require("../utils/socketHandler");
const { Op } = require("sequelize");

module.exports = {
    CreateMessage: async function (data) {
        const message = await Message.create(data);

        if (message.sender === "STAFF" || message.sender === "CUSTOMER") {
            socketHandler.sendMessageToTable(message.tableId, message.sender, message.content);
            socketHandler.sendMessageToStaff(message.tableId, message.sender, message.content);
        } else if (message.sender === "SYSTEM") {
            socketHandler.sendGlobalNotification("SYSTEM_MESSAGE", message.content, { tableId: message.tableId });
        }

        return message;
    },

    GetMessagesByTable: async function (tableId) {
        return await Message.findAll({
            where: { tableId },
            order: [["created_at", "ASC"]]
        });
    },

    GetConversations: async function () {
        const allTables = await Table.findAll({
            order: [["tableNumber", "ASC"]],
            include: [{
                model: Message,
                as: "messages",
                limit: 1,
                order: [["created_at", "DESC"]]
            }]
        });

        return allTables.map(table => {
            const lastMsg = table.messages && table.messages.length > 0 ? table.messages[0] : null;
            return {
                id: table.id,
                sender: lastMsg ? lastMsg.sender : null,
                tableNumber: table.tableNumber,
                status: table.status, // AVAILABLE, OCCUPIED, v.v.
                lastMessage: lastMsg ? lastMsg.content : "Chưa có tin nhắn",
                lastTime: lastMsg ? lastMsg.createdAt : null,
                unreadCount: 0
            };
        });
    },

    DeleteMessage: async function (id) {
        const message = await Message.findByPk(id);
        if (!message) throw new Error("Không tìm thấy tin nhắn");
        return await message.destroy();
    }
};
