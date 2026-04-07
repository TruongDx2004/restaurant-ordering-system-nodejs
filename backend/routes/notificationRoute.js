const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { checkLogin } = require("../utils/authHandler");
const responseHandler = require("../utils/responseHandler");
const { validate, notificationValidator } = require("../utils/validateHandler");

//GET api/notifications
router.get("/", checkLogin, notificationValidator.getAll, validate, async function (req, res, next) {
    try {
        const notifications = await notificationController.GetAllNotifications();
        return responseHandler.success(res, notifications, "Lấy danh sách thông báo thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

//GET api/notifications/recipient/ordered?recipientType=USER&recipientId=123
router.get("/recipient/ordered", checkLogin, notificationValidator.getByRecipient, validate, async function (req, res, next) {
    try {
        const { recipientType = "ALL", recipientId = null } = req.query;
        const notifications = await notificationController.GetByRecipient(recipientType, recipientId);
        return responseHandler.success(res, notifications, "Lấy thông báo thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

//GET api/notifications/recipient/unread-count?recipientType=USER&recipientId=123
router.get("/recipient/unread-count", checkLogin, notificationValidator.getUnread, validate, async function (req, res, next) {
    try {
        const { recipientType = "ALL", recipientId = null } = req.query;
        const count = await notificationController.GetUnreadCount(recipientType, recipientId);
        return responseHandler.success(res, count, "Đếm thông báo thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

//PATCH api/notifications/:id/mark-read
router.patch("/:id/mark-read", checkLogin, notificationValidator.markAsRead, validate, async function (req, res, next) {
    try {
        const updated = await notificationController.MarkAsRead(req.params.id);
        return responseHandler.success(res, updated, "Đánh dấu đã đọc thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

//PATCH api/notifications/recipient/mark-all-read
router.patch("/recipient/mark-all-read", checkLogin, notificationValidator.markAll, validate, async function (req, res, next) {
    try {
        const { recipientType = "ALL", recipientId = null } = req.body;
        const updated = await notificationController.MarkAllAsRead(recipientType, recipientId);
        return responseHandler.success(res, updated, "Tất cả thông báo đã được đánh dấu đọc");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

// Xóa thông báo
router.delete("/:id", checkLogin, notificationValidator.delete, validate, async function (req, res, next) {
    try {
        await notificationController.DeleteNotification(req.params.id);
        return responseHandler.success(res, null, "Xóa thông báo thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

module.exports = router;
