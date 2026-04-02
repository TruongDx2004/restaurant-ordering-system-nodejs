const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { checkLogin } = require("../utils/authHandler");
const responseHandler = require("../utils/responseHandler");

// Lấy tất cả thông báo (ADMIN)
router.get("/", checkLogin, async function (req, res, next) {
    try {
        const notifications = await notificationController.GetAllNotifications();
        return responseHandler.success(res, notifications, "Lấy danh sách thông báo thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

// Lấy thông báo theo người nhận (Dùng req.query thay vì params để khớp frontend call)
router.get("/recipient/ordered", checkLogin, async function (req, res, next) {
    try {
        const { recipientType, recipientId } = req.query;
        const notifications = await notificationController.GetByRecipient(recipientType, recipientId);
        return responseHandler.success(res, notifications, "Lấy thông báo thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

// Đếm số thông báo chưa đọc
router.get("/recipient/unread-count", checkLogin, async function (req, res, next) {
    try {
        const { recipientType, recipientId } = req.query;
        const count = await notificationController.GetUnreadCount(recipientType, recipientId);
        return responseHandler.success(res, count, "Đếm thông báo thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

// Đánh dấu một thông báo là đã đọc
router.patch("/:id/mark-read", checkLogin, async function (req, res, next) {
    try {
        const updated = await notificationController.MarkAsRead(req.params.id);
        return responseHandler.success(res, updated, "Đánh dấu đã đọc thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

// Đánh dấu tất cả là đã đọc
router.patch("/recipient/mark-all-read", checkLogin, async function (req, res, next) {
    try {
        const { recipientType, recipientId } = req.body; // Frontend gửi qua Body trong PATCH call
        await notificationController.MarkAllAsRead(recipientType, recipientId);
        return responseHandler.success(res, null, "Tất cả thông báo đã được đánh dấu đọc");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

// Xóa thông báo
router.delete("/:id", checkLogin, async function (req, res, next) {
    try {
        await notificationController.DeleteNotification(req.params.id);
        return responseHandler.success(res, null, "Xóa thông báo thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

module.exports = router;
