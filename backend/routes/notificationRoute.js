const express = require("express");
const router = express.Router();
const controller = require("../controllers/notificationController");
const { verifyToken } = require("../utils/authMiddleware");

// RESTful routes
router.get("/", verifyToken, controller.getAllNotifications);
router.patch("/read-all", verifyToken, controller.markAllAsRead);
router.patch("/:id/read", verifyToken, controller.markAsRead);
router.patch("/:id/mark-read", verifyToken, controller.markAsRead); // Thêm alias để khớp với frontend
router.delete("/:id", verifyToken, controller.deleteNotification);

// Recipient based routes
router.get("/recipient/:recipientType/:recipientId", verifyToken, controller.getByRecipient);
router.get("/unread/:recipientType/:recipientId", verifyToken, controller.getUnreadCount);

// Compatibility aliases for frontend constants
router.get("/recipient/ordered", verifyToken, (req, res, next) => {
    // Chuyển query params thành path params cho controller
    req.params.recipientType = req.query.recipientType;
    req.params.recipientId = req.query.recipientId;
    controller.getByRecipient(req, res, next);
});

router.get("/recipient/unread-count", verifyToken, (req, res, next) => {
    req.params.recipientType = req.query.recipientType;
    req.params.recipientId = req.query.recipientId;
    controller.getUnreadCount(req, res, next);
});

router.patch("/recipient/mark-all-read", verifyToken, controller.markAllAsRead);

module.exports = router;
