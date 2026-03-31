const Notification = require("../schemas/notificationSchema");
const responseHandler = require("../utils/responseHandler");
const webSocketService = require("../utils/webSocketService");
const { Op } = require("sequelize");

exports.getAllNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      order: [["created_at", "DESC"]]
    });
    return responseHandler.success(res, notifications);
  } catch (err) {
    next(err);
  }
};

exports.getByRecipient = async (req, res, next) => {
  try {
    const { recipientType, recipientId } = req.params;
    
    // Lấy thông báo theo ID cụ thể HOẶC thông báo dành cho tất cả (ALL)
    const notifications = await Notification.findAll({
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
    return responseHandler.success(res, notifications);
  } catch (err) {
    next(err);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const { recipientType, recipientId } = req.params;
    const count = await Notification.count({
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
    return responseHandler.success(res, count);
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (notification) {
      await notification.update({ isRead: true });
    }
    return responseHandler.success(res, notification);
  } catch (err) {
    next(err);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    const { recipientType, recipientId } = req.query;
    await Notification.update(
      { isRead: true },
      { 
        where: { 
          isRead: false,
          [Op.or]: [
            { recipientType: "ALL" },
            { recipientType, recipientId }
          ]
        } 
      }
    );
    return responseHandler.success(res, null, "All marked as read");
  } catch (err) {
    next(err);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.destroy({ where: { id: req.params.id } });
    return responseHandler.success(res, null, "Deleted");
  } catch (err) {
    next(err);
  }
};

// Helper function to create notification from other controllers
exports.createAndSend = async (data) => {
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
};
