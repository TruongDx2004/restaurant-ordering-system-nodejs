const Notification = require("../schemas/notificationSchema");
const { Op } = require("sequelize");
const webSocketService = require("../utils/socketHandler");

module.exports = {
    GetAllNotifications: async function () {
        return await Notification.findAll({
            order: [["created_at", "DESC"]]
        });
    },

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

    MarkAsRead: async function (id) {
        const notification = await Notification.findByPk(id);
        if (!notification) throw new Error("id not found");
        return await notification.update({ isRead: true });
    },

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

    DeleteNotification: async function (id) {
        const notification = await Notification.findByPk(id);
        if (!notification) throw new Error("id not found");
        return await notification.destroy();
    },

    createAndSend: async function (data) {
        const notification = await Notification.create(data);

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
