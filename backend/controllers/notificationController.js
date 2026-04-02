const Notification = require("../schemas/notificationSchema");
const { Op } = require("sequelize");
const webSocketService = require("../utils/socketHandler");

module.exports = {
    // Lấy tất cả thông báo (ADMIN)
    GetAllNotifications: async function () {
        return await Notification.findAll({
            order: [["created_at", "DESC"]]
        });
    },

    // Lấy thông báo theo người nhận
    GetByRecipient: async function (recipientType, recipientId) {
        return await Notification.findAll({
            where: {
                [Op.or]: [
                    { recipientType: "ALL" },
                    {
                        [Op.and]: [
                            { recipientType },
                            { recipientId }
                        ]
                    }
                ]
            },
            order: [["created_at", "DESC"]]
        });
    },

    // Đếm số thông báo chưa đọc
    GetUnreadCount: async function (recipientType, recipientId) {
        return await Notification.count({
            where: {
                isRead: false,
                [Op.or]: [
                    { recipientType: "ALL" },
                    {
                        [Op.and]: [
                            { recipientType },
                            { recipientId }
                        ]
                    }
                ]
            }
        });
    },

    // Đánh dấu một thông báo là đã đọc
    MarkAsRead: async function (id) {
        const notification = await Notification.findByPk(id);
        if (!notification) throw new Error("id not found");
        return await notification.update({ isRead: true });
    },

    // Đánh dấu tất cả thông báo của người nhận là đã đọc
    MarkAllAsRead: async function (recipientType, recipientId) {
        return await Notification.update(
            { isRead: true },
            {
                where: {
                    isRead: false,
                    [Op.or]: [
                        { recipientType: "ALL" },
                        {
                            [Op.and]: [
                                { recipientType },
                                { recipientId }
                            ]
                        }
                    ]
                }
            }
        );
    },

    // Xóa thông báo
    DeleteNotification: async function (id) {
        const notification = await Notification.findByPk(id);
        if (!notification) throw new Error("id not found");
        return await notification.destroy();
    },

    // Helper function để tạo và gửi thông báo (dùng trong code)
    createAndSend: async function (data) {
        const notification = await Notification.create(data);

        // Phát qua WebSocket tới kênh chung notifications
        webSocketService.sendGlobalNotification(data.type, data.message, {
            ...data.data,
            id: notification.id,
            createdAt: notification.createdAt,
            type: data.type,
            title: data.title
        });

        return notification;
    }
};
