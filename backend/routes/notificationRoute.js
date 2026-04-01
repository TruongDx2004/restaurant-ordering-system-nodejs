const express = require("express");
const router = express.Router();
const controller = require("../controllers/notificationController");
const { checkLogin } = require("../utils/authHandler");
const { validate, notificationValidator } = require("../utils/validateHandler");

// RESTful routes
router.get("/", checkLogin, controller.getAllNotifications);
router.patch("/read-all", checkLogin, notificationValidator.markAll, validate, controller.markAllAsRead);
router.patch("/:id/read", checkLogin, notificationValidator.markAsRead, validate, controller.markAsRead);
router.patch("/:id/mark-read", checkLogin, notificationValidator.markAsRead, validate, controller.markAsRead);
router.delete("/:id", checkLogin, notificationValidator.delete, validate, controller.deleteNotification);

// Recipient routes
router.get("/recipient/:recipientType/:recipientId", checkLogin, notificationValidator.getByRecipient, validate, controller.getByRecipient);
router.get("/unread/:recipientType/:recipientId", checkLogin, notificationValidator.getUnread, validate, controller.getUnreadCount);

// Alias (frontend)
router.get("/recipient/ordered", checkLogin, controller.getByRecipient);
router.get("/recipient/unread-count", checkLogin, controller.getUnreadCount);
router.patch("/recipient/mark-all-read", checkLogin, notificationValidator.markAll, validate, controller.markAllAsRead);

module.exports = router;