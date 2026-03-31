const Notification = require("../schemas/notificationSchema");
const responseHandler = require("../utils/responseHandler");

// ================= CREATE =================
exports.createNotification = async (req, res, next) => {
  try {
    const notification = await Notification.create(req.body);
    return responseHandler.success(res, notification, "Created");
  } catch (err) {
    next(err);
  }
};

// ================= GET BY ID =================
exports.getNotificationById = async (req, res, next) => {
  try {
    const data = await Notification.findByPk(req.params.id);

    if (!data) {
      return responseHandler.error(res, "Not found", 404);
    }

    return responseHandler.success(res, data);
  } catch (err) {
    next(err);
  }
};

// ================= GET ALL =================
exports.getAllNotifications = async (req, res, next) => {
  try {
    const list = await Notification.findAll();
    return responseHandler.success(res, list);
  } catch (err) {
    next(err);
  }
};

// ================= UPDATE =================
exports.updateNotification = async (req, res, next) => {
  try {
    const data = await Notification.findByPk(req.params.id);

    if (!data) {
      return responseHandler.error(res, "Not found", 404);
    }

    await data.update(req.body);

    return responseHandler.success(res, data, "Updated");
  } catch (err) {
    next(err);
  }
};

// ================= DELETE =================
exports.deleteNotification = async (req, res, next) => {
  try {
    const data = await Notification.findByPk(req.params.id);

    if (!data) {
      return responseHandler.error(res, "Not found", 404);
    }

    await data.destroy();

    return responseHandler.success(res, null, "Deleted");
  } catch (err) {
    next(err);
  }
};

// ================= FILTER =================

// by recipient
exports.getByRecipient = async (req, res, next) => {
  try {
    const { recipientType, recipientId } = req.query;

    const list = await Notification.findAll({
      where: { recipientType, recipientId }
    });

    return responseHandler.success(res, list);
  } catch (err) {
    next(err);
  }
};

// unread
exports.getUnreadByRecipient = async (req, res, next) => {
  try {
    const { recipientType, recipientId } = req.query;

    const list = await Notification.findAll({
      where: {
        recipientType,
        recipientId,
        read: false
      }
    });

    return responseHandler.success(res, list);
  } catch (err) {
    next(err);
  }
};

// ordered
exports.getByRecipientOrdered = async (req, res, next) => {
  try {
    const { recipientType, recipientId } = req.query;

    const list = await Notification.findAll({
      where: { recipientType, recipientId },
      order: [["createdAt", "DESC"]]
    });

    return responseHandler.success(res, list);
  } catch (err) {
    next(err);
  }
};

// count unread
exports.countUnread = async (req, res, next) => {
  try {
    const { recipientType, recipientId } = req.query;

    const count = await Notification.count({
      where: {
        recipientType,
        recipientId,
        read: false
      }
    });

    return responseHandler.success(res, count);
  } catch (err) {
    next(err);
  }
};

// ================= MARK READ =================

exports.markAsRead = async (req, res, next) => {
  try {
    const data = await Notification.findByPk(req.params.id);

    if (!data) {
      return responseHandler.error(res, "Not found", 404);
    }

    await data.update({ read: true });

    return responseHandler.success(res, data, "Marked as read");
  } catch (err) {
    next(err);
  }
};

// mark all
exports.markAllAsRead = async (req, res, next) => {
  try {
    const { recipientType, recipientId } = req.body;

    await Notification.update(
      { read: true },
      {
        where: { recipientType, recipientId }
      }
    );

    return responseHandler.success(res, null, "All marked as read");
  } catch (err) {
    next(err);
  }
};

// ================= SEND =================

exports.sendNotification = async (req, res, next) => {
  try {
    const { recipientType, recipientId, title, message } = req.body;

    const data = await Notification.create({
      recipientType,
      recipientId,
      title,
      message
    });

    return responseHandler.success(res, data, "Sent");
  } catch (err) {
    next(err);
  }
};