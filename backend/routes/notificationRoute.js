const express = require("express");
const router = express.Router();

const controller = require("../controllers/notificationController");
const { verifyToken } = require("../utils/authMiddleware");

// CRUD
router.post("/", verifyToken, controller.createNotification);
router.get("/", verifyToken, controller.getAllNotifications);
router.get("/:id", verifyToken, controller.getNotificationById);
router.put("/:id", verifyToken, controller.updateNotification);
router.delete("/:id", verifyToken, controller.deleteNotification);

// FILTER
router.get("/recipient/list", verifyToken, controller.getByRecipient);
router.get("/recipient/unread", verifyToken, controller.getUnreadByRecipient);
router.get("/recipient/ordered", verifyToken, controller.getByRecipientOrdered);
router.get("/recipient/unread-count", verifyToken, controller.countUnread);

// ACTION
router.patch("/:id/mark-read", verifyToken, controller.markAsRead);
router.patch("/recipient/mark-all-read", verifyToken, controller.markAllAsRead);

// SEND
router.post("/send", verifyToken, controller.sendNotification);

module.exports = router;